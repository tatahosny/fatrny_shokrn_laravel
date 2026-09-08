<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    public function index(): Response
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

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

        return Inertia::render('Customer/Dashboard', [
            'customer'      => $customer,
            'recent_orders' => $recentOrders,
            'active_order'  => $activeOrder,
        ]);
    }
}
