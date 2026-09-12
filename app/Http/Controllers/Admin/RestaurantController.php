<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Restaurant;
use App\Models\RestaurantStaff;
use App\Models\User;
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
            ->with(['staff.user:id,name,email,phone,role'])
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
            'commission_type'           => 'required|in:PERCENTAGE,SUBSCRIPTION',
            'commission_percentage'     => 'nullable|numeric|min:0',
            'monthly_subscription_fee'  => 'nullable|numeric|min:0',
            'billing_day'               => 'nullable|integer|min:1|max:28',
            'owner_name'                => 'nullable|string|max:255',
            'owner_email'               => 'nullable|email|unique:users,email',
            'owner_password'            => 'nullable|string|min:6',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        // Restaurant account is SUSPENDED initially until the first invoice is approved / paid
        $validated['status'] = 'SUSPENDED';
        $validated['billing_suspended_at'] = now();
        $validated['suspension_reason'] = 'الحساب مقفول لعدم وجود فاتورة معتمدة ومسددة بعد';
        // billing_day: day-of-month when the auto-invoice is generated each month.
        // If not provided by admin, defaults to today's day.
        $validated['billing_day'] = $validated['billing_day'] ?? now()->day;

        $restaurantData = collect($validated)->except(['owner_name', 'owner_email', 'owner_password'])->toArray();
        $restaurant = Restaurant::create($restaurantData);

        // Create owner user if provided
        if (!empty($validated['owner_email']) && !empty($validated['owner_password'])) {
            // Only use the restaurant phone for the owner if it isn't already taken
            $ownerPhone = null;
            if (!empty($validated['phone'])) {
                $phoneExists = \App\Models\User::where('phone', $validated['phone'])->exists();
                $ownerPhone  = $phoneExists ? null : $validated['phone'];
            }

            $owner = \App\Models\User::create([
                'name'     => $validated['owner_name'] ?: $restaurant->name,
                'email'    => $validated['owner_email'],
                'password' => bcrypt($validated['owner_password']),
                'role'     => 'RESTAURANT_OWNER',
                'phone'    => $ownerPhone,
            ]);

            \App\Models\RestaurantStaff::create([
                'restaurant_id' => $restaurant->id,
                'user_id'       => $owner->id,
                'role'          => 'OWNER',
                'is_active'     => true,
            ]);
        }


        // Handle logo and cover image upload (unified)
        if ($request->hasFile('logo') || $request->hasFile('cover_image')) {
            $file = $request->file('logo') ?? $request->file('cover_image');
            $path = $file->store('restaurants/logos', 'public');
            $restaurant->update([
                'logo' => $path,
                'cover_image' => $path,
            ]);
        }

        // Auto-generate initial invoice
        $fee = (float) $restaurant->monthly_subscription_fee;
        if ($restaurant->commission_type === 'SUBSCRIPTION') {
            $amount = $fee > 0 ? $fee : 500.00;
            $invType = 'SUBSCRIPTION';
            $notes = 'فاتورة اشتراك الشهر الأول - يلزم الاعتماد لتفعيل المطعم';
        } else {
            $amount = $fee > 0 ? $fee : 250.00;
            $invType = 'COMMISSION';
            $notes = 'فاتورة تفعيل عقد العمولة (' . ($restaurant->commission_percentage ?? 10) . '%) - يلزم الاعتماد لتفعيل المطعم';
        }

        $invoice = \App\Models\Invoice::create([
            'restaurant_id'   => $restaurant->id,
            'invoice_number'  => 'INV-' . date('Ym') . '-' . str_pad($restaurant->id, 4, '0', STR_PAD_LEFT),
            'invoice_type'    => $invType,
            'issue_date'      => now()->toDateString(),
            'due_date'        => now()->addDays(7)->toDateString(),
            'subtotal'        => $amount,
            'tax_amount'      => 0,
            'discount_amount' => 0,
            'total_amount'    => $amount,
            'paid_amount'     => 0,
            'status'          => 'ISSUED',
            'notes'           => $notes,
        ]);

        \App\Models\InvoiceItem::create([
            'invoice_id'  => $invoice->id,
            'description' => $notes,
            'amount'      => $amount,
        ]);

        ActivityLog::log('RESTAURANT_CREATED', 'Restaurant', $restaurant->id, null, ['name' => $restaurant->name]);

        return redirect()->route('admin.restaurants.index')
            ->with('success', "تم إنشاء المطعم \"{$restaurant->name}\" بنجاح وإصدار الفاتورة الأولى رقم {$invoice->invoice_number}. الحساب مقفول تلقائياً حتى يتم اعتماد الفاتورة في مركز التحصيل.");
    }

    public function show(int $id): Response
    {
        $restaurant = Restaurant::with(['staff.user', 'deliveryDrivers.user'])
            ->withCount(['orders', 'menuItems', 'categories'])
            ->findOrFail($id);

        // Recent orders
        $recentOrders = \App\Models\Order::where('restaurant_id', $id)
            ->with(['customer.user', 'deliveryDriver:id,name'])
            ->latest()
            ->take(10)
            ->get();

        // Stats
        $delivered = \App\Models\Order::where('restaurant_id', $id)->where('status', 'DELIVERED');
        $stats = [
            'total_orders'        => \App\Models\Order::where('restaurant_id', $id)->count(),
            'completed_orders'    => (clone $delivered)->count(),
            'total_revenue'       => (float)(clone $delivered)->sum('total_amount'),
            'platform_commission' => (float)(clone $delivered)->sum('platform_commission_amount'),
            'avg_order_value'     => (float)((clone $delivered)->count() > 0
                ? (clone $delivered)->avg('total_amount')
                : 0),
            'active_menu_items'   => $restaurant->menu_items_count ?? 0,
        ];

        // Invoices
        $invoices = \App\Models\Invoice::where('restaurant_id', $id)->latest()->take(10)->get();

        return Inertia::render('Admin/Restaurants/Show', [
            'restaurant'   => $restaurant,
            'stats'        => $stats,
            'recentOrders' => $recentOrders,
            'invoices'     => $invoices,
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
            'delivery_base_fee'         => 'nullable|numeric|min:0',
            'estimated_delivery_time'   => 'nullable|integer|min:0',
            'student_discount_percentage'=> 'nullable|numeric|min:0|max:100',
            'commission_type'           => 'required|in:PERCENTAGE,SUBSCRIPTION',
            'commission_percentage'     => 'nullable|numeric|min:0',
            'monthly_subscription_fee'  => 'nullable|numeric|min:0',
            'status'                    => 'required|in:ACTIVE,INACTIVE,PENDING,SUSPENDED',
        ]);

        if ($request->hasFile('logo') || $request->hasFile('cover_image')) {
            $file = $request->file('logo') ?? $request->file('cover_image');
            $path = $file->store('restaurants/logos', 'public');
            $validated['logo'] = $path;
            $validated['cover_image'] = $path;
        }

        $restaurant->update($validated);
        ActivityLog::log('RESTAURANT_UPDATED', 'Restaurant', $restaurant->id);

        return redirect()->route('admin.restaurants.index')
            ->with('success', "تم تحديث بيانات المطعم بنجاح.");
    }

    public function destroyAccount(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $name = $restaurant->name;

        $staffEntries = RestaurantStaff::where('restaurant_id', $restaurant->id)->with('user')->get();
        $deletedCount = 0;

        foreach ($staffEntries as $staff) {
            $user = $staff->user;
            $staff->delete();

            if ($user && in_array($user->role, ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'])) {
                // If user is not associated with any other restaurant, permanently force-delete them
                $otherStaff = RestaurantStaff::where('user_id', $user->id)->exists();
                if (!$otherStaff) {
                    $user->forceDelete();
                    $deletedCount++;
                }
            }
        }

        ActivityLog::log('RESTAURANT_ACCOUNT_DELETED', 'Restaurant', $restaurant->id, null, [
            'name'                => $name,
            'deleted_users_count' => $deletedCount,
        ]);

        return back()->with('success', "تم إزالة حساب تسجيل الدخول الخاص بمطعم \"{$name}\" بنجاح، وتفريغ بيانات الدخول.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $name = $restaurant->name;

        // Retrieve linked staff users before cascade delete
        $staffEntries = RestaurantStaff::where('restaurant_id', $restaurant->id)->with('user')->get();
        $usersToClean = [];
        foreach ($staffEntries as $staff) {
            if ($staff->user && in_array($staff->user->role, ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'])) {
                $usersToClean[] = $staff->user;
            }
        }

        // Permanently force delete the restaurant (cascades to menu, categories, staff, offers, orders, invoices)
        $restaurant->forceDelete();

        // Delete orphaned user accounts from DB
        foreach ($usersToClean as $user) {
            $otherStaff = RestaurantStaff::where('user_id', $user->id)->exists();
            if (!$otherStaff) {
                $user->forceDelete();
            }
        }

        ActivityLog::log('RESTAURANT_DELETED', 'Restaurant', $id, null, ['name' => $name]);

        return redirect()->route('admin.restaurants.index')
            ->with('success', "تم حذف المطعم «{$name}» وكافة بياناته وحساباته نهائياً من النظام.");
    }

    public function suspend(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update([
            'status'               => 'SUSPENDED',
            'billing_suspended_at' => now(),
            'suspension_reason'    => 'تم إيقاف المطعم يدوياً من لوحة الإدارة',
        ]);
        ActivityLog::log('RESTAURANT_SUSPENDED', 'Restaurant', $restaurant->id);
        return back()->with('success', "تم تعليق المطعم \"{$restaurant->name}\".");
    }

    public function activate(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update([
            'status'               => 'ACTIVE',
            'billing_suspended_at' => null,
            'suspension_reason'    => null,
        ]);
        ActivityLog::log('RESTAURANT_ACTIVATED', 'Restaurant', $restaurant->id);
        return back()->with('success', "تم تفعيل المطعم \"{$restaurant->name}\".");
    }

    public function toggleStatus(int $id): RedirectResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        if ($restaurant->status === 'ACTIVE') {
            return $this->suspend($id);
        } else {
            return $this->activate($id);
        }
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
