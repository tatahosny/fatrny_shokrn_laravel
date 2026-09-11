<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\DeliveryDriver;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    private function getRestaurantOrAbort()
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);
        return $restaurant;
    }

    public function index(Request $request): Response
    {
        $restaurant = $this->getRestaurantOrAbort();
        $rid = $restaurant->id;

        $query = Order::where('restaurant_id', $rid)
            ->with([
                'customer.user:id,name,phone',
                'deliveryDriver:id,name,phone,availability_status',
                'items.menuItem:id,name,image'
            ])
            ->latest();

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Summary counts for tabs & KPIs
        $counts = [
            'all'               => Order::where('restaurant_id', $rid)->count(),
            'pending'           => Order::where('restaurant_id', $rid)->where('status', 'PENDING')->count(),
            'confirmed'         => Order::where('restaurant_id', $rid)->where('status', 'CONFIRMED')->count(),
            'preparing'         => Order::where('restaurant_id', $rid)->where('status', 'PREPARING')->count(),
            'ready_for_pickup'  => Order::where('restaurant_id', $rid)->where('status', 'READY_FOR_PICKUP')->count(),
            'out_for_delivery'  => Order::where('restaurant_id', $rid)->where('status', 'OUT_FOR_DELIVERY')->count(),
            'delivered'         => Order::where('restaurant_id', $rid)->where('status', 'DELIVERED')->count(),
            'cancelled'         => Order::where('restaurant_id', $rid)->whereIn('status', ['CANCELLED', 'REJECTED'])->count(),
            'today_orders'      => Order::where('restaurant_id', $rid)->whereDate('created_at', today())->count(),
            'today_revenue'     => (float) Order::where('restaurant_id', $rid)->where('status', 'DELIVERED')->whereDate('updated_at', today())->sum('total_amount'),
        ];

        $availableDrivers = DeliveryDriver::where('restaurant_id', $rid)
            ->where('is_active', true)
            ->where('availability_status', 'AVAILABLE')
            ->get(['id', 'name', 'phone']);

        return Inertia::render('Restaurant/Orders/Index', [
            'orders'            => $query->paginate(15)->withQueryString(),
            'filters'           => $request->only(['status', 'search']),
            'counts'            => $counts,
            'available_drivers' => $availableDrivers,
            'restaurant'        => $restaurant,
        ]);
    }

    public function show(int $id): Response
    {
        $restaurant = $this->getRestaurantOrAbort();

        // SECURITY: Verify order belongs to this restaurant
        $order = Order::where('restaurant_id', $restaurant->id)
            ->with(['customer.user', 'items', 'deliveryDriver', 'statusHistories', 'restaurant'])
            ->findOrFail($id);

        $availableDrivers = DeliveryDriver::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->where('availability_status', 'AVAILABLE')
            ->get();

        return Inertia::render('Restaurant/Orders/Show', [
            'order'            => $order,
            'available_drivers'=> $availableDrivers,
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->getRestaurantOrAbort();

        $order = Order::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $request->validate([
            'status' => 'required|string',
            'notes'  => 'nullable|string',
            'delivery_fee' => 'required_if:status,CONFIRMED|nullable|numeric|min:0|max:9999.99',
        ]);

        if ($request->status === 'CONFIRMED') {
            $deliveryFee = round((float) $request->input('delivery_fee'), 2);
            $order->update([
                'delivery_fee' => $deliveryFee,
                'total_amount' => max(0, (float) $order->subtotal - (float) $order->student_discount_amount + (float) $order->service_fee + $deliveryFee),
            ]);
        }

        $this->orderService->updateOrderStatus($order, $request->status, $request->notes, auth()->id());

        return back()->with('success', 'تم تحديث حالة الطلب.');
    }

    public function assignDriver(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->getRestaurantOrAbort();

        $order = Order::where('restaurant_id', $restaurant->id)->findOrFail($id);

        if (!in_array($order->status, ['READY_FOR_PICKUP', 'ASSIGNED_TO_DRIVER'])) {
            return back()->with('error', 'لا يمكن إسناد طيار للطلب إلا بعد اكتمال التجهيز وتحويل الطلب إلى (جاهز للاستلام).');
        }

        $request->validate(['driver_id' => 'required|exists:delivery_drivers,id']);

        $driver = DeliveryDriver::where('restaurant_id', $restaurant->id)->findOrFail($request->driver_id);

        $this->orderService->assignDriver($order, $driver, auth()->id());

        return back()->with('success', "تم تعيين السائق {$driver->name} للطلب.");
    }

    /**
     * Return the live driver GPS position for the restaurant map.
     * Called every ~6 s by the RestaurantOrderMap React component.
     */
    public function driverLocation(int $id): \Illuminate\Http\JsonResponse
    {
        $restaurant = $this->getRestaurantOrAbort();

        $order = Order::where('restaurant_id', $restaurant->id)
            ->with('deliveryDriver.user')
            ->findOrFail($id);

        $driver = $order->deliveryDriver;

        if (!$driver) {
            return response()->json(['latitude' => null, 'longitude' => null]);
        }

        // The delivery app saves the driver's live GPS position directly on the driver record.
        if ($driver->current_latitude && $driver->current_longitude) {
            return response()->json([
                'latitude'  => $driver->current_latitude,
                'longitude' => $driver->current_longitude,
                'heading'   => $driver->current_heading ?? 0,
                'speed'     => $driver->current_speed   ?? 0,
                'updated_at'=> $driver->updated_at,
            ]);
        }

        return response()->json(['latitude' => null, 'longitude' => null]);
    }
}
