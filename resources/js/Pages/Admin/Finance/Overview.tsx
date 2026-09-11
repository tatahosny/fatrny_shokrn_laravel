import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    DollarSign, TrendingUp, TrendingDown, Store, ArrowUpRight,
    ShoppingBag, CheckCircle2, XCircle, Clock, CreditCard,
    Banknote, ChevronDown, ChevronUp, Receipt, Activity,
    BarChart3, PieChart, AlertTriangle, Search, Filter,
    FileSpreadsheet, ShieldAlert, ArrowRightLeft, Sparkles,
    ExternalLink, Check
} from 'lucide-react';

interface PlatformProfit {
    subscription_revenue: number;
    commission_revenue: number;
    total_platform_earn: number;
    total_expenses: number;
    net_profit: number;
    outstanding: number;
}

interface RestaurantProfit {
    id: number;
    name: string;
    slug: string;
    status: string;
    commission_type: string;
    commission_rate: number;
    subscription_fee: number;
    total_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    pending_orders: number;
    gross_revenue: number;
    delivery_fees: number;
    platform_cut: number;
    net_restaurant_earn: number;
    unpaid_due?: number;
    paid_amount?: number;
    overdue_count?: number;
}

interface MonthlyPnl {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
}

interface Props {
    summary: Record<string, number>;
    platform_profit: PlatformProfit;
    restaurant_profits: RestaurantProfit[];
    monthly_pnl: MonthlyPnl[];
    total_gmv: number;
    filters: { start_date?: string; end_date?: string };
}

const fmt = (v: number | string | null | undefined) => {
    const n = Number(v ?? 0);
    if (isNaN(n)) return '0';
    return Math.round(n).toLocaleString('en');
};

export default function Overview({ platform_profit, restaurant_profits = [], monthly_pnl = [], total_gmv = 0 }: Props) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'PAID' | 'ACTIVE' | 'SUSPENDED'>('ALL');

    // Aggregate calculations
    const totalRestaurantGross = restaurant_profits.reduce((s, r) => s + r.gross_revenue, 0);
    const totalRestaurantNet   = restaurant_profits.reduce((s, r) => s + r.net_restaurant_earn, 0);
    const totalPlatformCut     = restaurant_profits.reduce((s, r) => s + r.platform_cut, 0);
    const totalDelivered       = restaurant_profits.reduce((s, r) => s + r.delivered_orders, 0);
    const totalCancelled       = restaurant_profits.reduce((s, r) => s + r.cancelled_orders, 0);
    const totalPendingOrders   = restaurant_profits.reduce((s, r) => s + r.pending_orders, 0);
    const totalUnpaidDue       = restaurant_profits.reduce((s, r) => s + (r.unpaid_due || 0), 0);
    const totalPaidCollections = restaurant_profits.reduce((s, r) => s + (r.paid_amount || 0), 0);

    // Filtered list
    const filteredRestaurants = useMemo(() => {
        return restaurant_profits.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
            if (!matchesSearch) return false;

            if (statusFilter === 'DUE') return (r.unpaid_due || 0) > 0;
            if (statusFilter === 'PAID') return (r.unpaid_due || 0) === 0;
            if (statusFilter === 'ACTIVE') return r.status === 'ACTIVE';
            if (statusFilter === 'SUSPENDED') return r.status === 'SUSPENDED';

            return true;
        });
    }, [restaurant_profits, searchQuery, statusFilter]);

    return (
        <>
            <Head title="التقرير المالي وكشف حساب المطاعم — فطرنا" />
            <div className="space-y-10 max-w-7xl mx-auto pb-12">

                {/* ═══ SECTION 1: GMV Platform Banner ═══ */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 text-white shadow-xl shadow-orange-500/20">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-3">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                                إجمالي حجم المعاملات عبر المنصة (GMV)
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl sm:text-5xl font-black">{fmt(total_gmv)}</span>
                                <span className="text-xl font-bold opacity-80">ج.م</span>
                            </div>
                            <p className="text-xs opacity-80 mt-1.5 font-medium">
                                القيمة النقدية الإجمالية لكافة الطلبات المنفذة والمسلمة بنجاح من جميع المطاعم
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-black/15 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                            <div className="px-2">
                                <p className="text-2xl sm:text-3xl font-black text-white">{totalDelivered}</p>
                                <p className="text-[11px] opacity-80 mt-0.5">طلب مكتمل</p>
                            </div>
                            <div className="px-2 border-r border-l border-white/15">
                                <p className="text-2xl sm:text-3xl font-black text-yellow-200">{totalCancelled}</p>
                                <p className="text-[11px] opacity-80 mt-0.5">طلب ملغي</p>
                            </div>
                            <div className="px-2">
                                <p className="text-2xl sm:text-3xl font-black text-white">{restaurant_profits.length}</p>
                                <p className="text-[11px] opacity-80 mt-0.5">مطعم شريك</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ SECTION 2: Our Platform Profits ═══ */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600">
                                <DollarSign className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">أرباح منصتنا المركزية</h2>
                                <p className="text-xs text-stone-400">إيرادات اشتراكات المطاعم الشهرية + العمولات المقتطعة</p>
                            </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            صافي الربح: {fmt(platform_profit?.net_profit)} ج.م
                        </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Subscriptions */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                                <span>إيرادات الاشتراكات</span>
                                <CreditCard className="w-4 h-4 text-orange-500" />
                            </div>
                            <p className="text-2xl font-black text-stone-900 dark:text-white">
                                {fmt(platform_profit?.subscription_revenue)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                            </p>
                            <p className="text-[11px] text-stone-400 mt-1">الرسوم الثابتة المحصلة</p>
                        </div>

                        {/* Commissions */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                                <span>إيرادات العمولات</span>
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-2xl font-black text-stone-900 dark:text-white">
                                {fmt(platform_profit?.commission_revenue)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                            </p>
                            <p className="text-[11px] text-stone-400 mt-1">نسبتنا من طلبات الموقع</p>
                        </div>

                        {/* Expenses */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                                <span>المصروفات التشغيلية</span>
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="text-2xl font-black text-stone-900 dark:text-white">
                                {fmt(platform_profit?.total_expenses)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                            </p>
                            <p className="text-[11px] text-stone-400 mt-1">تكاليف السيرفرات والتسويق</p>
                        </div>

                        {/* Net Profit */}
                        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
                            <div className="flex items-center justify-between text-xs opacity-90 font-bold mb-2">
                                <span>صافي أرباح المنصة</span>
                                <DollarSign className="w-4 h-4" />
                            </div>
                            <p className="text-2xl font-black">
                                {fmt(platform_profit?.net_profit)} <span className="text-xs font-normal opacity-80">ج.م</span>
                            </p>
                            <p className="text-[11px] opacity-80 mt-1">الإيراد الكلي بعد خصم المصروفات</p>
                        </div>
                    </div>
                </div>

                {/* ═══ SECTION 3: STATEMENT TABLE (كشف حساب المطاعم والعمولات المستحقة) ═══ */}
                <div className="space-y-4">
                    {/* Header & Quick Action */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/20">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    كشف حساب المطاعم والعمولات المستحقة
                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 border border-orange-200 dark:border-orange-800">
                                        {filteredRestaurants.length} مطعم
                                    </span>
                                </h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    سجل مالي مفصل لمبيعات كل مطعم، العمولات المقتطعة، المبالغ المحصلة، والمستحقات المعلقة ذمتهم
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/billing"
                            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 font-bold text-xs shadow-md transition"
                        >
                            <Receipt className="w-4 h-4 text-orange-500" />
                            <span>فتح مركز التحصيل وإصدار الفواتير</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Summary Quick Metric Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                            <p className="text-[11px] text-stone-400 font-bold">إجمالي مبيعات المطاعم</p>
                            <p className="text-lg font-black text-stone-900 dark:text-white mt-1">
                                {fmt(totalRestaurantGross)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                            <p className="text-[11px] text-stone-400 font-bold">إجمالي عمولات المنصة</p>
                            <p className="text-lg font-black text-orange-600 dark:text-orange-400 mt-1">
                                {fmt(totalPlatformCut)} <span className="text-xs font-normal text-stone-400">ج.م</span>
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                            <p className="text-[11px] text-red-500 dark:text-red-400 font-bold flex items-center justify-between">
                                <span>العمولات المستحقة (غير محصلة)</span>
                                <AlertTriangle className="w-3.5 h-3.5" />
                            </p>
                            <p className="text-lg font-black text-red-600 dark:text-red-400 mt-1">
                                {fmt(totalUnpaidDue)} <span className="text-xs font-normal text-red-400">ج.م</span>
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
                                <span>صافي أرباح المطاعم الكلية</span>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </p>
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {fmt(totalRestaurantNet)} <span className="text-xs font-normal text-emerald-500">ج.م</span>
                            </p>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث باسم المطعم..."
                                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                                    statusFilter === 'ALL'
                                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                                }`}
                            >
                                الكل ({restaurant_profits.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('DUE')}
                                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                                    statusFilter === 'DUE'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100'
                                }`}
                            >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                عليه مستحقات ({restaurant_profits.filter(r => (r.unpaid_due || 0) > 0).length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('PAID')}
                                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                                    statusFilter === 'PAID'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                                }`}
                            >
                                <Check className="w-3.5 h-3.5" />
                                مسدد ({restaurant_profits.filter(r => (r.unpaid_due || 0) === 0).length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('ACTIVE')}
                                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                                    statusFilter === 'ACTIVE'
                                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                }`}
                            >
                                نشط
                            </button>
                            <button
                                onClick={() => setStatusFilter('SUSPENDED')}
                                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                                    statusFilter === 'SUSPENDED'
                                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                }`}
                            >
                                موقوف
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-black text-[11px]">
                                        <th className="py-4 px-4">المطعم ونظام العقد</th>
                                        <th className="py-4 px-4 text-center">حركة الطلبات</th>
                                        <th className="py-4 px-4">إجمالي المبيعات</th>
                                        <th className="py-4 px-4">عمولة المنصة</th>
                                        <th className="py-4 px-4">المبالغ المحصلة</th>
                                        <th className="py-4 px-4 text-center">العمولات المستحقة</th>
                                        <th className="py-4 px-4">صافي أرباح المطعم</th>
                                        <th className="py-4 px-4 text-center">كشف الحساب</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                                    {filteredRestaurants.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center text-stone-400">
                                                <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="font-bold text-sm">لا توجد مطاعم مطابقة للبحث أو التصفية الحالية</p>
                                            </td>
                                        </tr>
                                    ) : filteredRestaurants.map((r) => {
                                        const isOverdue = (r.unpaid_due || 0) > 0;
                                        const compRate = r.total_orders > 0 ? Math.round((r.delivered_orders / r.total_orders) * 100) : 0;
                                        const isExpanded = expandedRow === r.id;

                                        return (
                                            <React.Fragment key={r.id}>
                                                <tr className={`transition-colors hover:bg-stone-50/70 dark:hover:bg-stone-800/50 ${
                                                    isOverdue ? 'bg-red-500/[0.02]' : ''
                                                } ${isExpanded ? 'bg-orange-50/40 dark:bg-orange-950/10' : ''}`}>

                                                    {/* Restaurant info & plan */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                                r.status === 'ACTIVE'
                                                                    ? 'bg-emerald-500 shadow-xs shadow-emerald-500'
                                                                    : 'bg-red-500 shadow-xs shadow-red-500'
                                                            }`} />
                                                            <div>
                                                                <span className="font-black text-stone-900 dark:text-white text-sm block">
                                                                    {r.name}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                                                        {r.commission_type === 'SUBSCRIPTION'
                                                                            ? `اشتراك: ${fmt(r.subscription_fee)} ج/شهر`
                                                                            : `عمولة ${r.commission_rate}%`}
                                                                    </span>
                                                                    {r.status === 'SUSPENDED' && (
                                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                                                                            موقوف
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Orders pipeline counts */}
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-[11px] font-bold">
                                                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" title="طلبات مكتملة">
                                                                {r.delivered_orders} تم
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400" title="طلبات ملغية">
                                                                {r.cancelled_orders} ملغي
                                                            </span>
                                                            {r.pending_orders > 0 && (
                                                                <span className="px-1.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400" title="طلبات معلقة">
                                                                    {r.pending_orders} معلق
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="block text-[10px] text-stone-400 mt-1">
                                                            الإجمالي: {r.total_orders} طلب ({compRate}%)
                                                        </span>
                                                    </td>

                                                    {/* Gross sales */}
                                                    <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                        {fmt(r.gross_revenue)} <span className="text-[10px] font-normal text-stone-400">ج.م</span>
                                                    </td>

                                                    {/* Platform cut */}
                                                    <td className="py-4 px-4 font-black text-orange-600 dark:text-orange-400">
                                                        {fmt(r.platform_cut)} <span className="text-[10px] font-normal text-stone-400">ج.م</span>
                                                    </td>

                                                    {/* Paid Amount */}
                                                    <td className="py-4 px-4 font-bold text-stone-700 dark:text-stone-300">
                                                        {fmt(r.paid_amount || 0)} <span className="text-[10px] font-normal text-stone-400">ج.م</span>
                                                    </td>

                                                    {/* Outstanding Commissions Due */}
                                                    <td className="py-4 px-4 text-center">
                                                        {isOverdue ? (
                                                            <div className="inline-flex flex-col items-center">
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-black text-xs border border-red-200 dark:border-red-900/50 shadow-xs">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    {fmt(r.unpaid_due)} ج.م مستحق
                                                                </span>
                                                                {r.overdue_count && r.overdue_count > 0 ? (
                                                                    <span className="text-[9px] text-red-500 mt-0.5 font-bold">
                                                                        {r.overdue_count} فاتورة غير مسددة
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                                                                <Check className="w-3.5 h-3.5" />
                                                                مسدد بالكامل
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Restaurant Net Earn */}
                                                    <td className="py-4 px-4">
                                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                                            {fmt(r.net_restaurant_earn)} <span className="text-[10px] font-normal text-stone-400">ج.م</span>
                                                        </span>
                                                        <span className="block text-[10px] text-stone-400 mt-0.5">
                                                            دخل المطعم الصافي
                                                        </span>
                                                    </td>

                                                    {/* Expand Statement Button */}
                                                    <td className="py-4 px-4 text-center">
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                                                                isExpanded
                                                                    ? 'bg-orange-500 text-white shadow-xs'
                                                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                                                            }`}
                                                        >
                                                            <span>كشف تفصيلي</span>
                                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Statement Drawer */}
                                                {isExpanded && (
                                                    <tr className="bg-gradient-to-b from-orange-50/50 to-white dark:from-stone-800/60 dark:to-stone-900">
                                                        <td colSpan={8} className="px-6 py-6 border-b border-orange-200/50 dark:border-stone-700">
                                                            <div className="space-y-4">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/70 dark:border-stone-700/60">
                                                                    <div className="flex items-center gap-2">
                                                                        <Receipt className="w-4 h-4 text-orange-500" />
                                                                        <h3 className="font-black text-stone-900 dark:text-white text-sm">
                                                                            كشف الحساب التفصيلي لمطعم: {r.name}
                                                                        </h3>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Link
                                                                            href={`/admin/billing?restaurant_id=${r.id}`}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-xs"
                                                                        >
                                                                            <span>عرض الفواتير والتحصيل</span>
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                        </Link>
                                                                    </div>
                                                                </div>

                                                                {/* Financial Metrics Breakdown */}
                                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                                                                        <p className="text-stone-400 mb-1 font-medium">إجمالي المبيعات (GMV)</p>
                                                                        <p className="font-black text-stone-900 dark:text-white text-base">{fmt(r.gross_revenue)} ج.م</p>
                                                                        <p className="text-[10px] text-stone-400 mt-1">الطلبات المسلمة بنجاح</p>
                                                                    </div>

                                                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                                                                        <p className="text-stone-400 mb-1 font-medium">رسوم التوصيل المقتطعة</p>
                                                                        <p className="font-black text-blue-600 dark:text-blue-400 text-base">{fmt(r.delivery_fees)} ج.م</p>
                                                                        <p className="text-[10px] text-stone-400 mt-1">مستحقات كباتن التوصيل</p>
                                                                    </div>

                                                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                                                                        <p className="text-stone-400 mb-1 font-medium">عمولة المنصة المقتطعة</p>
                                                                        <p className="font-black text-orange-600 dark:text-orange-400 text-base">{fmt(r.platform_cut)} ج.م</p>
                                                                        <p className="text-[10px] text-stone-400 mt-1">
                                                                            {r.commission_type === 'SUBSCRIPTION' ? 'اشتراك شهري' : `${r.commission_rate}% عمولة`}
                                                                        </p>
                                                                    </div>

                                                                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                                                        <p className="text-emerald-700 dark:text-emerald-400 mb-1 font-bold">صافي أرباح المطعم</p>
                                                                        <p className="font-black text-emerald-600 dark:text-emerald-400 text-base">{fmt(r.net_restaurant_earn)} ج.م</p>
                                                                        <p className="text-[10px] text-emerald-600/70 mt-1">المبلغ المتبقي للمطعم</p>
                                                                    </div>

                                                                    <div className={`p-3.5 rounded-2xl border ${
                                                                        isOverdue
                                                                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                                                                            : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                                                                    }`}>
                                                                        <p className="mb-1 font-bold">المستحقات المعلقة ذمته</p>
                                                                        <p className={`text-base font-black ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'}`}>
                                                                            {fmt(r.unpaid_due)} ج.م
                                                                        </p>
                                                                        <p className="text-[10px] opacity-80 mt-1">
                                                                            {isOverdue ? 'واجبة السداد فوراً' : 'لا توجد متأخرات'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Extra Operational Info */}
                                                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500 dark:text-stone-400 pt-1 font-medium">
                                                                    <span>إجمالي الطلبات المستلمة: <strong className="text-stone-900 dark:text-white">{r.total_orders}</strong></span>
                                                                    <span>•</span>
                                                                    <span>نسبة نجاح التسليم: <strong className="text-emerald-600">{compRate}%</strong></span>
                                                                    <span>•</span>
                                                                    <span>معدل الإلغاء: <strong className="text-red-500">{r.total_orders > 0 ? Math.round((r.cancelled_orders / r.total_orders) * 100) : 0}%</strong></span>
                                                                    <span>•</span>
                                                                    <span>متوسط قيمة الطلب (AOV): <strong className="text-stone-900 dark:text-white">{r.delivered_orders > 0 ? fmt(r.gross_revenue / r.delivered_orders) : 0} ج.م</strong></span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>

                                {/* Table Totals Footer */}
                                {filteredRestaurants.length > 0 && (
                                    <tfoot className="border-t-2 border-stone-200 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-800/70 text-xs font-black">
                                        <tr>
                                            <td className="py-4 px-4 text-stone-900 dark:text-white">
                                                الإجمالي العام ({filteredRestaurants.length} مطعم)
                                            </td>
                                            <td className="py-4 px-4 text-center text-stone-700 dark:text-stone-300">
                                                <span className="text-emerald-600">{filteredRestaurants.reduce((s, r) => s + r.delivered_orders, 0)} تم</span>
                                                {' / '}
                                                <span className="text-red-500">{filteredRestaurants.reduce((s, r) => s + r.cancelled_orders, 0)} ملغي</span>
                                            </td>
                                            <td className="py-4 px-4 text-stone-900 dark:text-white">
                                                {fmt(filteredRestaurants.reduce((s, r) => s + r.gross_revenue, 0))} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-orange-600">
                                                {fmt(filteredRestaurants.reduce((s, r) => s + r.platform_cut, 0))} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-stone-800 dark:text-stone-200">
                                                {fmt(filteredRestaurants.reduce((s, r) => s + (r.paid_amount || 0), 0))} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-center text-red-600">
                                                {fmt(filteredRestaurants.reduce((s, r) => s + (r.unpaid_due || 0), 0))} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-emerald-600 text-sm">
                                                {fmt(filteredRestaurants.reduce((s, r) => s + r.net_restaurant_earn, 0))} ج.م
                                            </td>
                                            <td className="py-4 px-4"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* ═══ SECTION 4: Monthly P&L Chart ═══ */}
                {monthly_pnl.length > 0 && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stone-100 dark:border-stone-800">
                            <BarChart3 className="w-5 h-5 text-orange-500" />
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white">الأداء المالي الشهري للمنصة (آخر 12 شهراً)</h2>
                                <p className="text-xs text-stone-400">مقارنة الإيرادات بالمصروفات وصافي الأرباح شهرياً</p>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                            {monthly_pnl.slice().reverse().map((m) => {
                                const maxVal = Math.max(...monthly_pnl.map(x => x.revenue), 1);
                                const revenueW = Math.round((m.revenue / maxVal) * 100);
                                const expW = Math.round((m.expenses / maxVal) * 100);
                                return (
                                    <div key={m.month} className="flex items-center gap-3 text-xs group py-1">
                                        <span className="w-24 text-[11px] text-stone-400 font-bold shrink-0 text-left">{m.month}</span>
                                        <div className="flex-1 space-y-1">
                                            <div className="h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden" title={`الإيراد: ${fmt(m.revenue)} ج.م`}>
                                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${revenueW}%` }} />
                                            </div>
                                            <div className="h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden" title={`المصروفات: ${fmt(m.expenses)} ج.م`}>
                                                <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${expW}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right w-28 shrink-0">
                                            <span className={`font-black text-sm block ${m.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {m.profit >= 0 ? '+' : ''}{fmt(m.profit)} ج.م
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
