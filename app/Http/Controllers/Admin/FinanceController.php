<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\FinancialService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function __construct(protected FinancialService $financialService) {}

    public function overview(Request $request): Response
    {
        $startDate = $request->get('start_date');
        $endDate   = $request->get('end_date');

        $summary     = $this->financialService->getPlatformSummary($startDate, $endDate);
        $monthlyPnl  = $this->financialService->getMonthlyProfitAndLoss();

        // ── Platform-only profits (our earnings from subscriptions + commissions) ──
        $platformProfit = [
            'subscription_revenue' => $summary['subscription_revenue'],
            'commission_revenue'   => $summary['commission_revenue'],
            'total_platform_earn'  => $summary['total_revenue'],
            'total_expenses'       => $summary['total_expenses'],
            'net_profit'           => $summary['net_profit'],
            'outstanding'          => $summary['outstanding_receivables'],
        ];

        // ── Per-restaurant profits (their earnings from orders on the platform) ──
        $restaurants = Restaurant::select(
            'id', 'name', 'slug', 'status',
            'commission_type', 'commission_percentage', 'monthly_subscription_fee'
        )->get();

        $restaurantProfits = $restaurants->map(function ($r) {
            $base      = Order::where('restaurant_id', $r->id);
            $delivered = (clone $base)->where('status', 'DELIVERED');
            $cancelled = (clone $base)->whereIn('status', ['CANCELLED', 'REJECTED']);
            $pending   = (clone $base)->where('status', 'PENDING');

            $grossRevenue  = (float) (clone $delivered)->sum('total_amount');
            $deliveryFees  = (float) (clone $delivered)->sum('delivery_fee');
            $platformCut   = (float) (clone $delivered)->sum('platform_commission_amount');
            // Net = what the restaurant actually earns (gross - delivery - platform cut)
            $netEarn       = max(0, $grossRevenue - $deliveryFees - $platformCut);

            // Invoices & commission dues
            $invoices = Invoice::where('restaurant_id', $r->id)->where('status', '!=', 'CANCELLED')->get();
            $unpaidInvoices = $invoices->where('status', '!=', 'PAID');
            $dueAmount = $unpaidInvoices->sum(fn($inv) => (float)($inv->total_amount - $inv->paid_amount));
            $paidInvoicesAmount = $invoices->sum(fn($inv) => (float)$inv->paid_amount);
            $overdueCount = $unpaidInvoices->count();
            $totalCollected = (float) Collection::where('restaurant_id', $r->id)->sum('amount');

            return [
                'id'                  => $r->id,
                'name'                => $r->name,
                'slug'                => $r->slug,
                'status'              => $r->status,
                'commission_type'     => $r->commission_type,
                'commission_rate'     => (float) $r->commission_percentage,
                'subscription_fee'    => (float) $r->monthly_subscription_fee,
                'total_orders'        => (clone $base)->count(),
                'delivered_orders'    => (clone $delivered)->count(),
                'cancelled_orders'    => (clone $cancelled)->count(),
                'pending_orders'      => (clone $pending)->count(),
                'gross_revenue'       => round($grossRevenue, 2),
                'delivery_fees'       => round($deliveryFees, 2),
                'platform_cut'        => round($platformCut, 2),
                'net_restaurant_earn' => round($netEarn, 2),
                'unpaid_due'          => round($dueAmount, 2),
                'paid_amount'         => round(max($paidInvoicesAmount, $totalCollected), 2),
                'overdue_count'       => $overdueCount,
            ];
        })->toArray();

        // Total GMV across all delivered orders
        $totalGmv = Order::where('status', 'DELIVERED')->sum('total_amount');

        return Inertia::render('Admin/Finance/Overview', [
            'summary'            => $summary,
            'platform_profit'    => $platformProfit,
            'restaurant_profits' => $restaurantProfits,
            'monthly_pnl'        => $monthlyPnl,
            'total_gmv'          => (float) $totalGmv,
            'filters'            => $request->only('start_date', 'end_date'),
        ]);
    }

    public function revenue(Request $request): Response
    {
        $query = \App\Models\Order::with('restaurant:id,name')
            ->where('status', 'DELIVERED');

        if ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return Inertia::render('Admin/Finance/Revenue', [
            'orders'      => $query->latest()->paginate(20)->withQueryString(),
            'restaurants' => Restaurant::active()->get(['id', 'name']),
            'filters'     => $request->only('restaurant_id', 'date_from', 'date_to'),
            'summary'     => [
                'total' => $query->sum('total_amount'),
                'count' => $query->count(),
            ],
        ]);
    }

    public function expenses(Request $request): Response
    {
        $query = Expense::with(['category', 'creator'])
            ->latest('expense_date');

        if ($request->filled('category_id')) {
            $query->where('expense_category_id', $request->category_id);
        }

        return Inertia::render('Admin/Finance/Expenses', [
            'expenses'   => $query->paginate(20)->withQueryString(),
            'categories' => ExpenseCategory::all(),
            'total'      => $query->sum('amount'),
            'filters'    => $request->only('category_id'),
        ]);
    }

    public function storeExpense(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount'              => 'required|numeric|min:0.01',
            'description'         => 'nullable|string',
            'expense_date'        => 'required|date',
        ]);

        $validated['created_by_user_id'] = auth()->id();

        if ($request->hasFile('receipt_file')) {
            $validated['receipt_file'] = $request->file('receipt_file')->store('expenses/receipts', 'public');
        }

        Expense::create($validated);

        return back()->with('success', 'تم إضافة المصروف بنجاح.');
    }

    public function deleteExpense(int $id): RedirectResponse
    {
        Expense::findOrFail($id)->delete();
        return back()->with('success', 'تم حذف المصروف.');
    }

    public function profitLoss(Request $request): Response
    {
        $summary = $this->financialService->getPlatformSummary(
            $request->get('start_date'),
            $request->get('end_date')
        );
        $monthlyPnl = $this->financialService->getMonthlyProfitAndLoss();

        return Inertia::render('Admin/Finance/ProfitLoss', [
            'summary'     => $summary,
            'monthly_pnl' => $monthlyPnl,
            'filters'     => $request->only('start_date', 'end_date'),
        ]);
    }
}
