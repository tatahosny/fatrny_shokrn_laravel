import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    Store, 
    ShoppingBag, 
    DollarSign, 
    Users, 
    Receipt, 
    AlertCircle, 
    TrendingUp, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck, 
    GraduationCap,
    Clock,
    Plus
} from 'lucide-react';
import { Order, Restaurant } from '../../Types';

interface AdminDashboardProps {
    stats: {
        total_restaurants: number;
        active_restaurants: number;
        suspended_restaurants: number;
        total_customers: number;
        total_orders: number;
        orders_today: number;
        revenue_today: number;
        revenue_this_month: number;
        platform_profit: number;
        total_expenses: number;
        outstanding_collections: number;
        overdue_invoices: number;
    };
    revenue_chart: {
        date: string;
        revenue: number;
        orders: number;
    }[];
    profit_chart: any[];
    recent_orders: Order[];
    top_restaurants: (Restaurant & { orders_sum_total_amount?: number })[];
}

export default function Dashboard({ 
    stats, 
    revenue_chart = [], 
    profit_chart = [], 
    recent_orders = [], 
    top_restaurants = [] 
}: AdminDashboardProps) {
    return (
        <AdminLayout title="لوحة التحكم المركزية">
            <Head title="لوحة التحكم المركزية — فطرنا شكراً" />

            <div className="space-y-8">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>إجمالي المبيعات (GMV هذا الشهر)</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                            {stats.revenue_this_month.toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            اليوم: {stats.revenue_today.toFixed(1)} ج.م
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>صافي أرباح المنصة (العمولات)</span>
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                            {stats.platform_profit.toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            بعد خصم المصروفات
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>المطاعم الشريكة النشطة</span>
                            <Store className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                            {stats.active_restaurants} / {stats.total_restaurants}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            معتمدة في مدينة برج العرب
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>الطلاب والعملاء المسجلين</span>
                            <GraduationCap className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                            {stats.total_customers}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            إجمالي الطلبات: {stats.total_orders}
                        </p>
                    </div>
                </div>

                {/* Overdue / Alerts banner if any */}
                {(stats.overdue_invoices > 0 || stats.outstanding_collections > 0) && (
                    <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <span className="font-black text-amber-900 dark:text-amber-200 text-sm block">تنبيهات التحصيل المالي</span>
                                <span className="text-amber-700 dark:text-amber-300">
                                    يوجد مستحقات متأخرة بقيمة {stats.outstanding_collections} ج.م وعدد {stats.overdue_invoices} فواتير اشتراك تحتاج متابعة.
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/admin/invoices" className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition">
                                مراجعة الفواتير
                            </Link>
                            <Link href="/admin/collections" className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold">
                                التحصيلات
                            </Link>
                        </div>
                    </div>
                )}

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link
                        href="/admin/restaurants"
                        className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 flex items-center gap-3 transition group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">إضافة مطعم</span>
                            <span className="text-[10px] text-stone-400">شريك جديد</span>
                        </div>
                    </Link>

                    <Link
                        href="/admin/customers"
                        className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 flex items-center gap-3 transition group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">توثيق الكارنيهات</span>
                            <span className="text-[10px] text-stone-400">مراجعة بطاقات الطلاب</span>
                        </div>
                    </Link>

                    <Link
                        href="/admin/finance"
                        className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 flex items-center gap-3 transition group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">الأرباح والمصروفات</span>
                            <span className="text-[10px] text-stone-400">التقرير المالي العام</span>
                        </div>
                    </Link>

                    <Link
                        href="/admin/backups"
                        className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 flex items-center gap-3 transition group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">النسخ الاحتياطي</span>
                            <span className="text-[10px] text-stone-400">أمان قاعدة البيانات</span>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders & Top Restaurants Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders (2 cols) */}
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white">
                                    أحدث طلبات المنصة الحية
                                </h2>
                                <p className="text-xs text-stone-400">متابعة العمليات بين المطاعم والعملاء والطيارين</p>
                            </div>
                            <Link href="/admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
                                كل الطلبات
                            </Link>
                        </div>

                        {recent_orders.length === 0 ? (
                            <p className="text-center py-8 text-xs text-stone-400">لا توجد طلبات مسجلة بعد.</p>
                        ) : (
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                                {recent_orders.map(order => (
                                    <div key={order.id} className="py-3.5 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-orange-600">{order.order_number}</span>
                                                <span className="text-stone-400">•</span>
                                                <span className="font-bold text-stone-900 dark:text-white">{order.restaurant?.name}</span>
                                            </div>
                                            <p className="text-[11px] text-stone-500 mt-0.5">
                                                العميل: {order.customer?.user?.name || 'عميل'} • {order.address}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-stone-900 dark:text-white text-sm">
                                                {order.total_amount} ج.م
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top restaurants (1 col) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-1">
                            أعلى المطاعم مبيعاً
                        </h2>
                        <p className="text-xs text-stone-400 mb-4">هذا الشهر</p>

                        <div className="space-y-3 text-xs">
                            {top_restaurants.map((r, idx) => (
                                <div key={r.id} className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-[10px]">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-stone-900 dark:text-white">{r.name}</h3>
                                            <span className="text-[10px] text-stone-400">{r.status}</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                                        {r.orders_sum_total_amount || 0} ج.م
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
