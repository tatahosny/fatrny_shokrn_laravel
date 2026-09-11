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
        $id  = $restaurant->id;
        $now = Carbon::now();

        // ── Order Status Totals (ALL TIME) ──────────────────────────────
        $totalOrders     = Order::where('restaurant_id', $id)->count();
        $deliveredOrders = Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->count();
        $cancelledOrders = Order::where('restaurant_id', $id)->whereIn('status', ['CANCELLED', 'REJECTED'])->count();
        $pendingOrders   = Order::where('restaurant_id', $id)->where('status', 'PENDING')->count();
        $preparingOrders = Order::where('restaurant_id', $id)->whereIn('status', ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'])->count();

        // ── Revenue Metrics ──────────────────────────────────────────────
        $grossRevenue   = (float) Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->sum('total_amount');
        $deliveryFees   = (float) Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->sum('delivery_fee');
        $platformCut    = (float) Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->sum('platform_commission_amount');
        $netEarnings    = max(0, $grossRevenue - $deliveryFees - $platformCut);
        $avgOrderValue  = $deliveredOrders > 0 ? round($grossRevenue / $deliveredOrders, 2) : 0;
        $cancellationRate = $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 1) : 0;
        $completionRate   = $totalOrders > 0 ? round(($deliveredOrders / $totalOrders) * 100, 1) : 0;

        // ── This Month vs Last Month ─────────────────────────────────────
        $thisMonthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth();

        $thisMonthRevenue = (float) Order::where('restaurant_id', $id)
            ->where('status', 'DELIVERED')
            ->where('created_at', '>=', $thisMonthStart)
            ->sum('total_amount');

        $lastMonthRevenue = (float) Order::where('restaurant_id', $id)
            ->where('status', 'DELIVERED')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total_amount');

        $thisMonthOrders = Order::where('restaurant_id', $id)
            ->where('status', 'DELIVERED')
            ->where('created_at', '>=', $thisMonthStart)
            ->count();

        $lastMonthOrders = Order::where('restaurant_id', $id)
            ->where('status', 'DELIVERED')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        // ── Daily Sales — last 30 days ───────────────────────────────────
        $dailySales = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->toDateString();
            $dayDelivered = Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->whereDate('created_at', $date);
            $dayCancelled = Order::where('restaurant_id', $id)->whereIn('status', ['CANCELLED', 'REJECTED'])->whereDate('created_at', $date);

            $dailySales[] = [
                'date'            => $date,
                'revenue'         => (float) (clone $dayDelivered)->sum('total_amount'),
                'delivered_count' => (clone $dayDelivered)->count(),
                'cancelled_count' => (clone $dayCancelled)->count(),
            ];
        }

        // ── Monthly Summary — last 6 months ─────────────────────────────
        $monthlySummary = [];
        for ($i = 5; $i >= 0; $i--) {
            $mStart = $now->copy()->subMonths($i)->startOfMonth();
            $mEnd   = $now->copy()->subMonths($i)->endOfMonth();
            $mDel   = Order::where('restaurant_id', $id)->where('status', 'DELIVERED')->whereBetween('created_at', [$mStart, $mEnd]);
            $mCan   = Order::where('restaurant_id', $id)->whereIn('status', ['CANCELLED', 'REJECTED'])->whereBetween('created_at', [$mStart, $mEnd]);

            $mRev  = (float) (clone $mDel)->sum('total_amount');
            $mFees = (float) (clone $mDel)->sum('delivery_fee');
            $mCut  = (float) (clone $mDel)->sum('platform_commission_amount');

            $monthlySummary[] = [
                'month'            => $mStart->translatedFormat('F Y'),
                'month_short'      => $mStart->format('M'),
                'year'             => $mStart->format('Y'),
                'revenue'          => $mRev,
                'net_earnings'     => max(0, $mRev - $mFees - $mCut),
                'delivered_orders' => (clone $mDel)->count(),
                'cancelled_orders' => (clone $mCan)->count(),
            ];
        }

        // ── Top Items ────────────────────────────────────────────────────
        $topItems = \App\Models\OrderItem::whereHas('order', fn($q) =>
            $q->where('restaurant_id', $id)->where('status', 'DELIVERED')
        )
        ->selectRaw('name, SUM(quantity) as qty, SUM(total_price) as revenue')
        ->groupBy('name')
        ->orderByDesc('revenue')
        ->take(10)
        ->get();

        return Inertia::render('Restaurant/Analytics/Index', [
            'stats' => [
                'total_orders'      => $totalOrders,
                'delivered_orders'  => $deliveredOrders,
                'cancelled_orders'  => $cancelledOrders,
                'pending_orders'    => $pendingOrders,
                'preparing_orders'  => $preparingOrders,
                'gross_revenue'     => round($grossRevenue, 2),
                'delivery_fees'     => round($deliveryFees, 2),
                'platform_cut'      => round($platformCut, 2),
                'net_earnings'      => round($netEarnings, 2),
                'avg_order_value'   => $avgOrderValue,
                'cancellation_rate' => $cancellationRate,
                'completion_rate'   => $completionRate,
                'this_month_revenue'=> round($thisMonthRevenue, 2),
                'last_month_revenue'=> round($lastMonthRevenue, 2),
                'this_month_orders' => $thisMonthOrders,
                'last_month_orders' => $lastMonthOrders,
            ],
            'daily_sales'    => $dailySales,
            'monthly_summary'=> $monthlySummary,
            'top_items'      => $topItems,
            'restaurant'     => $restaurant->only('id', 'name', 'commission_type', 'commission_percentage', 'monthly_subscription_fee'),
        ]);
    }
}
