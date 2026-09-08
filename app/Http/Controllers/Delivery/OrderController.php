<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    private function driver()
    {
        $driver = auth()->user()->deliveryDriver;
        abort_if(!$driver, 403);
        return $driver;
    }

    public function index(): Response
    {
        $driver = $this->driver();

        // CRITICAL: All queries MUST scope to this driver only
        return Inertia::render('Delivery/OrderHistory', [
            'orders' => Order::where('assigned_delivery_id', $driver->id)
                ->with(['restaurant:id,name', 'customer.user'])
                ->latest()
                ->paginate(15),
        ]);
    }

    public function show(int $id): Response
    {
        $driver = $this->driver();

        // CRITICAL: Verify this order is assigned to this specific driver
        $order = Order::where('assigned_delivery_id', $driver->id)
            ->with([
                'customer.user',
                'restaurant:id,name,phone,address,latitude,longitude',
                'items',
            ])
            ->findOrFail($id);

        return Inertia::render('Delivery/ActiveOrder', [
            'order'  => $order,
            'driver' => $driver,
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $driver = $this->driver();

        // CRITICAL: Only allow status updates on orders assigned to this driver
        $order = Order::where('assigned_delivery_id', $driver->id)->findOrFail($id);

        $request->validate([
            'status' => 'required|in:OUT_FOR_DELIVERY,DELIVERED',
        ]);

        // Drivers can ONLY move status forward (OUT_FOR_DELIVERY or DELIVERED)
        // They cannot cancel, reject, or go backwards
        $this->orderService->updateOrderStatus($order, $request->status, null, auth()->id());

        if ($request->status === 'DELIVERED') {
            $driver->update(['availability_status' => 'AVAILABLE']);
        }

        return back()->with('success', 'تم تحديث حالة التوصيل.');
    }
}
