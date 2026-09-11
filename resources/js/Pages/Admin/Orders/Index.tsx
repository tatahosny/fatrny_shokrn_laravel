import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Order, PaginatedResponse } from '../../../Types';
import { ShoppingBag, Search, Eye, Filter } from 'lucide-react';

interface OrdersIndexProps {
    orders: PaginatedResponse<Order>;
    filters: { search?: string; status?: string };
}

export default function Index({ orders, filters }: OrdersIndexProps) {
    const items = orders?.data || [];
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/orders', { search, status: filters.status }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/admin/orders', { search, status: status === 'ALL' ? '' : status }, { preserveState: true });
    };

    return (
        <>
            <Head title="طلبات المنصة — فطرنا" />
            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                مراقبة وإدارة طلبات المنصة
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                سجل الطلبات المركزي عبر كافة مطاعم برج العرب
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                            {['ALL', 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                        (filters.status === st) || (!filters.status && st === 'ALL')
                                            ? 'bg-orange-600 text-white shadow-xs'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                    }`}
                                >
                                    {st === 'ALL' ? 'الكل' : st === 'PENDING' ? 'معلق' : st === 'PREPARING' ? 'تجهيز' : st === 'OUT_FOR_DELIVERY' ? 'مع الطيار' : st === 'DELIVERED' ? 'تم التسليم' : 'ملغي'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="mb-6 max-w-sm relative">
                        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث برقم الطلب (مثال: FS-2026...)"
                            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                        />
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                    <th className="py-3 px-4">رقم الطلب</th>
                                    <th className="py-3 px-4">المطعم</th>
                                    <th className="py-3 px-4">العميل</th>
                                    <th className="py-3 px-4">الكابتن</th>
                                    <th className="py-3 px-4">الإجمالي</th>
                                    <th className="py-3 px-4">عمولة المنصة</th>
                                    <th className="py-3 px-4">الحالة</th>
                                    <th className="py-3 px-4">التاريخ والوقت</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.map(order => (
                                    <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                        <td className="py-4 px-4 font-mono font-bold text-orange-600">
                                            {order.order_number}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                            {order.restaurant?.name}
                                        </td>
                                        <td className="py-4 px-4 text-stone-700 dark:text-stone-300">
                                            {order.customer?.user?.name || 'عميل'}
                                        </td>
                                        <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                            {order.deliveryDriver?.name || '—'}
                                        </td>
                                        <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                            {order.total_amount} ج.م
                                        </td>
                                        <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                            {order.platform_commission_amount || 0} ج.م
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-stone-400 font-mono text-[11px]">
                                            {new Date(order.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
