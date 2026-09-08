<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\DeliveryDriver;
use App\Models\Order;
use App\Models\Restaurant;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();

        // Top 10 restaurants by order count (this month)
        $topRestaurants = Restaurant::withCount([
            'orders as orders_this_month' => fn($q) => $q->where('created_at', '>=', $now->startOfMonth()),
        ])->withSum(
            ['orders as revenue_this_month' => fn($q) => $q->where('status', 'DELIVERED')
                ->where('created_at', '>=', $now->copy()->startOfMonth())],
            'total_amount'
        )->orderByDesc('orders_this_month')->take(10)->get(['id', 'name', 'logo']);

        // Order status breakdown
        $orderStatusBreakdown = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')->get();

        // Hourly order distribution (to find peak hours)
        $hourlyDistribution = Order::selectRaw('EXTRACT(HOUR FROM created_at) as hour, count(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupByRaw('EXTRACT(HOUR FROM created_at)')
            ->orderBy('hour')
            ->get();

        // Customer growth (last 6 months)
        $customerGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $customerGrowth[] = [
                'month' => $month->format('M Y'),
                'count' => Customer::whereYear('created_at', $month->year)
                               ->whereMonth('created_at', $month->month)->count(),
            ];
        }

        // Cancellation rate
        $totalOrders = Order::count();
        $cancelledOrders = Order::whereIn('status', ['CANCELLED', 'REJECTED'])->count();
        $cancellationRate = $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 1) : 0;

        return Inertia::render('Admin/Analytics/Index', [
            'top_restaurants'      => $topRestaurants,
            'order_status_breakdown' => $orderStatusBreakdown,
            'hourly_distribution'  => $hourlyDistribution,
            'customer_growth'      => $customerGrowth,
            'cancellation_rate'    => $cancellationRate,
            'total_orders'         => $totalOrders,
            'total_drivers'        => DeliveryDriver::where('is_active', true)->count(),
        ]);
    }
}
