<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(Request $request): Response
    {
        $query = Order::with([
            'customer.user:id,name,phone,email',
            'restaurant:id,name,phone,address',
            'deliveryDriver:id,name,phone,vehicle_type,availability_status',
            'items.menuItem:id,name,image',
        ])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('restaurant', function ($rq) use ($search) {
                      $rq->where('name', 'like', "%{$search}%");
                  });
            });
        }
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }
        if ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $statusCounts = [
            'ALL'              => Order::count(),
            'PENDING'          => Order::where('status', 'PENDING')->count(),
            'CONFIRMED'        => Order::where('status', 'CONFIRMED')->count(),
            'PREPARING'        => Order::where('status', 'PREPARING')->count(),
            'READY_FOR_PICKUP' => Order::where('status', 'READY_FOR_PICKUP')->count(),
            'OUT_FOR_DELIVERY' => Order::where('status', 'OUT_FOR_DELIVERY')->count(),
            'DELIVERED'        => Order::where('status', 'DELIVERED')->count(),
            'CANCELLED'        => Order::whereIn('status', ['CANCELLED', 'REJECTED'])->count(),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders'        => $query->paginate(20)->withQueryString(),
            'statusCounts'  => $statusCounts,
            'filters'       => $request->only('search', 'status', 'restaurant_id', 'date_from', 'date_to'),
        ]);
    }

    public function show(int $id): Response
    {
        $order = Order::with([
            'customer.user',
            'restaurant',
            'items.menuItem',
            'deliveryDriver.user',
            'statusHistories.changedByUser:id,name,role',
        ])->findOrFail($id);

        $availableDrivers = \App\Models\DeliveryDriver::where('is_active', true)
            ->get(['id', 'name', 'phone', 'vehicle_type', 'availability_status']);

        return Inertia::render('Admin/Orders/Show', [
            'order'             => $order,
            'available_drivers' => $availableDrivers,
        ]);
    }

    public function updateStatus(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $order = Order::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|string',
            'notes'  => 'nullable|string',
        ]);

        $this->orderService->updateStatus($order, $validated['status'], $validated['notes'] ?? null, auth()->id());

        return back()->with('success', "تم تحديث حالة الطلب إلى {$validated['status']} بنجاح.");
    }

    public function assignDriver(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $order = Order::findOrFail($id);
        $validated = $request->validate([
            'delivery_driver_id' => 'required|exists:delivery_drivers,id',
        ]);

        $this->orderService->assignDeliveryDriver($order, (int) $validated['delivery_driver_id'], auth()->id());

        return back()->with('success', 'تم تعيين كابتن التوصيل للطلب بنجاح.');
    }
}
