<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Restaurant;
use App\Services\FinancialService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    public function __construct(protected FinancialService $financialService) {}

    public function index(Request $request): Response
    {
        $query = Restaurant::withCount(['orders', 'deliveryDrivers', 'staff'])
            ->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Admin/Restaurants/Index', [
            'restaurants' => $query->paginate(15)->withQueryString(),
            'filters'     => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Restaurants/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'                      => 'required|string|max:255',
            'description'               => 'nullable|string',
            'phone'                     => 'nullable|string|max:20',
            'whatsapp'                  => 'nullable|string|max:20',
            'email'                     => 'nullable|email',
            'address'                   => 'nullable|string',
            'latitude'                  => 'nullable|numeric',
            'longitude'                 => 'nullable|numeric',
            'opening_time'              => 'nullable|date_format:H:i',
            'closing_time'              => 'nullable|date_format:H:i',
            'minimum_order_amount'      => 'nullable|numeric|min:0',
            'delivery_fee'              => 'nullable|numeric|min:0',
            'estimated_delivery_time'   => 'nullable|integer|min:0',
            'student_discount_percentage'=> 'nullable|numeric|min:0|max:100',
            'commission_type'           => 'required|in:PERCENTAGE,FIXED,SUBSCRIPTION,HYBRID,NONE',
            'commission_percentage'     => 'nullable|numeric|min:0',
            'monthly_subscription_fee'  => 'nullable|numeric|min:0',
            'status'                    => 'required|in:ACTIVE,INACTIVE,PENDING',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);

        $restaurant = Restaurant::create($validated);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('restaurants/logos', 'public');
            $restaurant->update(['logo' => $path]);
        }

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('restaurants/covers', 'public');
            $restaurant->update(['cover_image' => $path]);
        }

        ActivityLog::log('RESTAURANT_CREATED', 'Restaurant', $restaurant->id, null, ['name' => $restaurant->name]);

        return redirect()->route('admin.restaurants.index')
            ->with('success', "تم إنشاء المطعم \"{$restaurant->name}\" بنجاح.");
    }

    public function show(int $id): Response
    {
        $restaurant = Restaurant::with(['staff.user', 'deliveryDrivers.user'])
            ->withCount(['orders', 'menuItems', 'categories'])
            ->findOrFail($id);

        $financialSummary = $this->financialService->getPlatformSummary();
        $restaurantFinancial = collect($this->financialService->getRestaurantFinancialTable())
            ->firstWhere('id', $id);

        return Inertia::render('Admin/Restaurants/Show', [
            'restaurant'          => $restaurant,
            'restaurant_financial'=> $restaurantFinancial,
        ]);
    }

    public function edit(int $id): Response
    {
        $restaurant = Restaurant::findOrFail($id);
        return Inertia::render('Admin/Restaurants/Edit', [
            'restaurant' => $restaurant,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);

        $validated = $request->validate([
            'name'                      => 'required|string|max:255',
            'description'               => 'nullable|string',
            'phone'                     => 'nullable|string|max:20',
            'whatsapp'                  => 'nullable|string|max:20',
            'email'                     => 'nullable|email',
            'address'                   => 'nullable|string',
            'latitude'                  => 'nullable|numeric',
            'longitude'                 => 'nullable|numeric',
            'opening_time'              => 'nullable|date_format:H:i',
            'closing_time'              => 'nullable|date_format:H:i',
            'minimum_order_amount'      => 'nullable|numeric|min:0',
            'delivery_fee'              => 'nullable|numeric|min:0',
            'estimated_delivery_time'   => 'nullable|integer|min:0',
            'student_discount_percentage'=> 'nullable|numeric|min:0|max:100',
            'commission_type'           => 'required|in:PERCENTAGE,FIXED,SUBSCRIPTION,HYBRID,NONE',
            'commission_percentage'     => 'nullable|numeric|min:0',
            'monthly_subscription_fee'  => 'nullable|numeric|min:0',
            'status'                    => 'required|in:ACTIVE,INACTIVE,PENDING,SUSPENDED',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('restaurants/logos', 'public');
            $validated['logo'] = $path;
        }

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('restaurants/covers', 'public');
            $validated['cover_image'] = $path;
        }

        $restaurant->update($validated);
        ActivityLog::log('RESTAURANT_UPDATED', 'Restaurant', $restaurant->id);

        return redirect()->route('admin.restaurants.index')
            ->with('success', "تم تحديث بيانات المطعم بنجاح.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        ActivityLog::log('RESTAURANT_DELETED', 'Restaurant', $restaurant->id, ['name' => $restaurant->name]);
        $restaurant->delete(); // Soft delete
        return redirect()->route('admin.restaurants.index')
            ->with('success', 'تم حذف المطعم بنجاح.');
    }

    public function suspend(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update(['status' => 'SUSPENDED']);
        ActivityLog::log('RESTAURANT_SUSPENDED', 'Restaurant', $restaurant->id);
        return back()->with('success', "تم تعليق المطعم \"{$restaurant->name}\".");
    }

    public function activate(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update(['status' => 'ACTIVE']);
        ActivityLog::log('RESTAURANT_ACTIVATED', 'Restaurant', $restaurant->id);
        return back()->with('success', "تم تفعيل المطعم \"{$restaurant->name}\".");
    }

    public function updateFinancialConfig(Request $request, int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);

        $validated = $request->validate([
            'commission_type'          => 'required|in:PERCENTAGE,FIXED,SUBSCRIPTION,HYBRID,NONE',
            'commission_percentage'    => 'nullable|numeric|min:0|max:100',
            'monthly_subscription_fee' => 'nullable|numeric|min:0',
            'billing_cycle'            => 'nullable|string',
            'payment_due_date'         => 'nullable|date',
        ]);

        $oldValues = $restaurant->only('commission_type', 'commission_percentage', 'monthly_subscription_fee');
        $restaurant->update($validated);

        ActivityLog::log('RESTAURANT_FINANCIAL_CONFIG_UPDATED', 'Restaurant', $restaurant->id, $oldValues, $validated);

        // Clear financial cache
        cache()->forget('public.featured_restaurants');

        return back()->with('success', 'تم تحديث الإعدادات المالية للمطعم.');
    }
}
