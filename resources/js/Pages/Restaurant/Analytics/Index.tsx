import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    DollarSign, TrendingUp, TrendingDown, ShoppingBag, CheckCircle2,
    XCircle, Clock, AlertTriangle, Award, Calendar, ArrowUpRight,
    ArrowDownRight, ChefHat, Percent, BarChart3, PieChart, Sparkles
} from 'lucide-react';

interface Stats {
    total_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    pending_orders: number;
    preparing_orders: number;
    gross_revenue: number;
    delivery_fees: number;
    platform_cut: number;
    net_earnings: number;
    avg_order_value: number;
    cancellation_rate: number;
    completion_rate: number;
    this_month_revenue: number;
    last_month_revenue: number;
    this_month_orders: number;
    last_month_orders: number;
}

interface DailySale {
    date: string;
    revenue: number;
    delivered_count: number;
    cancelled_count: number;
}

interface MonthlySummary {
    month: string;
    month_short: string;
    year: string;
    revenue: number;
    net_earnings: number;
    delivered_orders: number;
    cancelled_orders: number;
}

interface TopItem {
    name: string;
    qty: number;
    revenue: number;
}

interface RestaurantInfo {
    id: number;
    name: string;
    commission_type: string;
    commission_percentage: number;
    monthly_subscription_fee: number;
}

interface Props {
    stats: Stats;
    daily_sales: DailySale[];
    monthly_summary: MonthlySummary[];
    top_items: TopItem[];
    restaurant: RestaurantInfo;
}

const fmt = (v: number | string | null | undefined) => {
    const n = Number(v ?? 0);
    if (isNaN(n)) return '0';
    return Math.round(n).toLocaleString('en');
};

export default function Index({
    stats,
    daily_sales = [],
    monthly_summary = [],
    top_items = [],
    restaurant
}: Props) {
    const [salesView, setSalesView] = useState<'revenue' | 'orders'>('revenue');

    // Month over Month growth calculation
    const momRevenueGrowth = stats?.last_month_revenue > 0
        ? Math.round(((stats.this_month_revenue - stats.last_month_revenue) / stats.last_month_revenue) * 100)
        : null;

    const maxDailyRevenue = Math.max(...(daily_sales?.map(d => d.revenue) || [1]), 1);
    const maxDailyOrders = Math.max(...(daily_sales?.map(d => d.delivered_count) || [1]), 1);

    return (
        <Head title="التقارير والتحليلات — بوابة المطعم" />

            <div className="space-y-8 max-w-7xl mx-auto pb-12">

                {/* ═══ Header ═══ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-orange-500/15">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                                <BarChart3 className="w-6 h-6" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-black text-stone-900 dark:text-white">
                                    أداء وأرباح مطعمك: {restaurant?.name}
                                </h1>
                                <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                                    تفصيل شامل لجميع الطلبات، الأرباح الصافية، والنسب التشغيلية
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Commission / Plan pill */}
                    <div className="flex items-center gap-2 self-start md:self-auto bg-white dark:bg-stone-900 px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs font-bold shadow-xs">
                        <Percent className="w-4 h-4 text-orange-500" />
                        <span className="text-stone-500 dark:text-stone-400">نظام العمولة:</span>
                        <span className="text-stone-900 dark:text-white">
                            {restaurant?.commission_type === 'PERCENTAGE'
                                ? `${restaurant.commission_percentage}% عمولة على الطلب`
                                : restaurant?.commission_type === 'FIXED_PER_ORDER'
                                ? `${fmt(restaurant.commission_percentage)} ج.م لكل طلب`
                                : `اشتراك شهري (${fmt(restaurant?.monthly_subscription_fee)} ج.م)`}
                        </span>
                    </div>
                </div>

                {/* ═══ Main KPI Grid (4 High Impact Cards) ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* 1. Net Earnings */}
                    <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-500/20">
                        <div className="flex items-center justify-between opacity-85 mb-2">
                            <span className="text-xs font-bold tracking-wide uppercase">صافي أرباح المطعم</span>
                            <span className="p-2 rounded-xl bg-white/15 backdrop-blur-xs">
                                <DollarSign className="w-4 h-4 text-white" />
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-3xl font-black">{fmt(stats?.net_earnings)}</span>
                            <span className="text-base font-bold opacity-80">ج.م</span>
                        </div>
                        <p className="text-[11px] opacity-75 mt-2">
                            بعد خصم مصاريف التوصيل وعمولة المنصة
                        </p>
                    </div>

                    {/* 2. Gross Orders Revenue */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">
                            <span>إجمالي المبيعات (Gross)</span>
                            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                                <ShoppingBag className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-3xl font-black text-stone-900 dark:text-white">
                                {fmt(stats?.gross_revenue)}
                            </span>
                            <span className="text-sm font-bold text-stone-400">ج.م</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                            <span>عمولة المنصة: </span>
                            <span className="font-bold text-red-500">-{fmt(stats?.platform_cut)} ج.م</span>
                        </div>
                    </div>

                    {/* 3. Completed vs Cancelled Orders */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">
                            <span>الطلبات المكتملة</span>
                            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-stone-900 dark:text-white">
                                {stats?.delivered_orders ?? 0}
                            </span>
                            <span className="text-xs font-bold text-stone-400">
                                من أصل {stats?.total_orders ?? 0} طلب
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                            <span className="text-emerald-600 font-bold">
                                نسبة الإتمام: {stats?.completion_rate ?? 0}%
                            </span>
                            <span className="text-red-500 font-bold">
                                ملغي: {stats?.cancelled_orders ?? 0} ({stats?.cancellation_rate ?? 0}%)
                            </span>
                        </div>
                    </div>

                    {/* 4. Average Order Value (AOV) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold mb-2">
                            <span>متوسط قيمة الطلب (AOV)</span>
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                                <TrendingUp className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-3xl font-black text-stone-900 dark:text-white">
                                {fmt(stats?.avg_order_value)}
                            </span>
                            <span className="text-sm font-bold text-stone-400">ج.م</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                            معدل دخل الطلب الواحد المكتمل
                        </p>
                    </div>
                </div>

                {/* ═══ Order Pipeline Status Pills ═══ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400 font-bold">تم التسليم بنجاح</p>
                            <p className="text-lg font-black text-stone-900 dark:text-white">{stats?.delivered_orders ?? 0}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400 font-bold">قيد التحضير / التجهيز</p>
                            <p className="text-lg font-black text-stone-900 dark:text-white">{stats?.preparing_orders ?? 0}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400 font-bold">طلبات جديدة معلقة</p>
                            <p className="text-lg font-black text-stone-900 dark:text-white">{stats?.pending_orders ?? 0}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400 font-bold">ملغية أو مرفوضة</p>
                            <p className="text-lg font-black text-stone-900 dark:text-white">{stats?.cancelled_orders ?? 0}</p>
                        </div>
                    </div>
                </div>

                {/* ═══ Monthly Performance Comparison Banner ═══ */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h2 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-500" />
                                مقارنة الشهر الحالي بالشهر السابق
                            </h2>
                            <p className="text-xs text-stone-400 mt-1">
                                رصد نمو المبيعات وعدد الطلبات المسلّمة شهرياً
                            </p>
                        </div>

                        {momRevenueGrowth !== null && (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${
                                momRevenueGrowth >= 0
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                            }`}>
                                {momRevenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                <span>نمو الإيراد: {momRevenueGrowth >= 0 ? `+${momRevenueGrowth}%` : `${momRevenueGrowth}%`}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                        {/* Current Month */}
                        <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-orange-900/30">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">الشهر الحالي</span>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-3xl font-black text-stone-900 dark:text-white">{fmt(stats?.this_month_revenue)}</span>
                                <span className="text-sm font-bold text-stone-500">ج.م إيرادات</span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                {stats?.this_month_orders ?? 0} طلب مكتمل هذا الشهر
                            </p>
                        </div>

                        {/* Last Month */}
                        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
                            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">الشهر السابق</span>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-3xl font-black text-stone-900 dark:text-white">{fmt(stats?.last_month_revenue)}</span>
                                <span className="text-sm font-bold text-stone-500">ج.م إيرادات</span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                {stats?.last_month_orders ?? 0} طلب مكتمل في الشهر الماضي
                            </p>
                        </div>
                    </div>
                </div>

                {/* ═══ 30-Day Activity Chart / Bars ═══ */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                نشاط المبيعات والطلبات اليومية (آخر 30 يوماً)
                            </h2>
                            <p className="text-xs text-stone-400 mt-0.5">
                                مرر على أي عمود لرؤية تفاصيل اليوم المحدد
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold">
                            <button
                                onClick={() => setSalesView('revenue')}
                                className={`px-3 py-1.5 rounded-xl transition-all ${
                                    salesView === 'revenue'
                                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                                }`}
                            >
                                الإيراد اليومي (ج.م)
                            </button>
                            <button
                                onClick={() => setSalesView('orders')}
                                className={`px-3 py-1.5 rounded-xl transition-all ${
                                    salesView === 'orders'
                                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                                }`}
                            >
                                عدد الطلبات
                            </button>
                        </div>
                    </div>

                    {daily_sales.length === 0 ? (
                        <div className="py-12 text-center text-stone-400 text-sm font-bold">
                            لا توجد بيانات مبيعات في آخر 30 يوماً
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Visual Bar Chart */}
                            <div className="h-48 flex items-end gap-1.5 sm:gap-2 pt-4 px-2 border-b border-stone-100 dark:border-stone-800">
                                {daily_sales.map((day, idx) => {
                                    const val = salesView === 'revenue' ? day.revenue : day.delivered_count;
                                    const maxVal = salesView === 'revenue' ? maxDailyRevenue : maxDailyOrders;
                                    const heightPct = maxVal > 0 ? Math.max(8, Math.round((val / maxVal) * 100)) : 8;

                                    return (
                                        <div
                                            key={day.date || idx}
                                            className="group relative flex-1 flex flex-col items-center justify-end h-full"
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-14 z-20 bg-stone-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl">
                                                <p className="text-orange-400">{day.date}</p>
                                                <p>
                                                    {salesView === 'revenue'
                                                        ? `${fmt(day.revenue)} ج.م (${day.delivered_count} طلب)`
                                                        : `${day.delivered_count} مكتمل | ${day.cancelled_count} ملغي`}
                                                </p>
                                            </div>

                                            {/* Bar */}
                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full rounded-t-lg transition-all duration-300 ${
                                                    val > 0
                                                        ? salesView === 'revenue'
                                                            ? 'bg-gradient-to-t from-orange-600 to-amber-400 group-hover:from-orange-500 group-hover:to-amber-300 shadow-xs'
                                                            : 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-xs'
                                                        : 'bg-stone-100 dark:bg-stone-800'
                                                }`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X-axis date legend */}
                            <div className="flex justify-between text-[11px] text-stone-400 font-bold px-2">
                                <span>{daily_sales[0]?.date}</span>
                                <span>{daily_sales[Math.floor(daily_sales.length / 2)]?.date}</span>
                                <span>اليوم ({daily_sales[daily_sales.length - 1]?.date})</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ Monthly Summary Table (Last 6 Months) ═══ */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-stone-900 dark:text-white">
                            الملخص المالي لآخر 6 أشهر
                        </h2>
                        <span className="text-xs text-stone-400 font-bold">
                            تراكمي شهري
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 font-bold text-xs">
                                    <th className="py-3 px-4">الشهر</th>
                                    <th className="py-3 px-4">إجمالي المبيعات</th>
                                    <th className="py-3 px-4">صافي ربح المطعم</th>
                                    <th className="py-3 px-4">طلبات مكتملة</th>
                                    <th className="py-3 px-4">طلبات ملغية</th>
                                    <th className="py-3 px-4">نسبة الإنجاز</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                                {monthly_summary.map((m, idx) => {
                                    const totalMOrders = m.delivered_orders + m.cancelled_orders;
                                    const compRate = totalMOrders > 0
                                        ? Math.round((m.delivered_orders / totalMOrders) * 100)
                                        : 0;

                                    return (
                                        <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                                                {m.month}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                                                {fmt(m.revenue)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                {fmt(m.net_earnings)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {m.delivered_orders}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {m.cancelled_orders}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold">
                                                <span className={`px-2.5 py-1 rounded-full text-xs ${
                                                    compRate >= 80
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                        : compRate >= 50
                                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                                }`}>
                                                    {compRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ═══ Top Selling Items ═══ */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                <Award className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    الأصناف الأكثر مبيعاً وتحقيقاً للإيراد
                                </h2>
                                <p className="text-xs text-stone-400">
                                    أعلى 10 وجبات طلباً في مطعمك
                                </p>
                            </div>
                        </div>
                    </div>

                    {top_items.length === 0 ? (
                        <div className="py-8 text-center text-stone-400 text-sm font-bold">
                            لا توجد أصناف مباعة بعد
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {top_items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                            idx === 0
                                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                                : idx === 1
                                                ? 'bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                                                : idx === 2
                                                ? 'bg-amber-700/60 text-white'
                                                : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                        }`}>
                                            #{idx + 1}
                                        </span>
                                        <div>
                                            <p className="font-bold text-stone-900 dark:text-white text-sm">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-stone-400">
                                                تم طلب {item.qty} مرة
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                            {fmt(item.revenue)} ج.م
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
    );
}
