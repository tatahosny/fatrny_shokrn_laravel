<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);
        $id = $restaurant->id;
        $now = Carbon::now();

        // Daily sales last 30 days
        $dailySales = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->toDateString();
            $dailySales[] = [
                'date'    => $date,
                'revenue' => (float) Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->whereDate('created_at', $date)->sum('total_amount'),
                'orders'  => Order::where('restaurant_id', $id)->whereDate('created_at', $date)->count(),
            ];
        }

        // Top items
        $topItems = \App\Models\OrderItem::whereHas('order', fn($q) => $q->where('restaurant_id', $id)->where('status', 'DELIVERED'))
            ->selectRaw('name, SUM(quantity) as qty, SUM(total_price) as revenue')
            ->groupBy('name')->orderByDesc('qty')->take(10)->get();

        // Average order value
        $avgOrderValue = (float) Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->avg('total_amount');

        // Cancellation rate
        $total = Order::where('restaurant_id', $id)->count();
        $cancelled = Order::where('restaurant_id', $id)->whereIn('status', ['CANCELLED', 'REJECTED'])->count();

        return Inertia::render('Restaurant/Analytics/Index', [
            'daily_sales'       => $dailySales,
            'top_items'         => $topItems,
            'avg_order_value'   => $avgOrderValue,
            'cancellation_rate' => $total > 0 ? round(($cancelled / $total) * 100, 1) : 0,
        ]);
    }
}
