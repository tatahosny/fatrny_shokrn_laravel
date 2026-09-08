<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(): Response
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        $addresses = $customer->addresses()->get();

        return Inertia::render('Customer/Checkout', [
            'customer'  => $customer,
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        $validated = $request->validate([
            'restaurant_id'  => 'required|integer|exists:restaurants,id',
            'items'          => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer',
            'items.*.quantity'     => 'required|integer|min:1|max:20',
            'items.*.options'      => 'nullable|array',
            'items.*.addons'       => 'nullable|array',
            'items.*.notes'        => 'nullable|string|max:255',
            'address'        => 'required|string|max:500',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'payment_method' => 'required|in:CASH_ON_DELIVERY',
            'customer_notes' => 'nullable|string|max:500',
        ]);

        $order = $this->orderService->createOrder($customer, $validated);

        return redirect()->route('customer.order.show', $order->order_number)
            ->with('success', "تم تقديم طلبك بنجاح! رقم الطلب: {$order->order_number}");
    }
}
