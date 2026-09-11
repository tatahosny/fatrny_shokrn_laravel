<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\DeliveryDriver;
use App\Models\Order;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $restaurant = auth()->user()->restaurant;

        abort_if(!$restaurant, 403, 'لا يوجد مطعم مرتبط بهذا الحساب.');

        $restaurantId = $restaurant->id;
        $dashboard = Cache::remember("dashboard.restaurant.{$restaurantId}", now()->addSeconds(10), function () use ($restaurant, $restaurantId) {
        $today = Carbon::today();

        // Order stats — only THIS restaurant
        $stats = [
            'orders_today'     => Order::where('restaurant_id', $restaurantId)->whereDate('created_at', $today)->count(),
            'pending_orders'   => Order::where('restaurant_id', $restaurantId)->where('status', 'PENDING')->count(),
            'preparing_orders' => Order::where('restaurant_id', $restaurantId)->where('status', 'PREPARING')->count(),
            'ready_orders'     => Order::where('restaurant_id', $restaurantId)->where('status', 'READY_FOR_PICKUP')->count(),
            'delivered_orders' => Order::where('restaurant_id', $restaurantId)->whereDate('created_at', $today)->where('status', 'DELIVERED')->count(),
            'cancelled_orders' => Order::where('restaurant_id', $restaurantId)->whereDate('created_at', $today)->whereIn('status', ['CANCELLED', 'REJECTED'])->count(),
            'revenue_today'    => (float) Order::where('restaurant_id', $restaurantId)->whereDate('created_at', $today)->where('status', 'DELIVERED')->sum('total_amount'),
            'revenue_week'     => (float) Order::where('restaurant_id', $restaurantId)->where('created_at', '>=', Carbon::now()->startOfWeek())->where('status', 'DELIVERED')->sum('total_amount'),
            'revenue_month'    => (float) Order::where('restaurant_id', $restaurantId)->where('created_at', '>=', Carbon::now()->startOfMonth())->where('status', 'DELIVERED')->sum('total_amount'),
            'active_drivers'   => DeliveryDriver::where('restaurant_id', $restaurantId)->where('is_active', true)->where('availability_status', 'AVAILABLE')->count(),
        ];

        // Top selling items (last 30 days)
        $topItems = \App\Models\OrderItem::whereHas('order', fn($q) => $q->where('restaurant_id', $restaurantId)->where('status', 'DELIVERED')->where('created_at', '>=', now()->subDays(30)))
            ->selectRaw('name, SUM(quantity) as total_qty, SUM(total_price) as total_revenue')
            ->groupBy('name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // Recent orders
        $recentOrders = Order::where('restaurant_id', $restaurantId)
            ->with(['customer.user'])
            ->latest()
            ->take(10)
            ->get();

        // Subscription & Billing details for the restaurant
        $pendingInvoice = \App\Models\Invoice::where('restaurant_id', $restaurantId)
            ->whereNotIn('status', ['PAID', 'CANCELLED'])
            ->latest('due_date')
            ->first();

        $daysRemaining = null;
        $targetDueDate = $pendingInvoice?->due_date 
            ? Carbon::parse($pendingInvoice->due_date) 
            : ($restaurant->payment_due_date ? Carbon::parse($restaurant->payment_due_date) : null);

        if ($targetDueDate) {
            $daysDiff = (int) now()->startOfDay()->diffInDays($targetDueDate->startOfDay(), false);
            $daysRemaining = $daysDiff;
        }

        $billingInfo = [
            'payment_due_date'         => $targetDueDate?->format('Y-m-d'),
            'days_remaining'           => $daysRemaining,
            'is_overdue'               => $daysRemaining !== null && $daysRemaining < 0,
            'monthly_subscription_fee' => (float) ($restaurant->monthly_subscription_fee > 0 ? $restaurant->monthly_subscription_fee : 500.00),
            'has_unpaid_invoice'       => $pendingInvoice !== null,
            'unpaid_amount'            => $pendingInvoice ? (float) ($pendingInvoice->total_amount - $pendingInvoice->paid_amount) : 0,
            'invoice_number'           => $pendingInvoice?->invoice_number,
        ];

        return [
            'stats'        => $stats,
            'top_items'    => $topItems,
            'recent_orders'=> $recentOrders,
            'billing_info' => $billingInfo,
        ];
        });

        return Inertia::render('Restaurant/Dashboard', ['restaurant' => $restaurant] + $dashboard);
    }
}
