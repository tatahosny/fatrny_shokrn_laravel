import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Order, PaginatedResponse } from '../../../Types';
import { ShoppingBag, Search, Eye, Filter, Phone, MapPin, ChevronLeft, ChevronRight, Store, Bike, User } from 'lucide-react';

interface OrdersIndexProps {
    orders: PaginatedResponse<Order & {
        customer?: { user?: { name: string; phone?: string } };
        deliveryDriver?: { name: string; phone?: string };
        restaurant?: { name: string; phone?: string };
        platform_commission_amount?: number;
    }>;
    filters: { search?: string; status?: string; restaurant_id?: string; date_from?: string; date_to?: string };
    statusCounts?: Record<string, number>;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:          { label: 'في الانتظار', cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
    CONFIRMED:        { label: 'مؤكد', cls: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
    PREPARING:        { label: 'قيد التحضير', cls: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' },
    READY_FOR_PICKUP: { label: 'جاهز للاستلام', cls: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400' },
    OUT_FOR_DELIVERY: { label: 'مع الطيار', cls: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400' },
    DELIVERED:        { label: 'تم التسليم', cls: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' },
    CANCELLED:        { label: 'ملغي', cls: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' },
    REJECTED:         { label: 'مرفوض', cls: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' },
};

export default function Index({ orders, filters, statusCounts = {} }: OrdersIndexProps) {
    const items = orders?.data || [];
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/orders', { ...filters, search }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/admin/orders', { ...filters, status: status === 'ALL' ? '' : status, page: 1 }, { preserveState: true });
    };

    const fmt = (v: number | string | null | undefined) => Number(v || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <>
            <Head title="طلبات المنصة — فطرنا" />
            <div className="space-y-6" dir="rtl">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    {/* Top Header & Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                مراقبة وإدارة طلبات المنصة
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                متابعة شاملة للطلبات من كافة المطاعم والعملاء والطيارين في برج العرب
                            </p>
                        </div>

                        {/* Status Filter Badges */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                            {[
                                { id: 'ALL', label: 'الكل' },
                                { id: 'PENDING', label: 'في الانتظار' },
                                { id: 'CONFIRMED', label: 'مؤكد' },
                                { id: 'PREPARING', label: 'قيد التحضير' },
                                { id: 'READY_FOR_PICKUP', label: 'جاهز' },
                                { id: 'OUT_FOR_DELIVERY', label: 'مع الطيار' },
                                { id: 'DELIVERED', label: 'تم التسليم' },
                                { id: 'CANCELLED', label: 'ملغي' },
                            ].map((st) => {
                                const count = statusCounts[st.id] ?? null;
                                const isSelected = (filters.status === st.id) || (!filters.status && st.id === 'ALL');
                                return (
                                    <button
                                        key={st.id}
                                        onClick={() => handleFilterStatus(st.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-orange-600 text-white shadow-xs'
                                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                                        }`}
                                    >
                                        <span>{st.label}</span>
                                        {count !== null && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                                isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                                            }`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <form onSubmit={handleSearch} className="mb-6 max-w-md relative">
                        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف أو المطعم..."
                            className="w-full pr-10 pl-4 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                        />
                    </form>

                    {/* Orders Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                    <th className="py-3.5 px-4">رقم الطلب</th>
                                    <th className="py-3.5 px-4">المطعم</th>
                                    <th className="py-3.5 px-4">العميل والتواصل</th>
                                    <th className="py-3.5 px-4">كابتن التوصيل</th>
                                    <th className="py-3.5 px-4">إجمالي الطلب</th>
                                    <th className="py-3.5 px-4">عمولة المنصة</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4">التاريخ</th>
                                    <th className="py-3.5 px-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-stone-400 font-bold">
                                            لا توجد طلبات مطابقة للبحث أو الفلتر
                                        </td>
                                    </tr>
                                ) : items.map(order => {
                                    const sc = statusConfig[order.status] ?? { label: order.status, cls: 'bg-stone-100 text-stone-600' };
                                    return (
                                        <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="font-mono font-black text-orange-600 dark:text-orange-400 hover:underline"
                                                >
                                                    #{order.order_number}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                                <div className="flex items-center gap-1.5">
                                                    <Store className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                    <span>{order.restaurant?.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-stone-800 dark:text-stone-200 font-bold">
                                                    {order.customer?.user?.name || 'عميل'}
                                                </div>
                                                {order.customer?.user?.phone && (
                                                    <span className="font-mono text-stone-400 text-[10px] block">
                                                        {order.customer.user.phone}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                {order.deliveryDriver ? (
                                                    <div>
                                                        <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                                                            <Bike className="w-3.5 h-3.5 text-emerald-500" />
                                                            {order.deliveryDriver.name}
                                                        </span>
                                                        {order.deliveryDriver.phone && (
                                                            <span className="font-mono text-stone-400 text-[10px] block">
                                                                {order.deliveryDriver.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-400 text-[11px]">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 font-black text-stone-900 dark:text-white font-mono">
                                                {fmt(order.total_amount)} ج.م
                                            </td>
                                            <td className="py-4 px-4 font-bold text-orange-600 dark:text-orange-400 font-mono">
                                                {fmt(order.platform_commission_amount)} ج.م
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sc.cls}`}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-stone-400 font-mono text-[11px]">
                                                {new Date(order.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 font-bold text-xs transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>التفاصيل</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-xs text-stone-400">
                                عرض {orders.from}–{orders.to} من إجمالي {orders.total} طلب
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => router.get('/admin/orders', { ...filters, page: orders.current_page - 1 }, { preserveState: true })}
                                    disabled={orders.current_page === 1}
                                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-40 transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-stone-500 font-mono px-2">
                                    {orders.current_page} / {orders.last_page}
                                </span>
                                <button
                                    onClick={() => router.get('/admin/orders', { ...filters, page: orders.current_page + 1 }, { preserveState: true })}
                                    disabled={orders.current_page === orders.last_page}
                                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-40 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
