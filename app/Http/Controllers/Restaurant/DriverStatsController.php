<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\DeliveryDriver;
use App\Models\Order;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DriverStatsController extends Controller
{
    private function restaurant()
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403, 'غير مصرح بالدخول — حساب المطعم غير متوفر.');
        return $restaurant;
    }

    public function index(): Response
    {
        $restaurant = $this->restaurant();
        $rid = $restaurant->id;

        // Drivers associated with this restaurant or who delivered orders for it
        $assignedDriverIds = Order::where('restaurant_id', $rid)
            ->whereNotNull('assigned_delivery_id')
            ->distinct()
            ->pluck('assigned_delivery_id')
            ->toArray();

        $drivers = DeliveryDriver::where('restaurant_id', $rid)
            ->orWhereIn('id', $assignedDriverIds)
            ->with('user')
            ->get();

        // Calculate detailed per-driver statistics
        $driverStats = $drivers->map(function ($driver) use ($rid) {
            $base = Order::where('restaurant_id', $rid)
                ->where('assigned_delivery_id', $driver->id);

            $deliveredBase = (clone $base)->where('status', 'DELIVERED');

            $totalOrders   = (clone $deliveredBase)->count();
            $todayOrders   = (clone $deliveredBase)->whereDate('updated_at', today())->count();
            $activeOrders  = (clone $base)->whereIn('status', ['ASSIGNED_TO_DRIVER', 'OUT_FOR_DELIVERY'])->count();
            $todayEarnings = (float) (clone $deliveredBase)->whereDate('updated_at', today())->sum('total_amount');
            $totalEarnings = (float) (clone $deliveredBase)->sum('total_amount');

            $lastOrder = (clone $deliveredBase)->latest('updated_at')->first();
            $lastOrderAt = $lastOrder ? $lastOrder->updated_at->diffForHumans() : null;

            // Last 7 days activity breakdown
            $daily = [];
            for ($i = 6; $i >= 0; $i--) {
                $targetDate = Carbon::now()->subDays($i);
                $dateStr    = $targetDate->toDateString();
                $dayName    = $targetDate->locale('ar')->dayName;

                $daily[] = [
                    'date'   => $dayName,
                    'orders' => (clone $deliveredBase)->whereDate('updated_at', $dateStr)->count(),
                ];
            }

            return [
                'id'                  => $driver->id,
                'name'                => $driver->name,
                'phone'               => $driver->phone,
                'is_active'           => (bool) $driver->is_active,
                'availability_status' => $driver->availability_status,
                'total_orders'        => $totalOrders,
                'today_orders'        => $todayOrders,
                'active_orders'       => $activeOrders,
                'today_earnings'      => $todayEarnings,
                'total_earnings'      => $totalEarnings,
                'last_order_at'       => $lastOrderAt,
                'daily'               => $daily,
            ];
        })->sortByDesc('total_orders')->values();

        // Summary metrics
        $totalDrivers     = $drivers->count();
        $availableDrivers = $drivers->where('is_active', true)->where('availability_status', 'AVAILABLE')->count();
        $busyDrivers      = $drivers->where('is_active', true)->where('availability_status', 'BUSY')->count();

        $todayDeliveredOrders = Order::where('restaurant_id', $rid)
            ->where('status', 'DELIVERED')
            ->whereDate('updated_at', today())
            ->count();

        $todayTotalAmount = (float) Order::where('restaurant_id', $rid)
            ->where('status', 'DELIVERED')
            ->whereDate('updated_at', today())
            ->sum('total_amount');

        $totalDeliveredOrders = Order::where('restaurant_id', $rid)
            ->where('status', 'DELIVERED')
            ->count();

        $topDriver = $driverStats->first();

        // Comparison chart data (top 6 drivers by total orders)
        $comparisonChart = $driverStats->take(6)->map(function ($d) {
            return [
                'name'         => $d['name'],
                'total_orders' => $d['total_orders'],
                'today_orders' => $d['today_orders'],
                'earnings'     => $d['total_earnings'],
            ];
        });

        // 14 days overall delivery timeline for restaurant
        $timelineChart = [];
        for ($i = 13; $i >= 0; $i--) {
            $dt      = Carbon::now()->subDays($i);
            $dtStr   = $dt->toDateString();
            $label   = $dt->format('m/d');

            $timelineChart[] = [
                'date'    => $label,
                'day'     => $dt->locale('ar')->dayName,
                'orders'  => Order::where('restaurant_id', $rid)->where('status', 'DELIVERED')->whereDate('updated_at', $dtStr)->count(),
            ];
        }

        return Inertia::render('Restaurant/DriverStats/Index', [
            'driver_stats'     => $driverStats,
            'summary'          => [
                'total_drivers'          => $totalDrivers,
                'available_drivers'      => $availableDrivers,
                'busy_drivers'           => $busyDrivers,
                'today_delivered_orders' => $todayDeliveredOrders,
                'today_total_amount'     => $todayTotalAmount,
                'total_delivered_orders' => $totalDeliveredOrders,
                'top_driver'             => $topDriver,
            ],
            'comparison_chart' => $comparisonChart,
            'timeline_chart'   => $timelineChart,
            'restaurant'       => $restaurant,
        ]);
    }
}
