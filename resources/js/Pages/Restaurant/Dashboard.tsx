import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Restaurant, Order } from '../../Types';
import { 
    ShoppingBag, 
    Clock, 
    CheckCircle2, 
    DollarSign, 
    Bike, 
    TrendingUp, 
    AlertCircle, 
    ArrowRight,
    Utensils,
    Eye,
    CreditCard,
    Calendar
} from 'lucide-react';

interface DashboardProps {
    restaurant: Restaurant;
    stats: {
        orders_today: number;
        pending_orders: number;
        preparing_orders: number;
        ready_orders: number;
        delivered_orders: number;
        cancelled_orders: number;
        revenue_today: number;
        revenue_week: number;
        revenue_month: number;
        active_drivers: number;
    };
    top_items: {
        name: string;
        total_qty: number;
        total_revenue: number;
    }[];
    recent_orders: Order[];
    billing_info?: {
        payment_due_date?: string;
        days_remaining?: number | null;
        is_overdue: boolean;
        monthly_subscription_fee: number;
        has_unpaid_invoice: boolean;
        unpaid_amount: number;
        invoice_number?: string;
    };
}

export default function Dashboard({ restaurant, stats, top_items = [], recent_orders = [], billing_info }: DashboardProps) {
    const handleAdvanceStatus = (orderId: number, status: string) => {
        router.patch(`/restaurant/orders/${orderId}/status`, { status });
    };

    return (
        <Head title={`لوحة تحكم ${restaurant.name} — فطرنا شكراً`} />

            <div className="space-y-8">
                {/* Restaurant command header */}
                <section className="relative overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-7 text-white shadow-2xl shadow-stone-950/15 sm:px-8">
                    <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-orange-500/25 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${restaurant.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.15)]' : 'bg-red-400'}`} />
                                <span className="text-[11px] font-black tracking-[0.18em] text-stone-300 uppercase">{restaurant.status === 'ACTIVE' ? 'المطعم يستقبل الطلبات' : 'المطعم متوقف مؤقتًا'}</span>
                            </div>
                            <h1 className="text-2xl font-black sm:text-3xl">{restaurant.name}</h1>
                            <p className="mt-2 text-sm text-stone-300">لوحة تشغيل المطبخ — اعطِ الأولوية للطلبات الجديدة حتى يخرج كل طلب في وقته.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/restaurant/menu" prefetch className="rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-xs font-bold transition hover:bg-white/15">إدارة المنيو</Link>
                            <Link href="/restaurant/orders?status=PENDING" prefetch className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black transition hover:bg-orange-400">الطلبات الجديدة ({stats.pending_orders})</Link>
                        </div>
                    </div>
                    <div className="relative mt-7 grid grid-cols-3 divide-x divide-x-reverse divide-white/10 rounded-2xl border border-white/10 bg-white/5 text-center backdrop-blur sm:max-w-xl">
                        <div className="px-3 py-3"><p className="text-lg font-black text-amber-300">{stats.pending_orders}</p><p className="text-[10px] text-stone-400">بانتظار التأكيد</p></div>
                        <div className="px-3 py-3"><p className="text-lg font-black text-orange-300">{stats.preparing_orders}</p><p className="text-[10px] text-stone-400">قيد التجهيز</p></div>
                        <div className="px-3 py-3"><p className="text-lg font-black text-emerald-300">{stats.ready_orders}</p><p className="text-[10px] text-stone-400">جاهزة للاستلام</p></div>
                    </div>
                </section>

                {/* Pending Orders Alert Banner */}
                {stats.pending_orders > 0 && (
                    <div className="p-4 sm:p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                            <div>
                                <h2 className="font-black text-base">
                                    يوجد {stats.pending_orders} طلب جديد في انتظار التأكيد والبدء بالتجهيز!
                                </h2>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    تأكيدك السريع يضمن توصيل الوجبات ساخنة لطلاب وسكان برج العرب.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/restaurant/orders?status=PENDING"
                            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition shrink-0 text-center"
                        >
                            عرض الطلبات المعلقة
                        </Link>
                    </div>
                )}

                {/* Billing & Subscription Status Card */}
                {billing_info && (() => {
                    const days = typeof billing_info.days_remaining === 'number' ? billing_info.days_remaining : null;
                    return (
                    <div className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        billing_info.is_overdue
                            ? 'bg-red-500/10 border-red-500/30'
                            : (days !== null && days <= 3)
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-stone-900 border-stone-800'
                    }`}>
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className={`p-3 rounded-2xl shrink-0 ${
                                billing_info.is_overdue
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-orange-500/20 text-orange-400'
                            }`}>
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-white font-bold text-sm sm:text-base">
                                        اشتراك المنصة: {billing_info.monthly_subscription_fee} ج.م شهرياً
                                    </h3>
                                    {billing_info.is_overdue ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                                            ⚠️ مطلوب السداد (متأخر)
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            ✅ الحساب نشط
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs mt-1 text-stone-400 flex-wrap">
                                    {billing_info.payment_due_date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                            موعد السداد (يوم الدفع): <strong className="text-white">{billing_info.payment_due_date}</strong>
                                        </span>
                                    )}
                                    {days !== null && (
                                        <span className={`font-bold ${days < 0 ? 'text-red-400' : (days <= 3 ? 'text-amber-400' : 'text-emerald-400')}`}>
                                            ⏳ {days < 0
                                                ? `متأخر منذ ${Math.abs(days)} يوم`
                                                : (days === 0 ? 'مستحق اليوم!' : `فاضل ${days} يوم على الانتهاء`)}
                                        </span>
                                    )}
                                    {billing_info.has_unpaid_invoice && (
                                        <span className="text-orange-400 font-semibold">
                                            فاتورة غير مسددة: {billing_info.unpaid_amount} ج.م
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/restaurant/billing"
                            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition shrink-0 text-center flex items-center justify-center gap-1.5"
                        >
                            <span>تفاصيل الفاتورة والسداد</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    );
                })()}

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>مبيعات اليوم</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {stats.revenue_today.toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            الأسبوع: {stats.revenue_week.toFixed(0)} ج.م
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>طلبات اليوم</span>
                            <ShoppingBag className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {stats.orders_today}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                            {stats.delivered_orders} تم تسليمها
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>قيد التجهيز في المطبخ</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {stats.preparing_orders}
                        </p>
                        <p className="text-[11px] text-purple-600 font-bold mt-1">
                            {stats.ready_orders} بانتظار الطيار
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>كباتن التوصيل المتاحين</span>
                            <Bike className="w-4 h-4 text-teal-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {stats.active_drivers}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            طيارون جاهزون للاستلام
                        </p>
                    </div>
                </div>

                {/* Content Split: Recent Orders & Top Selling */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent incoming orders */}
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white">
                                    أحدث الطلبات الواردة
                                </h2>
                                <p className="text-xs text-stone-400">تحديث لحظي لحركة الطلبات</p>
                            </div>
                            <Link href="/restaurant/orders" className="text-xs font-bold text-orange-600 hover:underline">
                                إدارة جميع الطلبات
                            </Link>
                        </div>

                        {recent_orders.length === 0 ? (
                            <p className="text-center py-10 text-xs text-stone-400">لا توجد طلبات بعد.</p>
                        ) : (
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                                {recent_orders.map((order) => (
                                    <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-orange-600">
                                                    {order.order_number}
                                                </span>
                                                <span className="text-stone-400">•</span>
                                                <span className="font-bold text-stone-800 dark:text-stone-200">
                                                    {order.customer?.user?.name || 'عميل'}
                                                </span>
                                            </div>
                                            <p className="text-stone-400 text-[11px] mt-0.5">
                                                {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} • {order.address}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3">
                                            <span className="font-black text-stone-900 dark:text-white text-sm">
                                                {order.total_amount} ج.م
                                            </span>

                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, 'CONFIRMED')}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                                >
                                                    تأكيد
                                                </button>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                                                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold"
                                                >
                                                    بدء التجهيز
                                                </button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_PICKUP')}
                                                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                                >
                                                    جاهز للاستلام
                                                </button>
                                            )}

                                            <Link
                                                href={`/restaurant/orders/${order.id}`}
                                                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-orange-600"
                                                title="تفاصيل الطلب"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top selling items */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-1">
                            الأكثر طلباً ومبيعاً
                        </h2>
                        <p className="text-xs text-stone-400 mb-6">خلال آخر 30 يوماً</p>

                        {top_items.length === 0 ? (
                            <p className="text-xs text-stone-400 text-center py-6">لا توجد بيانات كافية بعد.</p>
                        ) : (
                            <div className="space-y-4">
                                {top_items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-md bg-stone-100 dark:bg-stone-800 font-bold flex items-center justify-center text-stone-600 dark:text-stone-400 text-[10px]">
                                                {idx + 1}
                                            </span>
                                            <span className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[140px]">
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-stone-900 dark:text-white">{item.total_qty} طلب</span>
                                            <span className="text-[10px] text-stone-400 block">{item.total_revenue} ج.م</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
}
