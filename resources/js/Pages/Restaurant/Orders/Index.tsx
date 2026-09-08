import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { Restaurant, Order, PaginatedResponse } from '../../../Types';
import { ShoppingBag, Eye, CheckCircle2, Clock, Filter, Search } from 'lucide-react';

interface OrdersIndexProps {
    orders: PaginatedResponse<Order>;
    restaurant: Restaurant;
    filters: { status?: string };
}

export default function Index({ orders, restaurant, filters }: OrdersIndexProps) {
    const items = orders?.data || [];

    const handleFilterStatus = (status: string) => {
        router.get('/restaurant/orders', { status: status === 'ALL' ? '' : status }, { preserveState: true });
    };

    const handleAdvanceStatus = (orderId: number, status: string) => {
        router.patch(`/restaurant/orders/${orderId}/status`, { status });
    };

    const statuses = [
        { key: 'ALL', label: 'الكل' },
        { key: 'PENDING', label: 'قيد الانتظار' },
        { key: 'CONFIRMED', label: 'مؤكد' },
        { key: 'PREPARING', label: 'قيد التجهيز' },
        { key: 'READY_FOR_PICKUP', label: 'جاهز للاستلام' },
        { key: 'OUT_FOR_DELIVERY', label: 'مع الطيار' },
        { key: 'DELIVERED', label: 'تم التسليم' },
    ];

    return (
        <RestaurantLayout title="إدارة الطلبات" restaurantName={restaurant.name}>
            <Head title="إدارة الطلبات — بوابة المطعم" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                جميع طلبات المطعم
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                فلترة وتحديث حالات الطلبات وتعيين الكباتن
                            </p>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                            {statuses.map(st => (
                                <button
                                    key={st.key}
                                    onClick={() => handleFilterStatus(st.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                        (filters.status === st.key) || (!filters.status && st.key === 'ALL')
                                            ? 'bg-orange-600 text-white shadow-xs'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingBag className="w-14 h-14 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا توجد طلبات تطابق هذا التصنيف.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                        <th className="py-3 px-4">رقم الطلب</th>
                                        <th className="py-3 px-4">العميل</th>
                                        <th className="py-3 px-4">العنوان</th>
                                        <th className="py-3 px-4">الإجمالي</th>
                                        <th className="py-3 px-4">الحالة</th>
                                        <th className="py-3 px-4">الوقت</th>
                                        <th className="py-3 px-4 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {items.map(order => (
                                        <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                            <td className="py-4 px-4 font-mono font-bold text-orange-600">
                                                {order.order_number}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                                {order.customer?.user?.name || 'عميل'}
                                            </td>
                                            <td className="py-4 px-4 text-stone-500 max-w-xs truncate">
                                                {order.address}
                                            </td>
                                            <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                {order.total_amount} ج.م
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-stone-400">
                                                {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-4 text-center space-x-1 space-x-reverse">
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleAdvanceStatus(order.id, 'CONFIRMED')}
                                                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                                                    >
                                                        تأكيد
                                                    </button>
                                                )}
                                                {order.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                                                        className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px]"
                                                    >
                                                        بدء التجهيز
                                                    </button>
                                                )}
                                                {order.status === 'PREPARING' && (
                                                    <button
                                                        onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_PICKUP')}
                                                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px]"
                                                    >
                                                        جاهز
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/restaurant/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-orange-600 text-[11px] font-bold"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>عرض</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </RestaurantLayout>
    );
}
