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
        $query = Order::with(['customer.user', 'restaurant:id,name', 'deliveryDriver:id,name'])
            ->latest();

        if ($request->filled('search')) {
            $query->where('order_number', 'like', "%{$request->search}%");
        }
        if ($request->filled('status')) {
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

        return Inertia::render('Admin/Orders/Index', [
            'orders'  => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('search', 'status', 'restaurant_id', 'date_from', 'date_to'),
        ]);
    }

    public function show(int $id): Response
    {
        $order = Order::with([
            'customer.user',
            'restaurant',
            'items',
            'deliveryDriver.user',
            'statusHistories' => fn($q) => $q->orderBy('created_at'),
        ])->findOrFail($id);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }
}
