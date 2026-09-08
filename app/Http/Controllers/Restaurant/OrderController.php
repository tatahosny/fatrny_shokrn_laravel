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

        $query = Order::where('restaurant_id', $restaurant->id)
            ->with(['customer.user', 'deliveryDriver'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Restaurant/Orders/Index', [
            'orders'     => $query->paginate(20)->withQueryString(),
            'filters'    => $request->only('status'),
            'restaurant' => $restaurant,
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
