import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { DeliveryDriver, Restaurant, PaginatedResponse } from '../../../Types';
import { Bike, Plus, Search, Filter, Trash2, Power, Store, Phone, ToggleLeft, ToggleRight } from 'lucide-react';

interface DriversIndexProps {
    drivers: PaginatedResponse<DeliveryDriver>;
    restaurants: Restaurant[];
    filters: { search?: string; restaurant_id?: string };
}

export default function Index({ drivers, restaurants, filters }: DriversIndexProps) {
    const items = drivers?.data || [];
    const [search, setSearch] = useState(filters.search || '');
    const [restaurantId, setRestaurantId] = useState(filters.restaurant_id || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get('/admin/delivery-drivers', { search, restaurant_id: restaurantId }, { preserveState: true });
    };

    const statusBadge = (driver: DeliveryDriver) => {
        if (!driver.is_active) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">معطل</span>;
        if (driver.availability_status === 'AVAILABLE') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">متصل ومتاح</span>;
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">مشغول / غير متاح</span>;
    };

    return (
        <Head title="كباتن التوصيل — لوحة الإدارة" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-stone-900 dark:text-white">كباتن التوصيل</h1>
                        <p className="text-xs text-stone-500 mt-0.5">
                            إدارة جميع مناديب التوصيل عبر المطاعم — {drivers.total} مندوب مسجل
                        </p>
                    </div>
                    <Link
                        href="/admin/delivery-drivers/create"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مندوب جديد</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex flex-wrap gap-3">
                    <div className="flex-1 min-w-48 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو الهاتف..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            className="w-full pr-8 pl-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <select
                        value={restaurantId}
                        onChange={e => setRestaurantId(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                    >
                        <option value="">كل المطاعم</option>
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        تصفية
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <Bike className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <p className="text-sm text-stone-500">لا يوجد مناديب توصيل مسجلون.</p>
                        </div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-700">
                                <tr>
                                    <th className="text-right px-5 py-3 font-bold text-stone-600 dark:text-stone-400">المندوب</th>
                                    <th className="text-right px-5 py-3 font-bold text-stone-600 dark:text-stone-400">المطعم التابع له</th>
                                    <th className="text-right px-5 py-3 font-bold text-stone-600 dark:text-stone-400">الهاتف</th>
                                    <th className="text-right px-5 py-3 font-bold text-stone-600 dark:text-stone-400">الحالة</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.map(driver => (
                                    <tr key={driver.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {driver.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-stone-900 dark:text-white">{driver.name}</p>
                                                    <p className="text-stone-400 text-[10px]">{driver.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {driver.restaurant ? (
                                                <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold">
                                                    <Store className="w-3.5 h-3.5" />
                                                    {driver.restaurant.name}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-[10px] font-bold bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
                                                    ⚠ غير مرتبط بمطعم
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-stone-600 dark:text-stone-300 font-mono">{driver.phone || '—'}</td>
                                        <td className="px-5 py-4">{statusBadge(driver)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => router.post(`/admin/delivery-drivers/${driver.id}/toggle`)}
                                                    title={driver.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition"
                                                >
                                                    {driver.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(driver.id)}
                                                    title="حذف المندوب"
                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {drivers.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: drivers.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => router.get('/admin/delivery-drivers', { ...filters, page })}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                                    page === drivers.current_page
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 max-w-sm w-full shadow-2xl z-10">
                        <h3 className="font-black text-stone-900 dark:text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-xs text-stone-500 mb-5">هل أنت متأكد من حذف هذا المندوب؟ سيتم حذف حسابه وجميع بياناته نهائياً.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { router.delete(`/admin/delivery-drivers/${deleteId}`); setDeleteId(null); }}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                            >
                                حذف نهائياً
                            </button>
                            <button
                                onClick={() => setDeleteId(null)}
                                className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
    );
}
