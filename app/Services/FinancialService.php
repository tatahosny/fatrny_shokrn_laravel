<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Expense;
use App\Models\FinancialRecord;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Restaurant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialService
{
    /**
     * Get overall platform financial summary.
     */
    public function getPlatformSummary(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        // Platform commissions from delivered orders
        $totalCommission = (float) FinancialRecord::where('status', '!=', 'CANCELLED')
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount');

        // Total order sales across platform
        $grossOrderSales = (float) Order::where('status', 'DELIVERED')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_amount');

        // Platform expenses
        $totalExpenses = (float) Expense::whereBetween('expense_date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');

        // Collections actually collected
        $collectedRevenue = (float) Collection::whereBetween('collection_date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');

        // Outstanding receivables from invoices
        $totalInvoiced = (float) Invoice::where('status', '!=', 'CANCELLED')->sum('total_amount');
        $totalPaidInvoices = (float) Invoice::where('status', '!=', 'CANCELLED')->sum('paid_amount');
        $outstandingReceivables = max(0, $totalInvoiced - $totalPaidInvoices);

        // Net Platform Profit
        $netProfit = $totalCommission - $totalExpenses;

        return [
            'gross_order_sales' => $grossOrderSales,
            'total_commission' => $totalCommission,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'collected_revenue' => $collectedRevenue,
            'outstanding_receivables' => $outstandingReceivables,
        ];
    }

    /**
     * Get financial status for each restaurant.
     */
    public function getRestaurantFinancialTable(): array
    {
        $restaurants = Restaurant::with(['financialRecords', 'invoices', 'collections'])->get();

        return $restaurants->map(function ($restaurant) {
            $totalCommissions = (float) $restaurant->financialRecords->where('status', '!=', 'CANCELLED')->sum('amount');
            $totalCollected = (float) $restaurant->collections->sum('amount');
            $totalInvoiced = (float) $restaurant->invoices->where('status', '!=', 'CANCELLED')->sum('total_amount');
            $paidInvoices = (float) $restaurant->invoices->where('status', '!=', 'CANCELLED')->sum('paid_amount');
            $dueAmount = max(0, $totalCommissions - $totalCollected);

            $status = 'PAID';
            if ($dueAmount > 0 && $totalCollected > 0) {
                $status = 'PARTIALLY_PAID';
            } elseif ($dueAmount > 0) {
                $status = 'PENDING';
            }

            return [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'slug' => $restaurant->slug,
                'commission_type' => $restaurant->commission_type,
                'commission_percentage' => $restaurant->commission_percentage,
                'monthly_subscription' => $restaurant->monthly_subscription_fee,
                'total_commission' => $totalCommissions,
                'due_amount' => $dueAmount,
                'collected' => $totalCollected,
                'status' => $status,
            ];
        })->toArray();
    }

    /**
     * Get Profit and Loss trends over the last 12 months.
     */
    public function getMonthlyProfitAndLoss(): array
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->translatedFormat('F Y');

            $revenue = (float) FinancialRecord::where('status', '!=', 'CANCELLED')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $expense = (float) Expense::whereBetween('expense_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->sum('amount');

            $months[] = [
                'month' => $monthLabel,
                'revenue' => $revenue,
                'expenses' => $expense,
                'profit' => $revenue - $expense,
            ];
        }

        return $months;
    }
}
