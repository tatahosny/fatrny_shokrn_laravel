<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Expense;
use App\Models\ExpenseCategory;
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

        $summary = $this->financialService->getPlatformSummary($startDate, $endDate);
        $restaurantTable = $this->financialService->getRestaurantFinancialTable();
        $monthlyPnl = $this->financialService->getMonthlyProfitAndLoss();

        return Inertia::render('Admin/Finance/Overview', [
            'summary'          => $summary,
            'restaurant_table' => $restaurantTable,
            'monthly_pnl'      => $monthlyPnl,
            'filters'          => $request->only('start_date', 'end_date'),
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
            'summary'    => $summary,
            'monthly_pnl'=> $monthlyPnl,
            'filters'    => $request->only('start_date', 'end_date'),
        ]);
    }
}
