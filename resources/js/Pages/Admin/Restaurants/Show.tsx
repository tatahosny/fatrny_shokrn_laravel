import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Store, MapPin, Phone, Mail, Clock, DollarSign, Users, ShoppingBag,
    Edit, ArrowRight, Ban, CheckCircle, Star, TrendingUp, AlertTriangle,
    Calendar, Percent, CreditCard, Receipt, FileText, Bike, UserX, Trash2
} from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface Props {
    restaurant: any;
    stats: {
        total_orders: number;
        completed_orders: number;
        total_revenue: number;
        platform_commission: number;
        avg_order_value: number;
        active_menu_items: number;
    };
    recentOrders: any[];
    invoices?: any[];
}

const statusConfig: Record<string, { label: string; cls: string; desc: string }> = {
    ACTIVE: {
        label: 'نشط (مفتوح للطلبات)',
        cls: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        desc: 'الفاتورة معتمدة والمطعم يستقبل الطلبات',
    },
    SUSPENDED: {
        label: 'موقوف (معلق)',
        cls: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        desc: 'الحساب مقفول لعدم وجود فاتورة معتمدة أو بأمر الإدارة',
    },
    PENDING: {
        label: 'قيد المراجعة',
        cls: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        desc: 'بانتظار استكمال الإجراءات والاعتماد',
    },
    INACTIVE: {
        label: 'غير نشط',
        cls: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700',
        desc: 'المطعم مغلق حالياً',
    },
};

export default function RestaurantShow({ restaurant, stats, recentOrders, invoices = [] }: Props) {
    const [suspending, setSuspending] = useState(false);
    const [confirmSuspend, setConfirmSuspend] = useState(false);

    // Delete states
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
    const [confirmDeleteRestaurant, setConfirmDeleteRestaurant] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const ownerStaff = restaurant.staff?.find((s: any) => s.role === 'OWNER' || s.role === 'RESTAURANT_OWNER') || restaurant.staff?.[0];
    const ownerUser = ownerStaff?.user;
    const hasAccount = !!ownerUser;

    const handleSuspend = () => {
        setConfirmSuspend(true);
    };

    const doSuspend = () => {
        setConfirmSuspend(false);
        setSuspending(true);
        router.post(`/admin/restaurants/${restaurant.id}/suspend`, {}, {
            preserveScroll: true,
            onFinish: () => setSuspending(false),
        });
    };

    const handleActivate = () => {
        setSuspending(true);
        router.post(`/admin/restaurants/${restaurant.id}/activate`, {}, {
            preserveScroll: true,
            onFinish: () => setSuspending(false),
        });
    };

    const doDeleteAccount = () => {
        setConfirmDeleteAccount(false);
        setDeleting(true);
        router.delete(`/admin/restaurants/${restaurant.id}/account`, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    };

    const doDeleteRestaurant = () => {
        setConfirmDeleteRestaurant(false);
        setDeleting(true);
        router.delete(`/admin/restaurants/${restaurant.id}`, {
            onFinish: () => setDeleting(false),
        });
    };

    const sc = statusConfig[restaurant.status] ?? statusConfig.INACTIVE;
    const fmt = (v: number) => Number(v || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <>
            <Head title={`${restaurant.name} — فطرنا`} />
            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/restaurants"
                            className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-orange-600 transition shadow-xs"
                            title="العودة للمطاعم"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-stone-900 dark:text-white">{restaurant.name}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.cls}`}>
                                    {sc.label}
                                </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {restaurant.address || 'العنوان غير محدد'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/admin/restaurants/${restaurant.id}/edit`}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition"
                        >
                            <Edit className="w-4 h-4" />
                            <span>تعديل البيانات</span>
                        </Link>
                        {restaurant.status === 'ACTIVE' ? (
                            <button
                                onClick={handleSuspend}
                                disabled={suspending || deleting}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-bold transition disabled:opacity-50"
                            >
                                <Ban className="w-4 h-4" />
                                <span>إيقاف المطعم</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleActivate}
                                disabled={suspending || deleting}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>تفعيل المطعم</span>
                            </button>
                        )}

                        {/* زر إزالة الأكونت */}
                        {hasAccount && (
                            <button
                                onClick={() => setConfirmDeleteAccount(true)}
                                disabled={suspending || deleting}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-bold transition disabled:opacity-50"
                                title={`إزالة حساب الدخول (${ownerUser?.email})`}
                            >
                                <UserX className="w-4 h-4" />
                                <span>إزالة الأكونت</span>
                            </button>
                        )}

                        {/* زر إزالة المطعم */}
                        <button
                            onClick={() => setConfirmDeleteRestaurant(true)}
                            disabled={suspending || deleting}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            title="حذف المطعم وكافة بياناته نهائياً"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>إزالة المطعم</span>
                        </button>
                    </div>
                </div>

                {/* Suspension notice if suspended */}
                {restaurant.status === 'SUSPENDED' && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-amber-800 dark:text-amber-300">
                                حساب المطعم موقوف حالياً
                            </p>
                            <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-0.5">
                                {restaurant.suspension_reason || 'لعدم وجود فاتورة معتمدة ومسددة للمطعم في مركز التحصيل.'}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <Link
                                    href={`/admin/billing?restaurant_id=${restaurant.id}`}
                                    className="inline-flex items-center gap-1 text-xs font-black text-amber-800 dark:text-amber-300 hover:underline"
                                >
                                    <span>الانتقال لمركز التحصيل لاعتماد الفاتورة وتفعيل الحساب ←</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'إجمالي الطلبات', value: stats.total_orders, unit: 'طلب', icon: ShoppingBag, color: 'text-indigo-500' },
                        { label: 'الطلبات المكتملة', value: stats.completed_orders, unit: 'طلب', icon: CheckCircle, color: 'text-emerald-500' },
                        { label: 'إجمالي المبيعات (GMV)', value: `${fmt(stats.total_revenue)}`, unit: 'ج.م', icon: DollarSign, color: 'text-amber-500' },
                        { label: 'عمولة/ربح المنصة', value: `${fmt(stats.platform_commission)}`, unit: 'ج.م', icon: Percent, color: 'text-orange-500' },
                        { label: 'متوسط قيمة الطلب', value: `${fmt(stats.avg_order_value)}`, unit: 'ج.م', icon: TrendingUp, color: 'text-purple-500' },
                        { label: 'عناصر القائمة النشطة', value: stats.active_menu_items, unit: 'صنف', icon: Star, color: 'text-pink-500' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
                            <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-stone-900 dark:text-white">{item.value}</span>
                                <span className="text-[10px] text-stone-400 font-bold">{item.unit}</span>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content: Info & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Financial Agreement & Orders */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Financial Agreement Card */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-orange-500" />
                                    اتفاق التعاقد المالي
                                </h2>
                                <Link
                                    href={`/admin/billing?restaurant_id=${restaurant.id}`}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span>سجل الفواتير والتحصيل</span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                                    <p className="text-xs text-stone-400 mb-1">نوع التعاقد</p>
                                    <div className="flex items-center gap-2">
                                        {restaurant.commission_type === 'PERCENTAGE' ? (
                                            <>
                                                <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600">
                                                    <Percent className="w-4 h-4" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-black text-stone-900 dark:text-white">
                                                        عمولة {restaurant.commission_percentage}%
                                                    </p>
                                                    <p className="text-[11px] text-stone-400">تُخصم من قيمة كل طلب مكتمل</p>
                                                </div>
                                            </>
                                        ) : restaurant.commission_type === 'SUBSCRIPTION' ? (
                                            <>
                                                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600">
                                                    <CreditCard className="w-4 h-4" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-black text-stone-900 dark:text-white">
                                                        اشتراك شهري {restaurant.monthly_subscription_fee} ج.م
                                                    </p>
                                                    <p className="text-[11px] text-stone-400">فاتورة دورية أول كل شهر</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm font-bold text-stone-600">{restaurant.commission_type || 'غير محدد'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                                    <p className="text-xs text-stone-400 mb-1">إعدادات التوصيل والطلبات</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-stone-500">رسوم التوصيل:</span>
                                            <span className="font-bold text-stone-900 dark:text-white">{restaurant.delivery_fee ?? 10} ج.م</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stone-500">الحد الأدنى للطلب:</span>
                                            <span className="font-bold text-stone-900 dark:text-white">{restaurant.minimum_order_amount ?? 20} ج.م</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stone-500">وقت التوصيل التقديري:</span>
                                            <span className="font-bold text-stone-900 dark:text-white">{restaurant.estimated_delivery_time ?? 30} دقيقة</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Invoices List */}
                            {invoices.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                                    <h3 className="text-xs font-black text-stone-700 dark:text-stone-300 mb-2.5">
                                        آخر الفواتير الصادرة للمطعم
                                    </h3>
                                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {invoices.map((inv: any) => (
                                            <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-stone-400" />
                                                    <div>
                                                        <span className="font-mono font-bold text-stone-900 dark:text-white">{inv.invoice_number}</span>
                                                        <span className="text-[10px] text-stone-400 block">{inv.issue_date}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-stone-900 dark:text-white">{fmt(inv.total_amount)} ج.م</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {inv.status === 'PAID' ? 'معتمدة ومسددة' : 'بانتظار الاعتماد'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-orange-500" />
                                    آخر الطلبات من المطعم
                                </h2>
                                <Link href="/admin/orders" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                                    عرض كل الطلبات ←
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead>
                                        <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold text-[11px]">
                                            <th className="py-2.5 px-3">رقم الطلب</th>
                                            <th className="py-2.5 px-3">العميل</th>
                                            <th className="py-2.5 px-3">الطيار</th>
                                            <th className="py-2.5 px-3">المبلغ</th>
                                            <th className="py-2.5 px-3">الحالة</th>
                                            <th className="py-2.5 px-3 text-center">إجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {recentOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-stone-400 font-bold">
                                                    لا توجد طلبات مسجلة بعد لهذا المطعم
                                                </td>
                                            </tr>
                                        ) : recentOrders.map((o: any) => (
                                            <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                                                <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-white">
                                                    #{o.order_number}
                                                </td>
                                                <td className="py-3 px-3 text-stone-700 dark:text-stone-300">
                                                    {o.customer?.user?.name || 'عميل'}
                                                </td>
                                                <td className="py-3 px-3 text-stone-500">
                                                    {o.delivery_driver?.name || 'لم يُحدد'}
                                                </td>
                                                <td className="py-3 px-3 font-black text-stone-900 dark:text-white">
                                                    {fmt(o.total_amount)} ج.م
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <Link
                                                        href={`/admin/orders/${o.id}`}
                                                        className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold text-[11px] hover:bg-orange-100 transition"
                                                    >
                                                        التفاصيل
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Details & Team */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Phone className="w-4 h-4 text-orange-500" />
                                بيانات التواصل وساعات العمل
                            </h2>
                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400">
                                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span className="font-mono text-stone-900 dark:text-white">{restaurant.phone || 'غير مسجل'}</span>
                                </div>
                                {restaurant.whatsapp && (
                                    <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400">
                                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="font-mono text-stone-900 dark:text-white">{restaurant.whatsapp}</span>
                                    </div>
                                )}
                                {restaurant.email && (
                                    <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400">
                                        <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                                        <span className="font-mono text-stone-900 dark:text-white">{restaurant.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400">
                                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span>
                                        من {restaurant.opening_time ? restaurant.opening_time.substring(0, 5) : '08:00'} إلى {restaurant.closing_time ? restaurant.closing_time.substring(0, 5) : '23:00'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Staff / Drivers Count */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-orange-500" />
                                الطاقم والطيارين
                            </h2>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800">
                                    <p className="text-xl font-black text-stone-900 dark:text-white">
                                        {restaurant.delivery_drivers?.length ?? 0}
                                    </p>
                                    <p className="text-[11px] text-stone-400 mt-0.5">طيار تابع للمطعم</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800">
                                    <p className="text-xl font-black text-stone-900 dark:text-white">
                                        {restaurant.staff?.length ?? 0}
                                    </p>
                                    <p className="text-[11px] text-stone-400 mt-0.5">موظف مسجل</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={confirmSuspend}
                    title="تأكيد إيقاف المطعم"
                    message={`هل أنت متأكد من رغبتك في إيقاف المطعم "${restaurant.name}"؟ سيتوقف عن استقبال الطلبات حتى إعادة التفعيل.`}
                    confirmText="إيقاف المطعم"
                    cancelText="إلغاء"
                    onConfirm={doSuspend}
                    onCancel={() => setConfirmSuspend(false)}
                    variant="danger"
                />

                <ConfirmModal
                    isOpen={confirmDeleteAccount}
                    title="إزالة حساب الدخول (الأكونت)"
                    message={`هل أنت متأكد من رغبتك في إزالة حساب الدخول الخاص بمطعم «${restaurant.name}» (${ownerUser?.email || ''})؟ سيتم حذف بيانات تسجيل الدخول وتفريغ البريد الإلكتروني ورقم الهاتف تماماً، مع بقاء بيانات المطعم وقائمته.`}
                    confirmText="نعم، احذف الأكونت"
                    cancelText="إلغاء"
                    onConfirm={doDeleteAccount}
                    onCancel={() => setConfirmDeleteAccount(false)}
                    variant="warning"
                />

                <ConfirmModal
                    isOpen={confirmDeleteRestaurant}
                    title="إزالة المطعم نهائياً"
                    message={`تحذير هام: هل أنت متأكد من حذف مطعم «${restaurant.name}» نهائياً؟ سيتم مسح المطعم وجميع أقسامه وأطباق المينيو والعروض وحسابات الدخول المرتبطة به نهائياً ولا يمكن التراجع.`}
                    confirmText="نعم، احذف المطعم نهائياً"
                    cancelText="إلغاء"
                    onConfirm={doDeleteRestaurant}
                    onCancel={() => setConfirmDeleteRestaurant(false)}
                    variant="danger"
                />
            </div>
        </>
    );
}
