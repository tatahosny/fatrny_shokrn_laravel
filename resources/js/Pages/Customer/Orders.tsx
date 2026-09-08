import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import { Order, PaginatedResponse } from '../../Types';
import { ShoppingBag, Clock, ArrowRight, Store, CheckCircle2 } from 'lucide-react';

interface OrdersProps {
    orders: PaginatedResponse<Order>;
}

export default function Orders({ orders }: OrdersProps) {
    const items = orders?.data || [];

    const getStatusBadge = (status: string) => {
        const map: { [key: string]: { label: string; bg: string; text: string } } = {
            PENDING: { label: 'قيد الانتظار', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-300' },
            CONFIRMED: { label: 'تم التأكيد', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-300' },
            PREPARING: { label: 'جارٍ التجهيز', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-800 dark:text-orange-300' },
            READY_FOR_PICKUP: { label: 'جاهز للاستلام', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-300' },
            ASSIGNED_TO_DRIVER: { label: 'تم تعيين الطيار', bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-800 dark:text-indigo-300' },
            OUT_FOR_DELIVERY: { label: 'الطيار في الطريق إليك', bg: 'bg-teal-100 dark:bg-teal-950', text: 'text-teal-800 dark:text-teal-300' },
            DELIVERED: { label: 'تم التوصيل بنجاح', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-300' },
            CANCELLED: { label: 'ملغي', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-300' },
        };
        const s = map[status] || { label: status, bg: 'bg-stone-100', text: 'text-stone-700' };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    return (
        <CustomerLayout title="سجل طلباتي">
            <Head title="سجل طلباتي — فطرنا شكراً" />

            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">
                            سجل جميع الطلبات
                        </h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            تتبع حالة طلباتك الحالية وتفاصيل الفواتير السابقة
                        </p>
                    </div>
                    <Link
                        href="/restaurants"
                        className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 transition"
                    >
                        طلب جديد
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-stone-700 dark:text-stone-300 mb-1">
                            لا توجد طلبات سابقة حتى الآن
                        </h3>
                        <p className="text-xs text-stone-400 mb-6">
                            ابدأ باكتشاف مطاعم برج العرب واطلب فطارك وسحورك الآن
                        </p>
                        <Link
                            href="/restaurants"
                            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
                        >
                            تصفح المطاعم
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {items.map((order) => (
                            <div key={order.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">
                                            {order.restaurant?.name || 'مطعم شريك'}
                                        </h3>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-xs text-stone-400 font-mono">
                                        رقم الطلب: {order.order_number} • {new Date(order.created_at).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-stone-500 truncate max-w-md">
                                        العنوان: {order.address}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0">
                                    <div className="text-left">
                                        <span className="text-[10px] text-stone-400 block">الإجمالي المطلوب</span>
                                        <span className="text-base font-black text-stone-900 dark:text-white">
                                            {order.total_amount} ج.م
                                        </span>
                                    </div>

                                    <Link
                                        href={`/customer/orders/${order.order_number}`}
                                        className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 text-xs font-bold transition flex items-center gap-1"
                                    >
                                        <span>عرض التفاصيل</span>
                                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
