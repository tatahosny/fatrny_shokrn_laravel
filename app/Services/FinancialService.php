<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Restaurant;
use Carbon\Carbon;

class FinancialService
{
    /**
     * Get overall platform financial summary aligned directly with Billing Hub.
     */
    public function getPlatformSummary(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        // Total GMV from delivered orders
        $totalGmv = (float) Order::where('status', 'DELIVERED')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_amount');

        // Platform Paid Invoices & Collections
        $paidInvoicesQuery = Invoice::where('status', 'PAID')
            ->whereBetween('created_at', [$start, $end]);

        $commissionRevenue = (float) (clone $paidInvoicesQuery)
            ->where('invoice_type', 'COMMISSION')
            ->sum('total_amount');

        $subscriptionRevenue = (float) (clone $paidInvoicesQuery)
            ->where('invoice_type', 'SUBSCRIPTION')
            ->sum('total_amount');

        // Total revenue collected (Paid invoices + Collections)
        $totalRevenue = (float) Invoice::where('status', 'PAID')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_amount');
        if ($totalRevenue <= 0) {
            $totalRevenue = (float) Collection::whereBetween('collection_date', [$start->toDateString(), $end->toDateString()])->sum('amount');
        }

        // Platform Expenses
        $totalExpenses = (float) Expense::whereBetween('expense_date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');

        // Outstanding Receivables from unpaid invoices (strictly matching Billing Hub)
        $outstandingReceivables = (float) Invoice::whereNotIn('status', ['PAID', 'CANCELLED'])->sum('total_amount')
            - (float) Invoice::whereNotIn('status', ['PAID', 'CANCELLED'])->sum('paid_amount');
        $outstandingReceivables = max(0, $outstandingReceivables);

        // Net Platform Profit
        $netProfit = $totalRevenue - $totalExpenses;

        return [
            'total_gmv'               => round($totalGmv, 2),
            'gross_order_sales'       => round($totalGmv, 2),
            'commission_revenue'      => round($commissionRevenue, 2),
            'subscription_revenue'    => round($subscriptionRevenue, 2),
            'total_revenue'           => round($totalRevenue, 2),
            'total_expenses'          => round($totalExpenses, 2),
            'net_profit'              => round($netProfit, 2),
            'collected_revenue'       => round($totalRevenue, 2),
            'outstanding_receivables' => round($outstandingReceivables, 2),
        ];
    }

    /**
     * Get financial status for each restaurant matching Billing Hub.
     */
    public function getRestaurantFinancialTable(): array
    {
        $restaurants = Restaurant::with(['orders', 'invoices', 'collections'])->get();

        return $restaurants->map(function ($restaurant) {
            // Gross sales
            $grossSales = (float) $restaurant->orders
                ->where('status', 'DELIVERED')
                ->sum('total_amount');

            // Commission & Subscription from invoices
            $commissionEarned = (float) $restaurant->invoices
                ->where('invoice_type', 'COMMISSION')
                ->where('status', 'PAID')
                ->sum('total_amount');

            $subscriptionFee = (float) $restaurant->invoices
                ->where('invoice_type', 'SUBSCRIPTION')
                ->where('status', 'PAID')
                ->sum('total_amount');

            $totalPlatformRevenue = (float) $restaurant->invoices
                ->where('status', 'PAID')
                ->sum('total_amount');

            $amountCollected = (float) $restaurant->collections->sum('amount');
            if ($amountCollected <= 0) {
                $amountCollected = $totalPlatformRevenue;
            }

            // Balance due = unpaid invoices sum
            $balanceDue = (float) $restaurant->invoices
                ->whereNotIn('status', ['PAID', 'CANCELLED'])
                ->sum('total_amount')
                - (float) $restaurant->invoices
                ->whereNotIn('status', ['PAID', 'CANCELLED'])
                ->sum('paid_amount');
            $balanceDue = max(0, $balanceDue);

            $status = $balanceDue <= 0 ? 'PAID' : ($amountCollected > 0 ? 'PARTIALLY_PAID' : 'PENDING');

            return [
                'id'                     => $restaurant->id,
                'name'                   => $restaurant->name,
                'slug'                   => $restaurant->slug,
                'commission_type'        => $restaurant->commission_type,
                'commission_percentage'  => $restaurant->commission_percentage,
                'monthly_subscription'   => $restaurant->monthly_subscription_fee,
                'gross_sales'            => round($grossSales, 2),
                'commission_earned'      => round($commissionEarned, 2),
                'subscription_fee'       => round($subscriptionFee, 2),
                'total_platform_revenue' => round($totalPlatformRevenue, 2),
                'amount_collected'       => round($amountCollected, 2),
                'balance_due'            => round($balanceDue, 2),
                'status'                 => $status,
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

            $revenue = (float) Invoice::where('status', 'PAID')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_amount');

            if ($revenue <= 0) {
                $revenue = (float) Collection::whereBetween('collection_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                    ->sum('amount');
            }

            $expense = (float) Expense::whereBetween('expense_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->sum('amount');

            $months[] = [
                'month'    => $monthLabel,
                'revenue'  => round($revenue, 2),
                'expenses' => round($expense, 2),
                'profit'   => round($revenue - $expense, 2),
            ];
        }

        return $months;
    }
}
