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

        $todayCount = Order::where('assigned_delivery_id', $driver->id)
            ->where('status', 'DELIVERED')
            ->whereDate('updated_at', today())
            ->count();

        $todayEarnings = (float) Order::where('assigned_delivery_id', $driver->id)
            ->where('status', 'DELIVERED')
            ->whereDate('updated_at', today())
            ->sum('total_amount');

        $totalCount = Order::where('assigned_delivery_id', $driver->id)
            ->where('status', 'DELIVERED')
            ->count();

        $activeOrders = Order::where('assigned_delivery_id', $driver->id)
            ->whereIn('status', ['ASSIGNED_TO_DRIVER', 'OUT_FOR_DELIVERY'])
            ->with(['restaurant:id,name,phone,address', 'customer.user', 'items'])
            ->latest()
            ->get();

        $todayOrders = Order::where('assigned_delivery_id', $driver->id)
            ->whereDate('created_at', today())
            ->with(['restaurant:id,name,phone,address', 'customer.user', 'items'])
            ->latest()
            ->get();

        // CRITICAL: All queries MUST scope to this driver only
        return Inertia::render('Delivery/OrderHistory', [
            'orders'         => Order::where('assigned_delivery_id', $driver->id)
                ->with(['restaurant:id,name,phone,address', 'customer.user', 'items'])
                ->latest()
                ->paginate(20),
            'today_orders'   => $todayOrders,
            'active_orders'  => $activeOrders,
            'today_count'    => $todayCount,
            'today_earnings' => $todayEarnings,
            'total_count'    => $totalCount,
        ]);
    }

    public function activeOrder()
    {
        $driver = $this->driver();

        $order = Order::where('assigned_delivery_id', $driver->id)
            ->whereIn('status', ['ASSIGNED_TO_DRIVER', 'OUT_FOR_DELIVERY'])
            ->with([
                'customer.user',
                'restaurant:id,name,phone,address,latitude,longitude',
                'items',
            ])
            ->latest()
            ->first();

        if (!$order) {
            return redirect()->route('delivery.dashboard')->with('error', 'لا يوجد طلب نشط حالياً للتوصيل.');
        }

        return Inertia::render('Delivery/ActiveOrder', [
            'order'  => $order,
            'driver' => $driver,
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

        \Illuminate\Support\Facades\Cache::forget("dashboard.driver.{$driver->id}");

        return back()->with('success', 'تم تحديث حالة التوصيل.');
    }

    public function updateLocation(Request $request, int $id)
    {
        return $this->updateGlobalLocation($request);
    }

    /**
     * Continuously update driver's GPS location while logged in.
     */
    public function updateGlobalLocation(Request $request)
    {
        $driver = $this->driver();
        $validated = $request->validate([
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'speed'     => 'nullable|numeric',
            'heading'   => 'nullable|numeric',
        ]);

        $driver->update([
            'current_latitude'  => $validated['latitude'],
            'current_longitude' => $validated['longitude'],
            'current_speed'     => $validated['speed'] ?? $driver->current_speed,
            'current_heading'   => $validated['heading'] ?? $driver->current_heading,
        ]);

        return response()->json([
            'success'   => true,
            'latitude'  => $driver->current_latitude,
            'longitude' => $driver->current_longitude,
        ]);
    }
}
