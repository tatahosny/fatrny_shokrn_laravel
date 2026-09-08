<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\DeliveryDriver;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    private function getRestaurantOrAbort()
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);
        return $restaurant;
    }

    public function index(Request $request): Response
    {
        $restaurant = $this->getRestaurantOrAbort();
        $rid = $restaurant->id;

        $query = Order::where('restaurant_id', $rid)
            ->with([
                'customer.user:id,name,phone',
                'deliveryDriver:id,name,phone,availability_status',
                'items.menuItem:id,name,image'
            ])
            ->latest();

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Summary counts for tabs & KPIs
        $counts = [
            'all'               => Order::where('restaurant_id', $rid)->count(),
            'pending'           => Order::where('restaurant_id', $rid)->where('status', 'PENDING')->count(),
            'confirmed'         => Order::where('restaurant_id', $rid)->where('status', 'CONFIRMED')->count(),
            'preparing'         => Order::where('restaurant_id', $rid)->where('status', 'PREPARING')->count(),
            'ready_for_pickup'  => Order::where('restaurant_id', $rid)->where('status', 'READY_FOR_PICKUP')->count(),
            'out_for_delivery'  => Order::where('restaurant_id', $rid)->where('status', 'OUT_FOR_DELIVERY')->count(),
            'delivered'         => Order::where('restaurant_id', $rid)->where('status', 'DELIVERED')->count(),
            'cancelled'         => Order::where('restaurant_id', $rid)->whereIn('status', ['CANCELLED', 'REJECTED'])->count(),
            'today_orders'      => Order::where('restaurant_id', $rid)->whereDate('created_at', today())->count(),
            'today_revenue'     => (float) Order::where('restaurant_id', $rid)->where('status', 'DELIVERED')->whereDate('updated_at', today())->sum('total_amount'),
        ];

        $availableDrivers = DeliveryDriver::where('restaurant_id', $rid)
            ->where('is_active', true)
            ->where('availability_status', 'AVAILABLE')
            ->get(['id', 'name', 'phone']);

        return Inertia::render('Restaurant/Orders/Index', [
            'orders'            => $query->paginate(15)->withQueryString(),
            'filters'           => $request->only(['status', 'search']),
            'counts'            => $counts,
            'available_drivers' => $availableDrivers,
            'restaurant'        => $restaurant,
        ]);
    }

    public function show(int $id): Response
    {
        $restaurant = $this->getRestaurantOrAbort();

        // SECURITY: Verify order belongs to this restaurant
        $order = Order::where('restaurant_id', $restaurant->id)
            ->with(['customer.user', 'items', 'deliveryDriver', 'statusHistories'])
            ->findOrFail($id);

        $availableDrivers = DeliveryDriver::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->where('availability_status', 'AVAILABLE')
            ->get();

        return Inertia::render('Restaurant/Orders/Show', [
            'order'            => $order,
            'available_drivers'=> $availableDrivers,
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->getRestaurantOrAbort();

        $order = Order::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $request->validate([
            'status' => 'required|string',
            'notes'  => 'nullable|string',
        ]);

        $this->orderService->updateOrderStatus($order, $request->status, $request->notes, auth()->id());

        return back()->with('success', 'تم تحديث حالة الطلب.');
    }

    public function assignDriver(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->getRestaurantOrAbort();

        $order = Order::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $request->validate(['driver_id' => 'required|exists:delivery_drivers,id']);

        $driver = DeliveryDriver::where('restaurant_id', $restaurant->id)->findOrFail($request->driver_id);

        $this->orderService->assignDriver($order, $driver, auth()->id());

        return back()->with('success', "تم تعيين السائق {$driver->name} للطلب.");
    }
}
