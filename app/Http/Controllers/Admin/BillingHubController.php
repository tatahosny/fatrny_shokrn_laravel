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
    //  Cancel invoice — if unpaid & restaurant has no paid invoices
    //  → hard-delete the entire restaurant from the system
    // ─────────────────────────────────────────────────────────────
    public function cancelInvoice(int $id): RedirectResponse
    {
        $invoice    = Invoice::with('restaurant')->findOrFail($id);
        $restaurant = $invoice->restaurant;
        $restaurantId = $invoice->restaurant_id;
        $restaurantName = $restaurant?->name ?? 'غير معروف';

        // Only unpaid invoices can be cancelled
        if ($invoice->status === 'PAID') {
            return back()->with('error', 'لا يمكن إلغاء فاتورة تم سدادها بالفعل.');
        }

        // Delete invoice items & collections first
        $invoice->items()->delete();
        $invoice->collections()->delete();
        $invoice->delete();

        if ($restaurant) {
            // Check if the restaurant has ANY paid invoice (excluding this one we just deleted)
            $hasPaid = Invoice::where('restaurant_id', $restaurantId)
                ->where('status', 'PAID')
                ->exists();

            if (!$hasPaid) {
                // ── No paid history at all → permanently delete the restaurant ──
                $staffEntries = \App\Models\RestaurantStaff::where('restaurant_id', $restaurant->id)->with('user')->get();
                $usersToClean = [];
                foreach ($staffEntries as $staff) {
                    if ($staff->user && in_array($staff->user->role, ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'])) {
                        $usersToClean[] = $staff->user;
                    }
                }

                // cascade deletes: categories, menu_items, offers, staff, orders, etc.
                $restaurant->forceDelete();

                foreach ($usersToClean as $user) {
                    if (!\App\Models\RestaurantStaff::where('user_id', $user->id)->exists()) {
                        $user->forceDelete();
                    }
                }

                ActivityLog::log('RESTAURANT_DELETED_NO_PAYMENT', 'Restaurant', $restaurantId, null, [
                    'name'   => $restaurantName,
                    'reason' => 'إلغاء الفاتورة الوحيدة غير المسددة',
                ]);

                return back()->with('success', "🗑️ تم إلغاء الفاتورة وحذف حساب المطعم «{$restaurantName}» نهائياً من النظام.");
            }

            // Restaurant has other paid invoices → just lift any active suspension
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

        ActivityLog::log('INVOICE_CANCELLED', 'Invoice', $id, null, [
            'restaurant_id' => $restaurantId,
        ]);

        return back()->with('success', '🗑️ تم إلغاء الفاتورة نهائياً.');
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

        $status = \Carbon\Carbon::parse($validated['due_date'])->isPast() ? 'OVERDUE' : 'ISSUED';

        $invoice = Invoice::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT),
            'restaurant_id'  => $validated['restaurant_id'],
            'issue_date'     => now()->toDateString(),
            'due_date'       => $validated['due_date'],
            'subtotal'       => $validated['subtotal'],
            'tax_amount'     => 0,
            'total_amount'   => $validated['subtotal'],
            'paid_amount'    => 0,
            'status'         => $status,
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

    // ─────────────────────────────────────────────────────────────
    //  Download / Print invoice as HTML page (open in new tab)
    // ─────────────────────────────────────────────────────────────
    public function downloadInvoice(int $id)
    {
        $invoice = Invoice::with(['restaurant', 'items'])->findOrFail($id);
        $restaurant = $invoice->restaurant;

        // Valid until = one month after issue date
        $validUntil = \Carbon\Carbon::parse($invoice->due_date)->addMonth()->format('Y-m-d');
        $issueDate  = \Carbon\Carbon::parse($invoice->issue_date)->format('d/m/Y');
        $dueDate    = \Carbon\Carbon::parse($invoice->due_date)->format('d/m/Y');
        $validUntilFmt = \Carbon\Carbon::parse($validUntil)->format('d/m/Y');
        $amount     = number_format((float) $invoice->total_amount, 2);
        $paidAmount = number_format((float) $invoice->paid_amount, 2);
        $dayOfMonth = \Carbon\Carbon::parse($invoice->issue_date)->format('d');

        $paymentMethodLabel = match($invoice->invoice_type) {
            'SUBSCRIPTION' => 'اشتراك شهري',
            'COMMISSION'   => 'عمولة مبيعات',
            'MANUAL'       => 'يدوي',
            default        => $invoice->invoice_type,
        };

        $statusLabel = match($invoice->status) {
            'PAID'           => 'مدفوعة ✅',
            'PARTIALLY_PAID' => 'مدفوعة جزئياً',
            'OVERDUE'        => 'متأخرة ⚠️',
            'ISSUED'         => 'صادرة',
            'CANCELLED'      => 'ملغاة',
            default          => $invoice->status,
        };

        $html = <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>فاتورة {$invoice->invoice_number} — فطرنا شكراً</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Cairo', sans-serif; background: #f8f4ef; color: #1a1009; direction: rtl; }
  .page { max-width: 760px; margin: 2rem auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
  .header { background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 2rem 2.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { display: flex; flex-direction: column; gap: 4px; }
  .brand-name { font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em; }
  .brand-sub { font-size: 0.72rem; opacity: 0.85; font-weight: 600; letter-spacing: 0.1em; }
  .invoice-meta { text-align: left; }
  .invoice-num { font-size: 1.1rem; font-weight: 900; font-family: monospace; letter-spacing: 0.05em; }
  .invoice-date { font-size: 0.75rem; opacity: 0.85; margin-top: 4px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: rgba(255,255,255,0.2); margin-top: 8px; }
  .body { padding: 2.5rem; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
  .party-box { background: #fdf6ee; border: 1px solid #f5dfc0; border-radius: 12px; padding: 1.25rem; }
  .party-label { font-size: 0.62rem; font-weight: 800; color: #c2410c; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem; }
  .party-name { font-size: 1rem; font-weight: 900; color: #1a1009; }
  .party-detail { font-size: 0.78rem; color: #7c5c3a; margin-top: 4px; }
  .divider { border: none; border-top: 1px solid #f0e4d4; margin: 1.5rem 0; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
  .items-table th { background: #1a1009; color: #fed7aa; font-size: 0.72rem; font-weight: 700; padding: 0.75rem 1rem; text-align: right; }
  .items-table td { padding: 0.85rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #f0e4d4; }
  .items-table tr:last-child td { border-bottom: none; }
  .totals { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; background: #fdf6ee; border-radius: 12px; padding: 1.25rem; }
  .totals-row { display: flex; justify-content: space-between; width: 100%; font-size: 0.85rem; }
  .totals-row.grand { font-size: 1.1rem; font-weight: 900; color: #c2410c; border-top: 2px solid #f5dfc0; padding-top: 10px; margin-top: 4px; }
  .dates-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem; }
  .date-card { background: #fdf6ee; border: 1px solid #f5dfc0; border-radius: 10px; padding: 1rem; text-align: center; }
  .date-card .label { font-size: 0.62rem; font-weight: 800; color: #c2410c; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
  .date-card .val { font-size: 0.95rem; font-weight: 900; color: #1a1009; }
  .footer { background: #1a1009; color: #a8916b; padding: 1.25rem 2.5rem; text-align: center; font-size: 0.72rem; }
  .status-paid { color: #166534; background: #dcfce7; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
  .status-overdue { color: #991b1b; background: #fee2e2; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
  .status-other { color: #92400e; background: #fef3c7; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
  .watermark { color: #ea580c; font-size: 0.7rem; font-weight: 700; text-align: center; margin-top: 1.5rem; opacity: 0.6; }
  @media print {
    body { background: white; }
    .page { box-shadow: none; margin: 0; border-radius: 0; }
    .print-btn { display: none !important; }
  }
  .print-btn { display: block; text-align: center; margin-bottom: 1rem; }
  .print-btn button { background: #ea580c; color: white; border: none; padding: 10px 28px; border-radius: 10px; font-family: 'Cairo', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
</style>
</head>
<body>
<div class="print-btn"><button onclick="window.print()">🖨️ طباعة / تحميل PDF</button></div>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-name">🍽️ فطرنا شكراً</div>
      <div class="brand-sub">منصة توصيل الطعام — برج العرب</div>
      <div class="badge">{$paymentMethodLabel}</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-num">{$invoice->invoice_number}</div>
      <div class="invoice-date">تاريخ الإصدار: {$issueDate}</div>
    </div>
  </div>

  <div class="body">
    <div class="parties">
      <div class="party-box">
        <div class="party-label">إلى / المطعم</div>
        <div class="party-name">{$restaurant->name}</div>
        <div class="party-detail">معرّف المطعم: #{$restaurant->id}</div>
      </div>
      <div class="party-box">
        <div class="party-label">من / المُصدِر</div>
        <div class="party-name">منصة فطرنا شكراً</div>
        <div class="party-detail">النظام الإلكتروني الرسمي</div>
      </div>
    </div>

    <hr class="divider">

    <table class="items-table">
      <thead>
        <tr>
          <th>البيان</th>
          <th style="text-align:center">النوع</th>
          <th style="text-align:left">المبلغ (ج.م)</th>
        </tr>
      </thead>
      <tbody>
HTML;

        foreach ($invoice->items as $item) {
            $itemAmount = number_format((float) $item->amount, 2);
            $html .= "<tr><td>{$item->description}</td><td style='text-align:center'>{$paymentMethodLabel}</td><td style='text-align:left;font-weight:700'>{$itemAmount}</td></tr>";
        }

        $html .= <<<HTML
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>المجموع</span><span>{$amount} ج.م</span></div>
      <div class="totals-row"><span>المدفوع</span><span style="color:#166534;font-weight:700">{$paidAmount} ج.م</span></div>
      <div class="totals-row grand"><span>الإجمالي المستحق</span><span>{$amount} ج.م</span></div>
    </div>

    <div class="dates-grid">
      <div class="date-card">
        <div class="label">تاريخ الإصدار</div>
        <div class="val">{$issueDate}</div>
      </div>
      <div class="date-card">
        <div class="label">تاريخ الاستحقاق</div>
        <div class="val">{$dueDate}</div>
      </div>
      <div class="date-card">
        <div class="label">صالحة حتى</div>
        <div class="val">{$validUntilFmt}</div>
      </div>
    </div>

    <hr class="divider">

    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:0.8rem;color:#7c5c3a;">
        <strong>ملاحظات:</strong> {$invoice->notes}
      </div>
      <div>
HTML;
        if ($invoice->status === 'PAID') {
            $html .= '<span class="status-paid">مدفوعة ✅</span>';
        } elseif ($invoice->status === 'OVERDUE') {
            $html .= '<span class="status-overdue">متأخرة ⚠️</span>';
        } else {
            $html .= "<span class=\"status-other\">{$statusLabel}</span>";
        }

        $html .= <<<HTML
      </div>
    </div>

    <div class="watermark">هذه فاتورة إلكترونية رسمية صادرة من منصة فطرنا شكراً · يوم الإصدار: {$dayOfMonth} من الشهر</div>
  </div>

  <div class="footer">
    جميع الحقوق محفوظة &copy; منصة فطرنا شكراً · {$invoice->invoice_number}
  </div>
</div>
</body>
</html>
HTML;

        return response($html, 200)->header('Content-Type', 'text/html; charset=utf-8');
    }
}
