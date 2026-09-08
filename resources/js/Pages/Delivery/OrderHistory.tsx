import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DeliveryLayout from '../../Layouts/DeliveryLayout';
import { Order, PaginatedResponse } from '../../Types';
import { Bike, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';

interface OrderHistoryProps {
    orders: PaginatedResponse<Order>;
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
    const items = orders?.data || [];

    return (
        <DeliveryLayout title="سجل توصيلاتي">
            <Head title="سجل توصيلاتي — كابتن فطرنا شكراً" />

            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">
                            سجل التوصيلات المكتملة
                        </h1>
                        <p className="text-xs text-stone-500 mt-0.5">
                            سجل جميع الرحلات والطلبات التي قمت بتوصيلها
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <Bike className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                        <p className="text-xs text-stone-400">لم تقم بتوصيل أي طلبات بعد.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {items.map((order) => (
                            <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-emerald-600">
                                            {order.order_number}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                            تم التوصيل
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
                                        مطعم: {order.restaurant?.name}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        {new Date(order.created_at).toLocaleDateString('ar-EG')} • {order.address}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                    <div className="text-left">
                                        <span className="text-[10px] text-stone-400 block">تم تحصيله</span>
                                        <span className="font-black text-sm text-stone-900 dark:text-white">
                                            {order.total_amount} ج.م
                                        </span>
                                    </div>

                                    <Link
                                        href={`/delivery/orders/${order.id}`}
                                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                                    >
                                        التفاصيل
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DeliveryLayout>
    );
}
