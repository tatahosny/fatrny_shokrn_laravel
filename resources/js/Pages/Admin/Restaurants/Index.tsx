import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Restaurant, PaginatedResponse } from '../../../Types';
import { Store, Plus, Search, Filter, Eye, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RestaurantsIndexProps {
    restaurants: PaginatedResponse<Restaurant & { orders_count: number; delivery_drivers_count: number }>;
    filters: { search?: string; status?: string };
}

export default function Index({ restaurants, filters }: RestaurantsIndexProps) {
    const items = restaurants?.data || [];
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/restaurants', { search, status: filters.status }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/admin/restaurants', { search, status: status === 'ALL' ? '' : status }, { preserveState: true });
    };

    const handleToggleStatus = (id: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        router.patch(`/admin/restaurants/${id}/status`, { status: nextStatus });
    };

    return (
        <Head title="إدارة المطاعم الشريكة — الإدارة المركزية" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                المطاعم الشريكة المسجلة
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                إدارة عقود المطاعم، نسب العمولات، والاشتراكات الشهرية في برج العرب
                            </p>
                        </div>

                        <Link
                            href="/admin/restaurants/create"
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة مطعم شريك جديد</span>
                        </Link>
                    </div>

                    {/* Filters bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث بالاسم أو البريد..."
                                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                            />
                        </form>

                        <div className="flex items-center gap-2">
                            {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                        (filters.status === st) || (!filters.status && st === 'ALL')
                                            ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                    }`}
                                >
                                    {st === 'ALL' ? 'الكل' : st === 'ACTIVE' ? 'نشط' : st === 'SUSPENDED' ? 'موقوف' : 'غير نشط'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Restaurants Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                    <th className="py-3 px-4">المطعم</th>
                                    <th className="py-3 px-4">الهاتف والفرع</th>
                                    <th className="py-3 px-4">نظام العمولة</th>
                                    <th className="py-3 px-4">الطلبات</th>
                                    <th className="py-3 px-4">الطيارين</th>
                                    <th className="py-3 px-4">الحالة</th>
                                    <th className="py-3 px-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.map(r => (
                                    <tr key={r.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                        <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">
                                                    {r.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span>{r.name}</span>
                                                    <span className="text-[10px] text-stone-400 block font-normal">{r.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                            <span className="font-mono block">{r.phone}</span>
                                            <span className="text-[11px] truncate block max-w-xs">{r.address}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-bold text-stone-800 dark:text-stone-200 block">
                                                {r.commission_type === 'PERCENTAGE' ? `${r.commission_percentage}% عمولة` : 'اشتراك شهري'}
                                            </span>
                                            {r.monthly_subscription_fee > 0 && (
                                                <span className="text-[10px] text-stone-400">
                                                    +{r.monthly_subscription_fee} ج.م / شهر
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-stone-800 dark:text-stone-200">
                                            {r.orders_count || 0} طلب
                                        </td>
                                        <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                            {r.delivery_drivers_count || 0} طيار
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                r.status === 'ACTIVE'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {r.status === 'ACTIVE' ? 'نشط معتمد' : 'موقوف'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center space-x-1 space-x-reverse">
                                            <button
                                                onClick={() => handleToggleStatus(r.id, r.status)}
                                                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-[11px] font-bold"
                                            >
                                                {r.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}
                                            </button>
                                            <Link
                                                href={`/restaurant/${r.slug}`}
                                                target="_blank"
                                                className="p-1.5 text-stone-400 hover:text-orange-600 inline-block"
                                                title="عرض المتجر"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
}
