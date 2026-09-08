<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\DeliveryDriver;
use App\Models\FinancialRecord;
use App\Models\MenuItem;
use App\Models\MenuItemAddon;
use App\Models\MenuItemOptionValue;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Restaurant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Create a new order with atomic transaction safety and server-side pricing.
     */
    public function createOrder(Customer $customer, array $orderData): Order
    {
        return DB::transaction(function () use ($customer, $orderData) {
            $restaurantId = (int) $orderData['restaurant_id'];
            $restaurant = Restaurant::findOrFail($restaurantId);

            if ($restaurant->status !== 'ACTIVE') {
                throw ValidationException::withMessages([
                    'restaurant_id' => __('المطعم غير متاح لاستقبال الطلبات حالياً.'),
                ]);
            }

            $itemsData = $orderData['items'] ?? [];
            if (empty($itemsData)) {
                throw ValidationException::withMessages([
                    'items' => __('سلة المشتريات فارغة.'),
                ]);
            }

            $subtotal = 0.00;
            $preparedItems = [];

            foreach ($itemsData as $itemInput) {
                $menuItem = MenuItem::where('restaurant_id', $restaurantId)
                    ->where('is_available', true)
                    ->findOrFail($itemInput['menu_item_id']);

                $unitPrice = $menuItem->effective_price;
                $optionsPrice = 0.00;
                $addonsPrice = 0.00;

                $selectedOptions = [];
                if (!empty($itemInput['options'])) {
                    foreach ($itemInput['options'] as $optValId) {
                        $optionValue = MenuItemOptionValue::findOrFail($optValId);
                        $optionsPrice += (float) $optionValue->price;
                        $selectedOptions[] = [
                            'option_name' => $optionValue->option->name,
                            'value_name' => $optionValue->name,
                            'price' => (float) $optionValue->price,
                        ];
                    }
                }

                $selectedAddons = [];
                if (!empty($itemInput['addons'])) {
                    foreach ($itemInput['addons'] as $addonId) {
                        $addon = MenuItemAddon::where('is_available', true)->findOrFail($addonId);
                        $addonsPrice += (float) $addon->price;
                        $selectedAddons[] = [
                            'name' => $addon->name,
                            'price' => (float) $addon->price,
                        ];
                    }
                }

                $itemTotalUnit = $unitPrice + $optionsPrice + $addonsPrice;
                $quantity = max(1, (int) ($itemInput['quantity'] ?? 1));
                $itemTotalPrice = $itemTotalUnit * $quantity;

                $subtotal += $itemTotalPrice;

                $preparedItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'unit_price' => $itemTotalUnit,
                    'quantity' => $quantity,
                    'total_price' => $itemTotalPrice,
                    'selected_options' => $selectedOptions,
                    'selected_addons' => $selectedAddons,
                    'notes' => $itemInput['notes'] ?? null,
                ];
            }

            if ($subtotal < (float) $restaurant->minimum_order_amount) {
                throw ValidationException::withMessages([
                    'minimum_order' => "الحد الأدنى للطلب من هذا المطعم هو {$restaurant->minimum_order_amount} ج.م",
                ]);
            }

            // Student discount calculation
            $studentDiscount = 0.00;
            if ($customer->isVerifiedStudent() && (float) $restaurant->student_discount_percentage > 0) {
                $studentDiscount = round(($subtotal * (float) $restaurant->student_discount_percentage) / 100, 2);
            }

            $deliveryFee = (float) $restaurant->delivery_fee;
            $serviceFee = 0.00;
            $totalAmount = max(0, $subtotal - $studentDiscount + $deliveryFee + $serviceFee);

            // Platform commission calculation
            $platformCommission = 0.00;
            if ($restaurant->commission_type === 'PERCENTAGE') {
                $platformCommission = round(($subtotal * (float) $restaurant->commission_percentage) / 100, 2);
            } elseif ($restaurant->commission_type === 'FIXED') {
                $platformCommission = (float) $restaurant->commission_percentage;
            }

            // Generate unique human-readable order number
            $orderNumber = 'FS-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'restaurant_id' => $restaurant->id,
                'status' => 'PENDING',
                'payment_status' => 'PENDING',
                'payment_method' => $orderData['payment_method'] ?? 'CASH_ON_DELIVERY',
                'subtotal' => $subtotal,
                'discount_amount' => 0.00,
                'student_discount_amount' => $studentDiscount,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'total_amount' => $totalAmount,
                'platform_commission_amount' => $platformCommission,
                'address' => $orderData['address'] ?? '',
                'latitude' => $orderData['latitude'] ?? null,
                'longitude' => $orderData['longitude'] ?? null,
                'customer_notes' => $orderData['customer_notes'] ?? null,
            ]);

            foreach ($preparedItems as $item) {
                $order->items()->create($item);
            }

            // Log initial status
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'PENDING',
                'notes' => 'تم إنشاء الطلب بنجاح وهو في انتظار تأكيد المطعم.',
                'changed_by_user_id' => $customer->user_id,
            ]);

            // Create pending commission financial record
            if ($platformCommission > 0) {
                FinancialRecord::create([
                    'restaurant_id' => $restaurant->id,
                    'order_id' => $order->id,
                    'type' => 'ORDER_COMMISSION',
                    'amount' => $platformCommission,
                    'status' => 'PENDING',
                    'description' => "عمولة المنصة عن الطلب رقم {$order->order_number}",
                ]);
            }

            ActivityLog::log('ORDER_CREATED', 'Order', $order->id, null, ['order_number' => $orderNumber, 'total' => $totalAmount]);

            return $order->load(['items', 'restaurant', 'customer.user']);
        });
    }

    /**
     * Transition order status with safety rules and history logging.
     */
    public function updateOrderStatus(Order $order, string $newStatus, ?string $notes = null, ?int $userId = null): Order
    {
        $allowedTransitions = [
            'PENDING' => ['CONFIRMED', 'REJECTED', 'CANCELLED'],
            'CONFIRMED' => ['PREPARING', 'CANCELLED'],
            'PREPARING' => ['READY_FOR_PICKUP', 'CANCELLED'],
            'READY_FOR_PICKUP' => ['ASSIGNED_TO_DRIVER', 'OUT_FOR_DELIVERY', 'CANCELLED'],
            'ASSIGNED_TO_DRIVER' => ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'CANCELLED'],
            'OUT_FOR_DELIVERY' => ['DELIVERED', 'FAILED', 'CANCELLED'],
            'DELIVERED' => ['REFUNDED'],
            'REJECTED' => [],
            'CANCELLED' => [],
            'FAILED' => ['REFUNDED'],
            'REFUNDED' => [],
        ];

        $oldStatus = $order->status;
        if (!isset($allowedTransitions[$oldStatus]) || !in_array($newStatus, $allowedTransitions[$oldStatus])) {
            throw ValidationException::withMessages([
                'status' => "لا يمكن تغيير حالة الطلب من {$oldStatus} إلى {$newStatus}.",
            ]);
        }

        return DB::transaction(function () use ($order, $newStatus, $notes, $userId, $oldStatus) {
            $order->status = $newStatus;

            if ($newStatus === 'DELIVERED') {
                $order->delivered_at = now();
                $order->payment_status = 'PAID';
            } elseif (in_array($newStatus, ['REJECTED', 'CANCELLED'])) {
                // Cancel pending financial records for this order
                FinancialRecord::where('order_id', $order->id)->update(['status' => 'CANCELLED']);
            }

            $order->save();

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'notes' => $notes,
                'changed_by_user_id' => $userId ?? auth()->id(),
            ]);

            ActivityLog::log('ORDER_STATUS_CHANGED', 'Order', $order->id, ['status' => $oldStatus], ['status' => $newStatus, 'notes' => $notes]);

            return $order->fresh(['items', 'restaurant', 'customer.user', 'deliveryDriver', 'statusHistories']);
        });
    }

    /**
     * Assign a delivery driver to an order (Driver must belong to the same restaurant).
     */
    public function assignDriver(Order $order, DeliveryDriver $driver, ?int $userId = null): Order
    {
        if ($order->restaurant_id !== $driver->restaurant_id) {
            throw ValidationException::withMessages([
                'driver' => __('مندوب التوصيل لا ينتمي إلى نفس مطعم هذا الطلب.'),
            ]);
        }

        return DB::transaction(function () use ($order, $driver, $userId) {
            $order->assigned_delivery_id = $driver->id;
            $order->status = 'ASSIGNED_TO_DRIVER';
            $order->save();

            $driver->update(['availability_status' => 'BUSY']);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'ASSIGNED_TO_DRIVER',
                'notes' => "تم إسناد الطلب إلى مندوب التوصيل {$driver->name}.",
                'changed_by_user_id' => $userId ?? auth()->id(),
            ]);

            ActivityLog::log('DRIVER_ASSIGNED', 'Order', $order->id, null, ['driver_id' => $driver->id, 'driver_name' => $driver->name]);

            return $order->fresh(['items', 'restaurant', 'customer.user', 'deliveryDriver']);
        });
    }
}
