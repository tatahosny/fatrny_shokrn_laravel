<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\DeliveryDriver;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\FinancialService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function __construct(protected FinancialService $financialService) {}

    public function index(): Response
    {
        $data = Cache::remember('dashboard.admin.overview', now()->addSeconds(20), function () {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        $stats = [
            'total_restaurants'      => Restaurant::count(),
            'active_restaurants'     => Restaurant::where('status', 'ACTIVE')->count(),
            'suspended_restaurants'  => Restaurant::where('status', 'SUSPENDED')->count(),
            'total_customers'        => Customer::count(),
            'total_orders'           => Order::count(),
            'orders_today'           => Order::whereDate('created_at', $today)->count(),
            'revenue_today'          => (float) Order::where('status', 'DELIVERED')
                                            ->whereDate('created_at', $today)->sum('total_amount'),
            'revenue_this_month'     => (float) Order::where('status', 'DELIVERED')
                                            ->where('created_at', '>=', $thisMonth)->sum('total_amount'),
            'platform_profit'        => $this->financialService->getPlatformSummary()['net_profit'],
            'total_expenses'         => (float) Expense::where('expense_date', '>=', $thisMonth->toDateString())->sum('amount'),
            'outstanding_collections'=> $this->financialService->getPlatformSummary()['outstanding_receivables'],
            'overdue_invoices'       => Invoice::where('status', 'OVERDUE')->count(),
        ];

        // Revenue chart — last 14 days
        $revenueChart = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenueChart[] = [
                'date'    => $date->format('d M'),
                'revenue' => (float) Order::where('status', 'DELIVERED')
                                ->whereDate('created_at', $date)->sum('total_amount'),
                'orders'  => Order::whereDate('created_at', $date)->count(),
            ];
        }

        // Monthly P&L chart
        $profitChart = $this->financialService->getMonthlyProfitAndLoss();

        // Recent orders
        $recentOrders = Order::with(['customer.user', 'restaurant:id,name'])
            ->latest()
            ->take(8)
            ->get();

        // Top restaurants by revenue this month
        $topRestaurants = Restaurant::withSum(
            ['orders as monthly_revenue' => fn($q) => $q->where('status', 'DELIVERED')
                ->where('created_at', '>=', $thisMonth)],
            'total_amount'
        )
        ->orderByDesc('monthly_revenue')
        ->take(5)
        ->get(['id', 'name', 'logo', 'status']);

        return [
            'stats'           => $stats,
            'revenue_chart'   => $revenueChart,
            'profit_chart'    => $profitChart,
            'recent_orders'   => $recentOrders,
            'top_restaurants' => $topRestaurants,
        ];
        });

        return Inertia::render('Admin/Dashboard', $data);
    }
}
