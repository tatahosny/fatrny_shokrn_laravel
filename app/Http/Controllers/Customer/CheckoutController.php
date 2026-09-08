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
        $user = auth()->user();
        $customer = $user->customer ?? \App\Models\Customer::firstOrCreate(
            ['user_id' => $user->id],
            ['student_status' => 'PENDING']
        );

        $addresses = $customer->addresses()->get();

        return Inertia::render('Customer/Checkout', [
            'customer'  => $customer,
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $customer = $user->customer ?? \App\Models\Customer::firstOrCreate(
            ['user_id' => $user->id],
            ['student_status' => 'PENDING']
        );

        // Normalize payload fields in case called from Cart or Checkout modal
        if (!$request->has('address') && $request->filled('delivery_address')) {
            $request->merge(['address' => $request->input('delivery_address')]);
        }
        if (!$request->has('payment_method')) {
            $request->merge(['payment_method' => 'CASH_ON_DELIVERY']);
        }
        if (!$request->has('customer_notes') && $request->filled('notes')) {
            $request->merge(['customer_notes' => $request->input('notes')]);
        }

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
