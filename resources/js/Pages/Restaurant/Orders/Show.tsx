import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Order, DeliveryDriver } from '../../../Types';
import { 
    Clock, 
    Bike, 
    User, 
    MapPin, 
    Phone, 
    DollarSign, 
    CheckCircle2, 
    ArrowRight,
    UserCheck,
    AlertCircle
} from 'lucide-react';

interface OrderShowProps {
    order: Order;
    available_drivers: DeliveryDriver[];
}

function ItemSelections({ item }: { item: Order['items'][number] }) {
    const options = Array.isArray(item.selected_options) ? item.selected_options : [];
    const addons = Array.isArray(item.selected_addons) ? item.selected_addons : [];

    if (options.length === 0 && addons.length === 0) {
        return null;
    }

    return (
        <div className="mt-1 space-y-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            {options.map((option, index) => (
                <p key={`option-${index}`}>
                    {option.option_name}: {option.value_name}
                </p>
            ))}
            {addons.map((addon, index) => (
                <p key={`addon-${index}`}>إضافة: {addon.name}</p>
            ))}
        </div>
    );
}

export default function Show({ order, available_drivers = [] }: OrderShowProps) {
    const driver = order.delivery_driver || order.deliveryDriver;
    const [selectedDriverId, setSelectedDriverId] = useState(order.assigned_delivery_id || '');

    const handleAdvanceStatus = (status: string) => {
        router.patch(`/restaurant/orders/${order.id}/status`, { status });
    };

    const handleAssignDriver = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDriverId) return;
        router.post(`/restaurant/orders/${order.id}/assign-driver`, {
            driver_id: Number(selectedDriverId)
        });
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; bg: string }> = {
            PENDING: { label: 'بانتظار قبول المطعم', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
            CONFIRMED: { label: 'تم التأكيد', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
            PREPARING: { label: 'قيد الطهي والتجهيز', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
            READY_FOR_PICKUP: { label: 'جاهز بانتظار الطيار', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
            OUT_FOR_DELIVERY: { label: 'في الطريق للعميل', bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
            DELIVERED: { label: 'تم التسليم بنجاح', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
            CANCELLED: { label: 'طلب ملغي', bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
        };
        const s = map[status] || { label: status, bg: 'bg-stone-100 text-stone-700' };
        return <span className={`px-3 py-1 rounded-full text-xs font-black ${s.bg}`}>{s.label}</span>;
    };

    return (
        <Head title={`تفاصيل طلب ${order.order_number} — بوابة المطعم`} />

            <div className="space-y-6" dir="rtl">
                {/* Header card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-mono font-black text-orange-600">
                                {order.order_number}
                            </span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                            تاريخ الاستلام: {new Date(order.created_at).toLocaleString('ar-EG')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {order.status === 'PENDING' && (
                            <button
                                onClick={() => handleAdvanceStatus('CONFIRMED')}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                                تأكيد الطلب
                            </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                            <button
                                onClick={() => handleAdvanceStatus('PREPARING')}
                                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                            >
                                بدء التجهيز بالمطبخ
                            </button>
                        )}
                        {order.status === 'PREPARING' && (
                            <button
                                onClick={() => handleAdvanceStatus('READY_FOR_PICKUP')}
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                            >
                                تم التجهيز — جاهز للاستلام
                            </button>
                        )}

                        <Link
                            href="/restaurant/orders"
                            className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 mr-4"
                        >
                            <span>رجوع للطلبات</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                                محتويات الطلب للمطبخ
                            </h2>

                            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold">
                                                {item.quantity}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                                                    {item.name}
                                                </h3>
                                                <ItemSelections item={item} />
                                                {item.notes && (
                                                    <p className="text-[11px] text-amber-600 font-bold">
                                                        ملاحظة: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                                            {item.total_price} ج.م
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer details */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                            <h2 className="text-base font-black text-stone-900 dark:text-white">
                                بيانات العميل والعنوان
                            </h2>
                            <div className="space-y-2 text-xs">
                                <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-stone-400" />
                                    <span>الاسم: {order.customer?.user?.name || 'عميل'}</span>
                                </p>
                                {order.customer?.user?.phone && (
                                    <p className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                                        <Phone className="w-4 h-4 text-stone-400" />
                                        <a href={`tel:${order.customer.user.phone}`} className="hover:underline font-mono">
                                            {order.customer.user.phone}
                                        </a>
                                    </p>
                                )}
                                <p className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                    <span>{order.address}</span>
                                </p>
                                {order.customer_notes && (
                                    <p className="text-amber-600 italic">
                                        ملاحظة العميل: {order.customer_notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Driver Assignment & Financials */}
                    <div className="space-y-6">
                        {/* Driver Assignment Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Bike className="w-4 h-4 text-emerald-600" />
                                <span>كابتن التوصيل</span>
                            </h2>

                            {driver ? (
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-stone-800 border border-emerald-200 dark:border-stone-700 text-xs space-y-2">
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">الطيار المعين</p>
                                    <p className="font-bold text-sm text-stone-900 dark:text-white">{driver.name}</p>
                                    <p className="font-mono text-stone-500 font-bold">{driver.phone}</p>
                                    {driver.phone && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <a
                                                href={`tel:${driver.phone}`}
                                                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition"
                                            >
                                                اتصال بالطيار
                                            </a>
                                            <a
                                                href={`https://wa.me/2${driver.phone.replace(/^0/, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-1.5 px-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition"
                                            >
                                                واتساب
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleAssignDriver} className="space-y-3">
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">
                                        إسناد الطلب لطيار متاح
                                    </label>
                                    <select
                                        value={selectedDriverId}
                                        onChange={(e) => setSelectedDriverId(e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                                    >
                                        <option value="">-- اختر كابتن متاح --</option>
                                        {available_drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                                        ))}
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={!selectedDriverId}
                                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
                                    >
                                        إسناد وتكليف الطيار
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Financial Box */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 text-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">
                                الحساب المالي للطلب
                            </h2>

                            <div className="flex items-center justify-between text-stone-500">
                                <span>قيمة المنيو (المطبخ)</span>
                                <span className="font-bold text-stone-900 dark:text-white">{order.subtotal} ج.م</span>
                            </div>
                            <div className="flex items-center justify-between text-stone-500">
                                <span>رسوم التوصيل</span>
                                <span className="font-bold text-stone-900 dark:text-white">{order.delivery_fee} ج.م</span>
                            </div>
                            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-sm font-black text-stone-900 dark:text-white">
                                <span>إجمالي الطلب الكلي</span>
                                <span className="text-xl text-orange-600">{order.total_amount} ج.م</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}
