<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Order;
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
            ->whereDate('delivered_at', today())
            ->count();

        return Inertia::render('Delivery/Dashboard', [
            'driver'          => $driver->load('restaurant:id,name,logo'),
            'active_orders'   => $activeOrders,
            'completed_today' => $completedToday,
        ]);
    }
}
