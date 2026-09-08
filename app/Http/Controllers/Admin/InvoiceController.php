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

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invoice::with('restaurant:id,name,status,billing_suspended_at,phone,commission_type,commission_percentage,monthly_subscription_fee')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        return Inertia::render('Admin/Invoices/Index', [
            'invoices'    => $query->paginate(15)->withQueryString(),
            'restaurants' => Restaurant::orderBy('name')->get(['id', 'name', 'status', 'commission_type', 'commission_percentage', 'monthly_subscription_fee']),
            'filters'     => $request->only('status', 'restaurant_id'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Invoices/Create', [
            'restaurants' => Restaurant::orderBy('name')->get(['id', 'name', 'commission_type', 'commission_percentage', 'monthly_subscription_fee']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'due_date'      => 'required|date',
            'notes'         => 'nullable|string',
            'invoice_type'  => 'nullable|string',
            'subtotal'      => 'nullable|numeric|min:0',
            'items'         => 'nullable|array',
            'items.*.description' => 'required_with:items|string',
            'items.*.quantity'    => 'required_with:items|integer|min:1',
            'items.*.unit_price'  => 'required_with:items|numeric|min:0',
        ]);

        $subtotal = 0;
        if (!empty($validated['items'])) {
            $subtotal = collect($validated['items'])->sum(
                fn($item) => $item['quantity'] * $item['unit_price']
            );
        } elseif (isset($validated['subtotal'])) {
            $subtotal = (float) $validated['subtotal'];
        }

        $taxAmount = 0;
        $totalAmount = $subtotal + $taxAmount;

        $invoice = Invoice::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT),
            'restaurant_id'  => $validated['restaurant_id'],
            'issue_date'     => now()->toDateString(),
            'due_date'       => $validated['due_date'],
            'subtotal'       => $subtotal,
            'tax_amount'     => $taxAmount,
            'total_amount'   => $totalAmount,
            'paid_amount'    => 0,
            'status'         => 'ISSUED',
            'invoice_type'   => $validated['invoice_type'] ?? 'COMMISSION',
            'notes'          => $validated['notes'] ?? null,
        ]);

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'amount'      => $item['quantity'] * $item['unit_price'],
                ]);
            }
        } else {
            $invoice->items()->create([
                'description' => 'مستحقات ' . ($invoice->invoice_type === 'SUBSCRIPTION' ? 'الاشتراك الشهري' : 'عمولة المبيعات'),
                'amount'      => $totalAmount,
            ]);
        }

        // Update restaurant payment_due_date
        Restaurant::where('id', $validated['restaurant_id'])->update([
            'payment_due_date' => $validated['due_date'],
        ]);

        ActivityLog::log('INVOICE_CREATED', 'Invoice', $invoice->id, null, ['number' => $invoice->invoice_number]);

        return redirect()->route('admin.invoices.index')
            ->with('success', "تم إصدار الفاتورة {$invoice->invoice_number} بنجاح.");
    }

    public function show(int $id): Response
    {
        $invoice = Invoice::with(['restaurant', 'items', 'collections'])->findOrFail($id);
        return Inertia::render('Admin/Invoices/Show', ['invoice' => $invoice]);
    }

    public function issue(int $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'ISSUED']);
        ActivityLog::log('INVOICE_ISSUED', 'Invoice', $invoice->id);
        return back()->with('success', 'تم إصدار الفاتورة.');
    }

    public function markPaid(int $id): RedirectResponse
    {
        $invoice = Invoice::with('restaurant')->findOrFail($id);
        $invoice->update([
            'status'      => 'PAID',
            'paid_amount' => $invoice->total_amount,
        ]);

        // If the restaurant is suspended due to billing, restore it
        if ($invoice->restaurant) {
            $hasOtherOverdue = Invoice::where('restaurant_id', $invoice->restaurant_id)
                ->where('id', '!=', $invoice->id)
                ->whereNotIn('status', ['PAID', 'CANCELLED'])
                ->where('due_date', '<', now()->toDateString())
                ->exists();

            if (!$hasOtherOverdue) {
                $invoice->restaurant->update([
                    'status'               => 'ACTIVE',
                    'billing_suspended_at' => null,
                    'suspension_reason'    => null,
                ]);
            }
        }

        ActivityLog::log('INVOICE_MARKED_PAID', 'Invoice', $invoice->id);
        return back()->with('success', 'تم تسجيل الفاتورة كمدفوعة وإعادة تفعيل حساب المطعم والكباتن التابعين له بنجاح.');
    }

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
        return back()->with('warning', 'تم إيقاف حساب المطعم وكافة كباتن التوصيل التابعين له بنجاح.');
    }

    public function autoGenerateMonthly(Request $request): RedirectResponse
    {
        $restaurants = Restaurant::all();
        $generatedCount = 0;
        $currentMonth = now()->format('Y-m');

        foreach ($restaurants as $restaurant) {
            // Check if already has an invoice for current month
            $exists = Invoice::where('restaurant_id', $restaurant->id)
                ->where('issue_date', 'like', "{$currentMonth}%")
                ->exists();

            if ($exists) {
                continue;
            }

            $amount = 0;
            $type = $restaurant->commission_type ?? 'SUBSCRIPTION';

            if ($type === 'MONTHLY_SUBSCRIPTION' || (float)$restaurant->monthly_subscription_fee > 0) {
                $amount = (float)$restaurant->monthly_subscription_fee;
                $type = 'SUBSCRIPTION';
            } elseif ($type === 'PERCENTAGE' && (float)$restaurant->commission_percentage > 0) {
                // Calculate from orders in the last 30 days
                $ordersTotal = Order::where('restaurant_id', $restaurant->id)
                    ->where('status', 'DELIVERED')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->sum('total_amount');
                $amount = round($ordersTotal * ((float)$restaurant->commission_percentage / 100), 2);
                $type = 'COMMISSION';
            }

            if ($amount <= 0) {
                $amount = 100.00; // Default minimum monthly platform fee
            }

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
                'status'         => 'ISSUED',
                'invoice_type'   => $type,
                'notes'          => "فاتورة شهر " . now()->translatedFormat('F Y'),
            ]);

            $invoice->items()->create([
                'description' => 'مستحقات منصة فطرني شكراً لشهر ' . now()->translatedFormat('F Y'),
                'amount'      => $amount,
            ]);

            $restaurant->update(['payment_due_date' => $dueDate]);
            $generatedCount++;
        }

        return back()->with('success', "تم توليد {$generatedCount} فاتورة جديدة بنجاح لشهر " . now()->translatedFormat('F Y'));
    }

    public function downloadPdf(int $id)
    {
        $invoice = Invoice::with(['restaurant', 'items'])->findOrFail($id);
        return response()->json(['message' => 'PDF preview', 'invoice' => $invoice]);
    }

    public function destroy(int $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'CANCELLED']);
        return back()->with('success', 'تم إلغاء الفاتورة.');
    }
}
