<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;

class CustomerDashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $customer = $user->customer ?? \App\Models\Customer::firstOrCreate(
            ['user_id' => $user->id],
            ['student_status' => 'PENDING']
        );

        $dashboard = Cache::remember("dashboard.customer.{$customer->id}", now()->addSeconds(10), function () use ($customer) {
        $recentOrders = Order::where('customer_id', $customer->id)
            ->with('restaurant:id,name,logo')
            ->latest()
            ->take(5)
            ->get();

        $activeOrder = Order::where('customer_id', $customer->id)
            ->whereNotIn('status', ['DELIVERED', 'CANCELLED', 'REJECTED', 'REFUNDED'])
            ->with(['restaurant:id,name', 'deliveryDriver:id,name,phone'])
            ->latest()
            ->first();

        return [
            'recent_orders' => $recentOrders,
            'active_order'  => $activeOrder,
        ];
        });

        return Inertia::render('Customer/Dashboard', ['customer' => $customer] + $dashboard);
    }
}
