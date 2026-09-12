import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight, MapPin, ShoppingBag, Clock, User, Phone, DollarSign,
    CheckCircle2, XCircle, Store, Bike, AlertCircle, FileText,
    Percent, Check, Navigation, ShieldCheck, ChevronDown, RefreshCw
} from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface OrderItem {
    id: number;
    name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    selected_options?: Record<string, any>;
    selected_addons?: Array<any>;
    notes?: string | null;
    menuItem?: { id: number; name: string; image?: string };
}

interface OrderHistory {
    id: number;
    status: string;
    notes?: string | null;
    created_at: string;
    changedByUser?: { id: number; name: string; role: string } | null;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    subtotal: number;
    delivery_fee: number;
    discount_amount: number;
    student_discount_amount: number;
    service_fee: number;
    total_amount: number;
    platform_commission_amount: number;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    customer_notes?: string | null;
    restaurant_notes?: string | null;
    created_at: string;
    delivered_at?: string | null;
    google_maps_url?: string;
    restaurant?: { id: number; name: string; slug: string; phone?: string; address?: string };
    customer?: {
        id: number;
        student_status?: string;
        user?: { id: number; name: string; email: string; phone?: string };
    };
    deliveryDriver?: {
        id: number;
        name: string;
        phone: string;
        vehicle_type?: string;
        vehicle_plate?: string;
        availability_status?: string;
    } | null;
    items: OrderItem[];
    statusHistories?: OrderHistory[];
}

interface Props {
    order: Order;
    available_drivers?: Array<{
        id: number;
        name: string;
        phone: string;
        vehicle_type?: string;
        availability_status?: string;
    }>;
}

const statusConfig: Record<string, { label: string; cls: string; next?: string; nextLabel?: string }> = {
    PENDING: {
        label: 'في الانتظار',
        cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        next: 'CONFIRMED',
        nextLabel: 'تأكيد الطلب',
    },
    CONFIRMED: {
        label: 'مؤكد',
        cls: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        next: 'PREPARING',
        nextLabel: 'بدء التحضير',
    },
    PREPARING: {
        label: 'قيد التحضير',
        cls: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        next: 'READY_FOR_PICKUP',
        nextLabel: 'جاهز للاستلام',
    },
    READY_FOR_PICKUP: {
        label: 'جاهز للاستلام',
        cls: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        next: 'OUT_FOR_DELIVERY',
        nextLabel: 'خرج للتوصيل',
    },
    OUT_FOR_DELIVERY: {
        label: 'في الطريق مع الطيار',
        cls: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
        next: 'DELIVERED',
        nextLabel: 'تأكيد التسليم',
    },
    DELIVERED: {
        label: 'تم التسليم بنجاح',
        cls: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    CANCELLED: {
        label: 'ملغي',
        cls: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    },
    REJECTED: {
        label: 'مرفوض',
        cls: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    },
};

const roleLabelMap: Record<string, string> = {
    SUPER_ADMIN: 'الإدارة العليا',
    ADMIN: 'إدارة المنصة',
    PLATFORM_STAFF: 'فريق العمل',
    RESTAURANT_OWNER: 'مالك المطعم',
    RESTAURANT_STAFF: 'طاقم المطعم',
    DELIVERY_DRIVER: 'كابتن التوصيل',
    CUSTOMER: 'العميل',
};

const paymentMethodMap: Record<string, string> = {
    CASH_ON_DELIVERY: 'دفع نقدي عند الاستلام (كاش)',
    ONLINE_CARD: 'بطاقة دفع إلكترونية',
    WALLET: 'محفظة إلكترونية',
};

export default function AdminOrderShow({ order, available_drivers = [] }: Props) {
    const [updating, setUpdating] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string>(order.deliveryDriver?.id ? String(order.deliveryDriver.id) : '');
    const [cancelModal, setCancelModal] = useState(false);

    const sc = statusConfig[order.status] ?? statusConfig.PENDING;
    const fmt = (v: number) => Number(v || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleUpdateStatus = (newStatus: string) => {
        setUpdating(true);
        router.put(`/admin/orders/${order.id}/status`, { status: newStatus }, {
            preserveScroll: true,
            onFinish: () => setUpdating(false),
        });
    };

    const handleAssignDriver = (driverId: string) => {
        if (!driverId) return;
        setUpdating(true);
        router.post(`/admin/orders/${order.id}/assign-driver`, { delivery_driver_id: driverId }, {
            preserveScroll: true,
            onFinish: () => setUpdating(false),
        });
    };

    return (
        <>
            <Head title={`طلب #${order.order_number} — فطرنا`} />
            <div className="space-y-6" dir="rtl">
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/orders"
                            className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-orange-600 transition shadow-xs"
                            title="العودة لطلبات المنصة"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                    طلب #{order.order_number}
                                </h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.cls}`}>
                                    {sc.label}
                                </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(order.created_at).toLocaleString('ar-EG', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Fast Status Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {sc.next && (
                            <button
                                onClick={() => handleUpdateStatus(sc.next!)}
                                disabled={updating}
                                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition shadow-xs disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{sc.nextLabel}</span>
                            </button>
                        )}
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            <button
                                onClick={() => setCancelModal(true)}
                                disabled={updating}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold transition disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>إلغاء الطلب</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 3-Column Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer Card */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-stone-400 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-orange-500" />
                                بيانات العميل
                            </h2>
                            {order.customer?.student_status === 'APPROVED' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                                    طالب جامعي موثق
                                </span>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-black text-stone-900 dark:text-white">
                                {order.customer?.user?.name || 'عميل مسجل'}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5 font-mono">
                                {order.customer?.user?.email || '—'}
                            </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400">رقم الهاتف:</span>
                                {order.customer?.user?.phone ? (
                                    <a
                                        href={`tel:${order.customer.user.phone}`}
                                        className="font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{order.customer.user.phone}</span>
                                    </a>
                                ) : (
                                    <span className="text-stone-400 font-mono">غير متوفر</span>
                                )}
                            </div>
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-stone-400 shrink-0">عنوان التوصيل:</span>
                                <div className="text-left">
                                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-right">
                                        {order.address || '—'}
                                    </span>
                                    {order.google_maps_url && (
                                        <a
                                            href={order.google_maps_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1"
                                        >
                                            <Navigation className="w-3 h-3" />
                                            <span>فتح في الخريطة</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                            {order.customer_notes && (
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                                    <span className="font-bold block">ملاحظات العميل:</span>
                                    {order.customer_notes}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Restaurant Card */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-stone-400 flex items-center gap-1.5">
                                <Store className="w-4 h-4 text-orange-500" />
                                بيانات المطعم
                            </h2>
                            {order.restaurant?.id && (
                                <Link
                                    href={`/admin/restaurants/${order.restaurant.id}`}
                                    className="text-[11px] font-bold text-orange-600 hover:underline"
                                >
                                    ملف المطعم ←
                                </Link>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-black text-stone-900 dark:text-white">
                                {order.restaurant?.name || 'مطعم غير محدد'}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                                {order.restaurant?.address || 'العنوان غير مسجل'}
                            </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400">رقم هاتف المطعم:</span>
                                {order.restaurant?.phone ? (
                                    <a
                                        href={`tel:${order.restaurant.phone}`}
                                        className="font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{order.restaurant.phone}</span>
                                    </a>
                                ) : (
                                    <span className="text-stone-400 font-mono">غير متوفر</span>
                                )}
                            </div>
                            {order.restaurant_notes && (
                                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-700 dark:text-stone-300">
                                    <span className="font-bold block">ملاحظات المطعم:</span>
                                    {order.restaurant_notes}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Driver Card */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-stone-400 flex items-center gap-1.5">
                                <Bike className="w-4 h-4 text-orange-500" />
                                كابتن التوصيل (الطيار)
                            </h2>
                            {order.deliveryDriver && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    تم التعيين
                                </span>
                            )}
                        </div>

                        {order.deliveryDriver ? (
                            <div>
                                <p className="text-sm font-black text-stone-900 dark:text-white">
                                    {order.deliveryDriver.name}
                                </p>
                                <p className="text-xs text-stone-500 mt-0.5 font-mono">
                                    {order.deliveryDriver.vehicle_type ? `مركبة: ${order.deliveryDriver.vehicle_type}` : 'طيار معتمد'}
                                </p>
                            </div>
                        ) : (
                            <div className="py-1">
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    لم يتم تعيين طيار للطلب حتى الآن
                                </p>
                            </div>
                        )}

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                            {order.deliveryDriver?.phone && (
                                <div className="flex items-center justify-between">
                                    <span className="text-stone-400">رقم الكابتن:</span>
                                    <a
                                        href={`tel:${order.deliveryDriver.phone}`}
                                        className="font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{order.deliveryDriver.phone}</span>
                                    </a>
                                </div>
                            )}

                            {/* Driver Assign / Reassign Selector */}
                            <div>
                                <label className="block text-[11px] font-bold text-stone-500 mb-1">
                                    {order.deliveryDriver ? 'تغيير كابتن التوصيل:' : 'تعيين كابتن للطلب:'}
                                </label>
                                <div className="flex gap-1.5">
                                    <select
                                        value={selectedDriverId}
                                        onChange={e => setSelectedDriverId(e.target.value)}
                                        className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none"
                                    >
                                        <option value="">اختر كابتن من القائمة...</option>
                                        {available_drivers.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.phone})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleAssignDriver(selectedDriverId)}
                                        disabled={!selectedDriverId || updating}
                                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs disabled:opacity-40 transition"
                                    >
                                        تعيين
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Section: Items & Financials vs Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items & Financial breakdown (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items Table */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs">
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                                <ShoppingBag className="w-4 h-4 text-orange-500" />
                                أصناف الطلب ({order.items?.length ?? 0})
                            </h2>

                            <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                {order.items.map(item => (
                                    <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            {item.menuItem?.image ? (
                                                <img
                                                    src={`/storage/${item.menuItem.image}`}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 shrink-0">
                                                    <ShoppingBag className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-black text-stone-900 dark:text-white">
                                                    {item.name || item.menuItem?.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                                                    <span>الكمية: <b className="text-stone-700 dark:text-stone-300 font-mono">x{item.quantity}</b></span>
                                                    <span>•</span>
                                                    <span>سعر الوحدة: <b className="text-stone-700 dark:text-stone-300 font-mono">{fmt(item.unit_price)} ج.م</b></span>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-[11px] text-stone-500 mt-1 italic">
                                                        ملاحظة: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-left shrink-0">
                                            <span className="font-black text-sm text-stone-900 dark:text-white">
                                                {fmt(item.total_price)} ج.م
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Financial Summary */}
                            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                                <div className="flex justify-between text-stone-500">
                                    <span>المجموع الفرعي للأصناف:</span>
                                    <span className="font-mono font-bold text-stone-900 dark:text-white">{fmt(order.subtotal)} ج.م</span>
                                </div>
                                <div className="flex justify-between text-stone-500">
                                    <span>رسوم التوصيل:</span>
                                    <span className="font-mono font-bold text-stone-900 dark:text-white">{fmt(order.delivery_fee)} ج.م</span>
                                </div>
                                {Number(order.student_discount_amount) > 0 && (
                                    <div className="flex justify-between text-purple-600 font-bold">
                                        <span>خصم الطلاب:</span>
                                        <span className="font-mono">-{fmt(order.student_discount_amount)} ج.م</span>
                                    </div>
                                )}
                                {Number(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>الخصم الإضافي:</span>
                                        <span className="font-mono">-{fmt(order.discount_amount)} ج.م</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-stone-500">
                                    <span>عمولة المنصة من هذا الطلب:</span>
                                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                                        {fmt(order.platform_commission_amount)} ج.م
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-sm font-black text-stone-900 dark:text-white">
                                    <span>إجمالي المبلغ المطلوب من العميل:</span>
                                    <span className="text-lg text-orange-600 dark:text-orange-400 font-mono">
                                        {fmt(order.total_amount)} ج.م
                                    </span>
                                </div>
                                <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400">
                                    <span>طريقة الدفع: {paymentMethodMap[order.payment_method] || order.payment_method}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                                        order.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {order.payment_status === 'PAID' ? 'تم السداد' : 'بانتظار التحصيل'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Who confirmed it (1 col) */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                سجل التتبع ومين أكد الطلب
                            </h2>

                            <div className="relative pl-2 pr-4 border-r-2 border-stone-200 dark:border-stone-800 space-y-6 text-xs">
                                {(order.statusHistories && order.statusHistories.length > 0) ? (
                                    order.statusHistories.map((h, index) => (
                                        <div key={h.id} className="relative">
                                            {/* Dot */}
                                            <div className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white dark:border-stone-900" />

                                            <div className="flex items-baseline justify-between">
                                                <span className="font-black text-stone-900 dark:text-white">
                                                    {statusConfig[h.status]?.label || h.status}
                                                </span>
                                                <span className="text-[10px] text-stone-400 font-mono">
                                                    {new Date(h.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="mt-1 text-[11px] text-stone-500">
                                                {h.changedByUser ? (
                                                    <span className="inline-flex items-center gap-1 font-bold text-stone-700 dark:text-stone-300">
                                                        <User className="w-3 h-3 text-orange-500" />
                                                        {h.changedByUser.name} ({roleLabelMap[h.changedByUser.role] || h.changedByUser.role})
                                                    </span>
                                                ) : (
                                                    <span>بواسطة النظام تلقائياً</span>
                                                )}
                                            </div>

                                            {h.notes && (
                                                <p className="mt-1 p-2 rounded-lg bg-stone-50 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300">
                                                    {h.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div>
                                        <p className="text-xs text-stone-400">
                                            تم إنشاء الطلب بتاريخ {new Date(order.created_at).toLocaleString('ar-EG')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Confirm Modal */}
                <ConfirmModal
                    isOpen={cancelModal}
                    title="إلغاء الطلب"
                    message={`هل أنت متأكد من رغبتك في إيقاف وإلغاء الطلب #${order.order_number}؟ سيتم إخطار العميل والمطعم.`}
                    confirmText="تأكيد الإلغاء"
                    cancelText="تراجع"
                    onConfirm={() => {
                        setCancelModal(false);
                        handleUpdateStatus('CANCELLED');
                    }}
                    onCancel={() => setCancelModal(false)}
                    variant="danger"
                />
            </div>
        </>
    );
}
