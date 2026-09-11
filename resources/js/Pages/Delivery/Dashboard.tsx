import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DeliveryLayout from '../../Layouts/DeliveryLayout';
import { DeliveryDriver, Order } from '../../Types';
import { 
    Bike, 
    Clock, 
    CheckCircle2, 
    Phone, 
    MapPin, 
    ArrowRight, 
    Store, 
    DollarSign,
    Power,
    Navigation,
    Calendar,
    History
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DeliveryDashboardProps {
    driver: DeliveryDriver;
    active_orders: Order[];
    completed_today: number;
    earnings_today?: number;
    weekly_stats?: { date: string; orders: number }[];
}

export default function Dashboard({ 
    driver, 
    active_orders = [], 
    completed_today = 0, 
    earnings_today = 0,
    weekly_stats = [] 
}: DeliveryDashboardProps) {
    const isAvailable = driver.availability_status === 'AVAILABLE';

    const toggleStatus = () => {
        router.post('/delivery/profile/availability', {
            availability_status: isAvailable ? 'OFFLINE' : 'AVAILABLE'
        });
    };

    const handleUpdateStatus = (orderId: number, nextStatus: 'OUT_FOR_DELIVERY' | 'DELIVERED') => {
        router.patch(`/delivery/orders/${orderId}/status`, {
            status: nextStatus
        });
    };

    return (
        <DeliveryLayout title="لوحة كابتن التوصيل" isAvailable={isAvailable}>
            <Head title="لوحة كابتن التوصيل — فطرنا شكراً" />

            <div className="space-y-6">
                <section className="relative isolate overflow-hidden rounded-[2rem] bg-emerald-950 px-5 py-6 text-white shadow-xl shadow-emerald-950/20 sm:px-7">
                    <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
                    <div className="absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-teal-300/10 blur-3xl" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner"><Navigation className="h-7 w-7 text-emerald-300" /></div>
                            <div>
                                <p className="text-[10px] font-black tracking-[.22em] text-emerald-300 uppercase">وضع الرحلة</p>
                                <h1 className="mt-1 text-xl font-black">{isAvailable ? 'أنت جاهز للطريق' : 'أنت غير متصل الآن'}</h1>
                                <p className="mt-1 text-xs text-emerald-100/70">{active_orders.length ? `لديك ${active_orders.length} طلب يحتاج متابعة الآن` : 'شغّل الاستقبال لتصلك الطلبات الجديدة فورًا'}</p>
                            </div>
                        </div>
                        <button onClick={toggleStatus} className={`rounded-2xl px-4 py-3 text-xs font-black transition ${isAvailable ? 'bg-white text-emerald-950 hover:bg-emerald-50' : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'}`}>{isAvailable ? 'إيقاف الاستقبال' : 'بدء الاستقبال'}</button>
                    </div>
                    <div className="relative mt-6 grid grid-cols-3 divide-x divide-x-reverse divide-white/10 rounded-2xl border border-white/10 bg-black/10 text-center">
                        <div className="px-2 py-3"><p className="text-lg font-black">{active_orders.length}</p><p className="text-[10px] text-emerald-100/60">طلبات نشطة</p></div>
                        <div className="px-2 py-3"><p className="text-lg font-black">{completed_today}</p><p className="text-[10px] text-emerald-100/60">تم اليوم</p></div>
                        <div className="px-2 py-3"><p className="text-lg font-black">{Number(earnings_today).toLocaleString()}</p><p className="text-[10px] text-emerald-100/60">كاش اليوم</p></div>
                    </div>
                </section>

                {/* Status & KPI Banner */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-600/20">
                            <Bike className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <span>{driver.name}</span>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                    isAvailable 
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                                }`}>
                                    {isAvailable ? 'جاهز لتلقي الطلبات' : 'غير متصل'}
                                </span>
                            </h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                مطعم: {driver.restaurant?.name || 'فطرنا شكراً — كابتن حر'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="text-center px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                            <span className="text-[10px] text-stone-400 block font-bold">تم توصيلها اليوم</span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completed_today} طلبات</span>
                        </div>

                        <div className="text-center px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                            <span className="text-[10px] text-stone-400 block font-bold">كاش اليوم</span>
                            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{Number(earnings_today).toLocaleString()} ج.م</span>
                        </div>

                        <button
                            onClick={toggleStatus}
                            className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition ${
                                isAvailable
                                    ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600'
                                    : 'border-emerald-300 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                            }`}
                        >
                            <Power className="w-4 h-4" />
                            <span>{isAvailable ? 'إيقاف الاستقبال' : 'تفعيل الاستقبال'}</span>
                        </button>
                    </div>
                </div>

                {/* Weekly Activity Chart & History banner */}
                {weekly_stats.length > 0 && (
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                    نشاط توصيلاتي خلال الأسبوع الماضي
                                </h3>
                            </div>
                            <Link
                                href="/delivery/order-history"
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <History className="w-3.5 h-3.5" />
                                <span>عرض سجل كل الطلبات</span>
                            </Link>
                        </div>

                        <div className="h-28 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekly_stats} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                    <Tooltip 
                                        formatter={(val: any) => [`${val} طلبات`, 'تم التوصيل']}
                                        contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                                    />
                                    <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Active Orders Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-emerald-600" />
                            <span>الطلبات المكلف بها حالياً ({active_orders.length})</span>
                        </h2>

                        <Link
                            href="/delivery/order-history"
                            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition flex items-center gap-1.5"
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>سجل الطلبات بالكامل</span>
                        </Link>
                    </div>

                    {active_orders.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
                            <Bike className="w-14 h-14 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-stone-700 dark:text-stone-300 mb-1">
                                لا توجد طلبات جارية الآن
                            </h3>
                            <p className="text-xs text-stone-400">
                                {isAvailable ? 'أنت متصل وجاهز، سيظهر أي طلب يتم تكليفك به هنا فوراً!' : 'فعل حالة التوفر لاستقبال طلبات التوصيل الجديدة.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {active_orders.map((order) => (
                                <div 
                                    key={order.id}
                                    className="p-6 rounded-3xl bg-white dark:bg-stone-900 border-2 border-emerald-500 shadow-md space-y-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                                        <div>
                                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {order.order_number}
                                            </span>
                                            <h3 className="font-extrabold text-base text-stone-900 dark:text-white mt-0.5">
                                                مطعم: {order.restaurant?.name}
                                            </h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                                            order.status === 'OUT_FOR_DELIVERY' 
                                                ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                                                : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                        }`}>
                                            {order.status === 'OUT_FOR_DELIVERY' ? 'في الطريق للعميل' : 'تم التكليف — جاهز للاستلام'}
                                        </span>
                                    </div>

                                    {/* Pickup & Delivery Points */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        {/* Pickup from Restaurant */}
                                        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                                    <Store className="w-3.5 h-3.5 text-orange-500" />
                                                    نقطة الاستلام (المطعم)
                                                </span>
                                                {order.restaurant?.phone && (
                                                    <a href={`tel:${order.restaurant.phone}`} className="text-orange-600 font-bold hover:underline flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> اتصال
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-stone-500">{order.restaurant?.address}</p>
                                        </div>

                                        {/* Deliver to Customer */}
                                        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                                    نقطة التسليم (العميل)
                                                </span>
                                                {order.customer?.user?.phone && (
                                                    <a href={`tel:${order.customer.user.phone}`} className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> اتصال
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-stone-800 dark:text-stone-200 font-medium">{order.address}</p>
                                        </div>
                                    </div>

                                    {/* Financial Cash collection required */}
                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-300 dark:border-stone-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <DollarSign className="w-4 h-4 text-amber-600" />
                                            <span className="font-bold text-stone-800 dark:text-stone-200">
                                                المبلغ المطلوب تحصيله كاش من العميل:
                                            </span>
                                        </div>
                                        <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                                            {order.total_amount} ج.م
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                        <Link
                                            href={`/delivery/orders/${order.id}`}
                                            className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                        >
                                            الخريطة والتعليمات
                                        </Link>

                                        {order.status === 'ASSIGNED_TO_DRIVER' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                                                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition"
                                            >
                                                استلمت من المطعم وفي الطريق
                                            </button>
                                        )}

                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>تم التسليم وتحصيل الكاش</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DeliveryLayout>
    );
}
