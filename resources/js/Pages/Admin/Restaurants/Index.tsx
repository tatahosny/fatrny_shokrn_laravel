import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Restaurant, PaginatedResponse } from '../../../Types';
import { Store, Plus, Search, Eye, Edit2, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight, Trash2, UserX, UserCheck } from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface RestaurantsIndexProps {
    restaurants: PaginatedResponse<Restaurant & { orders_count: number; delivery_drivers_count: number; staff_count?: number; staff?: any[] }>;
    filters: { search?: string; status?: string };
}

const statusLabelMap: Record<string, { label: string; cls: string }> = {
    ACTIVE:    { label: 'نشط', cls: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' },
    SUSPENDED: { label: 'موقوف', cls: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400' },
    INACTIVE:  { label: 'غير نشط', cls: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400' },
    PENDING:   { label: 'انتظار', cls: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' },
};

export default function Index({ restaurants, filters }: RestaurantsIndexProps) {
    const items = restaurants?.data || [];
    const [search, setSearch] = useState(filters.search || '');
    const [processing, setProcessing] = useState<number | null>(null);

    // Delete modals state
    const [deleteAccountTarget, setDeleteAccountTarget] = useState<any | null>(null);
    const [deleteRestaurantTarget, setDeleteRestaurantTarget] = useState<any | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/restaurants', { search, status: filters.status }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        router.get('/admin/restaurants', { search, status: status === 'ALL' ? '' : status }, { preserveState: true });
    };

    const handleToggleStatus = (id: number, currentStatus: string) => {
        setProcessing(id);
        router.post(`/admin/restaurants/${id}/toggle-status`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const confirmDeleteAccount = () => {
        if (!deleteAccountTarget) return;
        setProcessing(deleteAccountTarget.id);
        router.delete(`/admin/restaurants/${deleteAccountTarget.id}/account`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(null);
                setDeleteAccountTarget(null);
            },
        });
    };

    const confirmDeleteRestaurant = () => {
        if (!deleteRestaurantTarget) return;
        setProcessing(deleteRestaurantTarget.id);
        router.delete(`/admin/restaurants/${deleteRestaurantTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(null);
                setDeleteRestaurantTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="المطاعم الشريكة — فطرنا" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <Store className="w-5 h-5 text-orange-500" />
                            المطاعم الشريكة
                        </h1>
                        <p className="text-xs text-stone-400 mt-0.5">
                            إدارة عقود وحسابات المطاعم في منصة فطرنا — برج العرب
                        </p>
                    </div>
                    <Link
                        href="/admin/restaurants/create"
                        className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مطعم شريك</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                    {/* Filters bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-stone-100 dark:border-stone-800">
                        <form onSubmit={handleSearch} className="w-full sm:w-72 relative">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث بالاسم أو الهاتف..."
                                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                            />
                        </form>

                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            {['ALL', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                                        (filters.status === st) || (!filters.status && st === 'ALL')
                                            ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                                    }`}
                                >
                                    {st === 'ALL' ? `الكل (${restaurants.total || 0})` : st === 'ACTIVE' ? 'نشط' : st === 'SUSPENDED' ? 'موقوف' : st === 'INACTIVE' ? 'غير نشط' : 'انتظار'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Restaurants Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-400 text-[11px] font-bold">
                                    <th className="py-3.5 px-4">المطعم</th>
                                    <th className="py-3.5 px-4">التواصل والموقع</th>
                                    <th className="py-3.5 px-4">نظام التعاقد</th>
                                    <th className="py-3.5 px-4 text-center">الطلبات</th>
                                    <th className="py-3.5 px-4 text-center">الطيارين</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <Store className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-700" />
                                            <p className="text-stone-400 font-bold">لا يوجد مطاعم مطابقة</p>
                                        </td>
                                    </tr>
                                ) : items.map(r => {
                                    const stCfg = statusLabelMap[r.status] ?? statusLabelMap.INACTIVE;
                                    const ownerStaff = r.staff?.find((s: any) => s.role === 'OWNER' || s.role === 'RESTAURANT_OWNER') || r.staff?.[0];
                                    const ownerUser = ownerStaff?.user;
                                    const hasAccount = !!ownerUser;

                                    return (
                                        <tr key={r.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                        r.status === 'ACTIVE' ? 'bg-emerald-500' :
                                                        r.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-stone-400'
                                                    }`} />
                                                    <div>
                                                        <Link
                                                            href={`/admin/restaurants/${r.id}`}
                                                            className="font-black text-stone-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition block"
                                                        >
                                                            {r.name}
                                                        </Link>
                                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                            <span className="text-[10px] text-stone-400 font-mono">{r.slug}</span>
                                                            {hasAccount ? (
                                                                <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-medium" title={`حساب الدخول: ${ownerUser.email}`}>
                                                                    <UserCheck className="w-2.5 h-2.5" />
                                                                    <span>{ownerUser.email}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-400">
                                                                    بدون أكونت
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                                <span className="font-mono block text-xs">{r.phone || '—'}</span>
                                                <span className="text-[11px] truncate block max-w-[200px]">{r.address || '—'}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {r.commission_type === 'PERCENTAGE' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold text-[10px]">
                                                        عمولة {r.commission_percentage}%
                                                    </span>
                                                ) : r.commission_type === 'SUBSCRIPTION' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold text-[10px]">
                                                        اشتراك {r.monthly_subscription_fee} ج/شهر
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold text-[10px]">
                                                        {r.commission_type || 'غير محدد'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center font-black text-stone-800 dark:text-stone-200">
                                                {r.orders_count || 0}
                                                <span className="text-stone-400 font-normal text-[10px] block">طلب</span>
                                            </td>
                                            <td className="py-4 px-4 text-center text-stone-600 dark:text-stone-400">
                                                {r.delivery_drivers_count || 0}
                                                <span className="text-stone-400 font-normal text-[10px] block">طيار</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stCfg.cls}`}>
                                                    {stCfg.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={`/admin/restaurants/${r.id}`}
                                                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/50 dark:hover:text-orange-400 transition"
                                                        title="التفاصيل"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/restaurants/${r.id}/edit`}
                                                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-blue-100 hover:text-blue-600 transition"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleStatus(r.id, r.status)}
                                                        disabled={processing === r.id}
                                                        className={`p-1.5 rounded-lg transition disabled:opacity-50 ${
                                                            r.status === 'ACTIVE'
                                                                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100'
                                                                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                                        }`}
                                                        title={r.status === 'ACTIVE' ? 'إيقاف المطعم' : 'تفعيل المطعم'}
                                                    >
                                                        {r.status === 'ACTIVE'
                                                            ? <ShieldAlert className="w-3.5 h-3.5" />
                                                            : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    </button>
                                                    
                                                    {/* زر إزالة الأكونت */}
                                                    <button
                                                        onClick={() => setDeleteAccountTarget(r)}
                                                        disabled={!hasAccount || processing === r.id}
                                                        className={`p-1.5 rounded-lg transition ${
                                                            hasAccount
                                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                                                                : 'bg-stone-100 dark:bg-stone-800/50 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-30'
                                                        }`}
                                                        title={hasAccount ? `إزالة أكونت (${ownerUser.email})` : 'لا يوجد حساب دخول مرتبط بالمطعم'}
                                                    >
                                                        <UserX className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* زر إزالة المطعم */}
                                                    <button
                                                        onClick={() => setDeleteRestaurantTarget(r)}
                                                        disabled={processing === r.id}
                                                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition disabled:opacity-50"
                                                        title="إزالة المطعم نهائياً"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {restaurants.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-xs text-stone-400">
                                {restaurants.from}–{restaurants.to} من {restaurants.total} مطعم
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => router.get('/admin/restaurants', { ...filters, page: restaurants.current_page - 1 }, { preserveState: true })}
                                    disabled={restaurants.current_page === 1}
                                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 disabled:opacity-40 transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-stone-500 px-2">{restaurants.current_page} / {restaurants.last_page}</span>
                                <button
                                    onClick={() => router.get('/admin/restaurants', { ...filters, page: restaurants.current_page + 1 }, { preserveState: true })}
                                    disabled={restaurants.current_page === restaurants.last_page}
                                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 disabled:opacity-40 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Confirm Delete Account */}
            <ConfirmModal
                isOpen={!!deleteAccountTarget}
                title="إزالة حساب الدخول (الأكونت)"
                message={`هل أنت متأكد من رغبتك في إزالة حساب الدخول الخاص بمطعم «${deleteAccountTarget?.name}»؟ سيتم حذف بيانات تسجيل الدخول وتفريغ البريد الإلكتروني ورقم الهاتف، مع بقاء بيانات المطعم نفسه وقائمته.`}
                confirmText="نعم، إزالة الأكونت"
                cancelText="إلغاء"
                variant="warning"
                onConfirm={confirmDeleteAccount}
                onCancel={() => setDeleteAccountTarget(null)}
            />

            {/* Modal: Confirm Delete Restaurant */}
            <ConfirmModal
                isOpen={!!deleteRestaurantTarget}
                title="إزالة المطعم نهائياً"
                message={`تحذير هام: هل أنت متأكد من حذف مطعم «${deleteRestaurantTarget?.name}» نهائياً؟ سيتم مسح المطعم وجميع أقسامه وأطباق المينيو والعروض وحسابات الدخول المرتبطة به نهائياً من قاعدة البيانات ولا يمكن التراجع.`}
                confirmText="نعم، حذف المطعم نهائياً"
                cancelText="إلغاء"
                variant="danger"
                onConfirm={confirmDeleteRestaurant}
                onCancel={() => setDeleteRestaurantTarget(null)}
            />
        </>
    );
}
