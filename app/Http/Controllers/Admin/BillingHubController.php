<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Collection;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingHubController extends Controller
{
    // ─────────────────────────────────────────────────────────────
    //  Main page — combines everything
    // ─────────────────────────────────────────────────────────────
    public function index(Request $request): Response
    {
        // ── Summary stats ────────────────────────────────────────
        $totalRevenue   = Invoice::where('status', 'PAID')->sum('total_amount');
        $totalPending   = Invoice::whereNotIn('status', ['PAID', 'CANCELLED'])->sum('total_amount')
                        - Invoice::whereNotIn('status', ['PAID', 'CANCELLED'])->sum('paid_amount');
        $totalOverdue   = Invoice::whereNotIn('status', ['PAID', 'CANCELLED'])->count();
        $totalCollected = Collection::sum('amount');

        // ── Invoices (latest 50) ─────────────────────────────────
        $invoicesQuery = Invoice::with('restaurant:id,name,status,billing_suspended_at')
            ->latest();

        if ($request->filled('inv_status')) {
            if ($request->inv_status === 'OVERDUE') {
                $invoicesQuery->whereNotIn('status', ['PAID', 'CANCELLED']);
            } else {
                $invoicesQuery->where('status', $request->inv_status);
            }
        }
        if ($request->filled('restaurant_id')) {
            $invoicesQuery->where('restaurant_id', $request->restaurant_id);
        }

        $invoices = $invoicesQuery->paginate(20, ['*'], 'inv_page')->withQueryString();

        // ── Collections (latest 30) ──────────────────────────────
        $collections = Collection::with(['restaurant:id,name', 'collectedByUser:id,name'])
            ->latest('collection_date')
            ->paginate(20, ['*'], 'col_page')
            ->withQueryString();

        // ── Overdue restaurants (for auto-lock panel) ────────────
        $overdueRestaurants = Restaurant::withCount([
                'invoices as overdue_invoices_count' => fn($q) => $q->whereNotIn('status', ['PAID', 'CANCELLED']),
            ])
            ->whereHas('invoices', fn($q) => $q->whereNotIn('status', ['PAID', 'CANCELLED']))
            ->get(['id', 'name', 'status', 'billing_suspended_at']);

        // ── All restaurants for select boxes ────────────────────
        $restaurants = Restaurant::orderBy('name')
            ->get(['id', 'name', 'status', 'commission_type', 'commission_percentage', 'monthly_subscription_fee']);

        return Inertia::render('Admin/Billing/Hub', [
            'stats' => [
                'total_revenue'   => round($totalRevenue, 2),
                'total_pending'   => round(max($totalPending, 0), 2),
                'overdue_count'   => $totalOverdue,
                'total_collected' => round($totalCollected, 2),
            ],
            'invoices'            => $invoices,
            'collections'         => $collections,
            'overdueRestaurants'  => $overdueRestaurants,
            'restaurants'         => $restaurants,
            'filters'             => $request->only('inv_status', 'restaurant_id'),
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  Auto-generate monthly invoices for all restaurants
    // ─────────────────────────────────────────────────────────────
    public function autoGenerate(Request $request): RedirectResponse
    {
        $restaurants   = Restaurant::all();
        $generated     = 0;
        $currentMonth  = now()->format('Y-m');

        foreach ($restaurants as $restaurant) {
            // Skip if already has an invoice this month
            if (Invoice::where('restaurant_id', $restaurant->id)
                    ->where('issue_date', 'like', "{$currentMonth}%")
                    ->exists()) {
                continue;
            }

            $amount = (float) $restaurant->monthly_subscription_fee;
            if ($amount <= 0) {
                $amount = 500.00; // اشتراك شهري ثابت افتراضي
            }
            $type = 'SUBSCRIPTION';

            $dueDate = now()->addDays(7)->toDateString();

            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT),
                'restaurant_id'  => $restaurant->id,
                'issue_date'     => now()->toDateString(),
                'due_date'       => $dueDate,
                'subtotal'       => $amount,
                'tax_amount'     => 0,
                'total_amount'   => $amount,
                'paid_amount'    => 0,
                'status'         => 'OVERDUE',
                'invoice_type'   => $type,
                'notes'          => 'فاتورة شهر ' . now()->translatedFormat('F Y'),
            ]);

            $invoice->items()->create([
                'description' => 'مستحقات منصة فطرنا شكراً لشهر ' . now()->translatedFormat('F Y'),
                'amount'      => $amount,
            ]);

            $restaurant->update(['payment_due_date' => $dueDate]);
            $generated++;
        }

        ActivityLog::log('BILLING_AUTO_GENERATE', 'Invoice', null, null, ['count' => $generated]);

        return back()->with('success', "✅ تم توليد {$generated} فاتورة تلقائياً لشهر " . now()->translatedFormat('F Y'));
    }

    // ─────────────────────────────────────────────────────────────
    //  Auto-lock all overdue restaurants
    // ─────────────────────────────────────────────────────────────
    public function autoLockOverdue(): RedirectResponse
    {
        $overdueInvoices = Invoice::with('restaurant')
            ->whereNotIn('status', ['PAID', 'CANCELLED'])
            ->get();

        $locked = 0;

        foreach ($overdueInvoices as $invoice) {
            $invoice->update(['status' => 'OVERDUE']);

            if ($invoice->restaurant && $invoice->restaurant->status !== 'SUSPENDED') {
                $invoice->restaurant->update([
                    'status'               => 'SUSPENDED',
                    'billing_suspended_at' => now(),
                    'suspension_reason'    => "عدم سداد الفاتورة رقم {$invoice->invoice_number}",
                ]);
                $locked++;
            }

            ActivityLog::log('RESTAURANT_AUTO_SUSPENDED', 'Invoice', $invoice->id, null, [
                'restaurant_id' => $invoice->restaurant_id,
            ]);
        }

        return back()->with('success', "🔒 تم قفل {$locked} حساب مطعم متأخر عن السداد تلقائياً.");
    }

    // ─────────────────────────────────────────────────────────────
    //  Record a collection (payment receipt)
    // ─────────────────────────────────────────────────────────────
    public function recordCollection(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'restaurant_id'   => 'required|exists:restaurants,id',
            'invoice_id'      => 'nullable|exists:invoices,id',
            'amount'          => 'required|numeric|min:0.01',
            'payment_method'  => 'required|string|max:50',
            'collection_date' => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        $validated['collected_by_user_id'] = auth()->id();

        $collection = Collection::create($validated);

        // Update linked invoice
        if ($collection->invoice_id) {
            $invoice    = $collection->invoice;
            if ($invoice) {
                $totalPaid = $invoice->collections()->sum('amount');
                $status    = $totalPaid >= $invoice->total_amount ? 'PAID'
                    : ($totalPaid > 0 ? 'PARTIALLY_PAID' : $invoice->status);
                $invoice->update(['paid_amount' => $totalPaid, 'status' => $status]);

                // Re-activate restaurant if fully paid and no other overdue invoices
                if ($status === 'PAID' && $invoice->restaurant) {
                    $hasOtherOverdue = Invoice::where('restaurant_id', $invoice->restaurant_id)
                        ->where('id', '!=', $invoice->id)
                        ->whereNotIn('status', ['PAID', 'CANCELLED'])
                        ->exists();

                    if (!$hasOtherOverdue) {
                        $invoice->restaurant->update([
                            'status'               => 'ACTIVE',
                            'billing_suspended_at' => null,
                            'suspension_reason'    => null,
                            'payment_due_date'     => now()->addMonth()->startOfDay(),
                        ]);
                    }
                }
            }
        }

        ActivityLog::log('COLLECTION_RECORDED', 'Collection', $collection->id, null, [
            'restaurant_id' => $validated['restaurant_id'],
            'amount'        => $validated['amount'],
        ]);

        return back()->with('success', '✅ تم تسجيل التحصيل بنجاح.');
    }

    // ─────────────────────────────────────────────────────────────
    //  Mark invoice as paid
    // ─────────────────────────────────────────────────────────────
    public function markInvoicePaid(int $id): RedirectResponse
    {
        $invoice = Invoice::with('restaurant')->findOrFail($id);
        $invoice->update([
            'status'      => 'PAID',
            'paid_amount' => $invoice->total_amount,
        ]);

        if ($invoice->restaurant) {
            $hasOtherOverdue = Invoice::where('restaurant_id', $invoice->restaurant_id)
                ->where('id', '!=', $invoice->id)
                ->whereNotIn('status', ['PAID', 'CANCELLED'])
                ->exists();

            if (!$hasOtherOverdue) {
                $invoice->restaurant->update([
                    'status'               => 'ACTIVE',
                    'billing_suspended_at' => null,
                    'suspension_reason'    => null,
                    'payment_due_date'     => now()->addMonth()->startOfDay(),
                ]);
            }
        }

        ActivityLog::log('INVOICE_MARKED_PAID', 'Invoice', $invoice->id);
        return back()->with('success', '✅ تم تسجيل الفاتورة كمدفوعة وتحديث موعد السداد القادم للشهر المقبل.');
    }

    // ─────────────────────────────────────────────────────────────
    //  Suspend a specific restaurant (billing)
    // ─────────────────────────────────────────────────────────────
    public function suspendRestaurant(int $id): RedirectResponse
    {
        $invoice = Invoice::with('restaurant')->findOrFail($id);
        $invoice->update(['status' => 'OVERDUE']);

        if ($invoice->restaurant) {
            $invoice->restaurant->update([
                'status'               => 'SUSPENDED',
                'billing_suspended_at' => now(),
                'suspension_reason'    => "عدم سداد الفاتورة رقم {$invoice->invoice_number} المستحقة في {$invoice->due_date}",
            ]);
        }

        ActivityLog::log('RESTAURANT_SUSPENDED_FOR_BILLING', 'Invoice', $invoice->id);
        return back()->with('warning', '🔒 تم إيقاف حساب المطعم بنجاح.');
    }

    // ─────────────────────────────────────────────────────────────
    //  Cancel invoice (Permanent removal so it never shows up)
    // ─────────────────────────────────────────────────────────────
    public function cancelInvoice(int $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);
        $restaurant = $invoice->restaurant;
        $restaurantId = $invoice->restaurant_id;

        $invoice->items()->delete();
        $invoice->collections()->delete();
        $invoice->delete();

        if ($restaurant) {
            $hasOtherOverdue = Invoice::where('restaurant_id', $restaurantId)
                ->whereNotIn('status', ['PAID', 'CANCELLED'])
                ->exists();

            if (!$hasOtherOverdue && $restaurant->status === 'SUSPENDED') {
                $restaurant->update([
                    'status'               => 'ACTIVE',
                    'billing_suspended_at' => null,
                    'suspension_reason'    => null,
                ]);
            }
        }

        ActivityLog::log('INVOICE_CANCELLED', 'Invoice', $id);
        return back()->with('success', '🗑️ تم إلغاء وحذف الفاتورة نهائياً.');
    }

    // ─────────────────────────────────────────────────────────────
    //  Create a manual invoice
    // ─────────────────────────────────────────────────────────────
    public function createInvoice(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'invoice_type'  => 'required|string|in:COMMISSION,SUBSCRIPTION,MANUAL',
            'subtotal'      => 'required|numeric|min:0.01',
            'due_date'      => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        $invoice = Invoice::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT),
            'restaurant_id'  => $validated['restaurant_id'],
            'issue_date'     => now()->toDateString(),
            'due_date'       => $validated['due_date'],
            'subtotal'       => $validated['subtotal'],
            'tax_amount'     => 0,
            'total_amount'   => $validated['subtotal'],
            'paid_amount'    => 0,
            'status'         => 'OVERDUE',
            'invoice_type'   => $validated['invoice_type'],
            'notes'          => $validated['notes'] ?? null,
        ]);

        $invoice->items()->create([
            'description' => $validated['invoice_type'] === 'SUBSCRIPTION'
                ? 'مستحقات الاشتراك الشهري'
                : 'مستحقات عمولة المبيعات',
            'amount' => $validated['subtotal'],
        ]);

        Restaurant::where('id', $validated['restaurant_id'])->update([
            'payment_due_date' => $validated['due_date'],
        ]);

        ActivityLog::log('INVOICE_CREATED', 'Invoice', $invoice->id, null, ['number' => $invoice->invoice_number]);
        return back()->with('success', "✅ تم إصدار الفاتورة {$invoice->invoice_number} بنجاح.");
    }

    // ─────────────────────────────────────────────────────────────
    //  Update an invoice (only if not paid)
    // ─────────────────────────────────────────────────────────────
    public function updateInvoice(Request $request, int $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status === 'PAID') {
            return back()->with('error', 'لا يمكن تعديل فاتورة تم سدادها بالفعل.');
        }

        $validated = $request->validate([
            'subtotal'     => 'required|numeric|min:0.01',
            'due_date'     => 'required|date',
            'invoice_type' => 'required|string|in:COMMISSION,SUBSCRIPTION,MANUAL',
            'notes'        => 'nullable|string',
        ]);

        $invoice->update([
            'subtotal'     => $validated['subtotal'],
            'total_amount' => $validated['subtotal'],
            'due_date'     => $validated['due_date'],
            'invoice_type' => $validated['invoice_type'],
            'notes'        => $validated['notes'] ?? null,
        ]);

        $item = $invoice->items()->first();
        if ($item) {
            $item->update([
                'amount'      => $validated['subtotal'],
                'description' => $validated['invoice_type'] === 'SUBSCRIPTION'
                    ? 'مستحقات الاشتراك الشهري'
                    : ($validated['invoice_type'] === 'COMMISSION' ? 'مستحقات عمولة المبيعات' : 'مستحقات منصة فطرنا شكراً'),
            ]);
        }

        ActivityLog::log('INVOICE_UPDATED', 'Invoice', $invoice->id, null, ['number' => $invoice->invoice_number]);

        return back()->with('success', "✅ تم تعديل الفاتورة {$invoice->invoice_number} بنجاح.");
    }
}
