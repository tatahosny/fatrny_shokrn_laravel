<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Collection;
use App\Models\Invoice;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invoice::with('restaurant:id,name')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        return Inertia::render('Admin/Invoices/Index', [
            'invoices'    => $query->paginate(15)->withQueryString(),
            'restaurants' => Restaurant::orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only('status', 'restaurant_id'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Invoices/Create', [
            'restaurants' => Restaurant::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'due_date'      => 'required|date|after:today',
            'notes'         => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);

        $subtotal = collect($validated['items'])->sum(
            fn($item) => $item['quantity'] * $item['unit_price']
        );
        $taxAmount = 0; // Configurable in future
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
            'status'         => 'DRAFT',
            'notes'          => $validated['notes'] ?? null,
            'created_by'     => auth()->id(),
        ]);

        foreach ($validated['items'] as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'total_price' => $item['quantity'] * $item['unit_price'],
            ]);
        }

        ActivityLog::log('INVOICE_CREATED', 'Invoice', $invoice->id, null, ['number' => $invoice->invoice_number]);

        return redirect()->route('admin.invoices.show', $invoice->id)
            ->with('success', "تم إنشاء الفاتورة {$invoice->invoice_number}.");
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
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'PAID', 'paid_amount' => $invoice->total_amount]);
        ActivityLog::log('INVOICE_MARKED_PAID', 'Invoice', $invoice->id);
        return back()->with('success', 'تم تسجيل الفاتورة كمدفوعة.');
    }

    public function downloadPdf(int $id)
    {
        // PDF generation placeholder — integrate dompdf/barryvdh in production
        $invoice = Invoice::with(['restaurant', 'items'])->findOrFail($id);
        return response()->json(['message' => 'PDF generation requires dompdf package', 'invoice' => $invoice]);
    }

    public function destroy(int $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'CANCELLED']);
        return back()->with('success', 'تم إلغاء الفاتورة.');
    }
}
