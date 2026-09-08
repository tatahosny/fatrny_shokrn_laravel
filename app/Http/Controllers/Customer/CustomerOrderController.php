<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    public function index(): Response
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        $orders = Order::where('customer_id', $customer->id)
            ->with('restaurant:id,name,logo')
            ->latest()
            ->paginate(10);

        return Inertia::render('Customer/Orders', ['orders' => $orders]);
    }

    public function show(string $orderNumber): Response
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        // SECURITY: Ensure customer can only see their own orders
        $order = Order::where('customer_id', $customer->id)
            ->where('order_number', $orderNumber)
            ->with([
                'restaurant:id,name,phone,logo,address',
                'items',
                'deliveryDriver:id,name,phone,profile_image',
                'statusHistories' => fn($q) => $q->orderBy('created_at'),
            ])
            ->firstOrFail();

        return Inertia::render('Customer/OrderDetails', ['order' => $order]);
    }
}
