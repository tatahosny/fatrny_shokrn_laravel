<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $driver = auth()->user()->deliveryDriver;
        abort_if(!$driver, 403, 'لا يوجد ملف مندوب توصيل مرتبط.');

        // CRITICAL: Only show orders assigned to THIS driver
        $activeOrders = Order::where('assigned_delivery_id', $driver->id)
            ->whereIn('status', ['ASSIGNED_TO_DRIVER', 'OUT_FOR_DELIVERY'])
            ->with(['customer.user', 'restaurant:id,name,phone,address', 'items'])
            ->latest()
            ->get();

        $completedToday = Order::where('assigned_delivery_id', $driver->id)
            ->where('status', 'DELIVERED')
            ->whereDate('updated_at', today())
            ->count();

        // Earnings today (total collected cash for DELIVERED orders today)
        $earningsToday = (float) Order::where('assigned_delivery_id', $driver->id)
            ->where('status', 'DELIVERED')
            ->whereDate('updated_at', today())
            ->sum('total_amount');

        // Weekly chart: last 7 days deliveries count
        $weeklyStats = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $weeklyStats[] = [
                'date'   => Carbon::now()->subDays($i)->locale('ar')->dayName,
                'orders' => Order::where('assigned_delivery_id', $driver->id)
                    ->where('status', 'DELIVERED')
                    ->whereDate('updated_at', $date)
                    ->count(),
            ];
        }

        return Inertia::render('Delivery/Dashboard', [
            'driver'          => $driver->load('restaurant:id,name,logo'),
            'active_orders'   => $activeOrders,
            'completed_today' => $completedToday,
            'earnings_today'  => $earningsToday,
            'weekly_stats'    => $weeklyStats,
        ]);
    }

    public function suspended(): Response
    {
        $driver = auth()->user()->deliveryDriver;
        $restaurant = $driver?->restaurant;
        $supportPhone = \App\Models\SystemSetting::where('key', 'support_phone')->value('value') ?? env('SUPPORT_PHONE', '01027961208');

        return Inertia::render('Delivery/Suspended', [
            'driver'       => $driver,
            'restaurant'   => $restaurant ? ['id' => $restaurant->id, 'name' => $restaurant->name] : null,
            'supportPhone' => $supportPhone,
        ]);
    }
}

