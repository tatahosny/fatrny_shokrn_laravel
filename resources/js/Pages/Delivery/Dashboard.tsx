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
    Navigation
} from 'lucide-react';

interface DeliveryDashboardProps {
    driver: DeliveryDriver;
    active_orders: Order[];
    completed_today: number;
}

export default function Dashboard({ driver, active_orders = [], completed_today }: DeliveryDashboardProps) {
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

                    <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                            <span className="text-[10px] text-stone-400 block font-bold">تم توصيلها اليوم</span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completed_today} طلبات</span>
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

                {/* Active Orders Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-emerald-600" />
                            <span>الطلبات المكلف بها حالياً ({active_orders.length})</span>
                        </h2>
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
