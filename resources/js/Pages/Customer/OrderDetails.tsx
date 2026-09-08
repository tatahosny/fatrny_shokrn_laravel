import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import { Order, OrderStatus } from '../../Types';
import { 
    Clock, 
    Bike, 
    Store, 
    MapPin, 
    Phone, 
    CheckCircle2, 
    FileText, 
    GraduationCap, 
    ArrowRight,
    ExternalLink
} from 'lucide-react';

interface OrderDetailsProps {
    order: Order;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
    const steps: { key: OrderStatus; label: string }[] = [
        { key: 'PENDING', label: 'تم تقديم الطلب' },
        { key: 'CONFIRMED', label: 'تم التأكيد' },
        { key: 'PREPARING', label: 'المطعم يجهز الوجبة' },
        { key: 'READY_FOR_PICKUP', label: 'جاهز للاستلام' },
        { key: 'OUT_FOR_DELIVERY', label: 'الطيار في الطريق' },
        { key: 'DELIVERED', label: 'تم التوصيل' },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === order.status);

    const getStatusBadge = (status: string) => {
        const map: { [key: string]: { label: string; bg: string; text: string } } = {
            PENDING: { label: 'قيد الانتظار', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-300' },
            CONFIRMED: { label: 'تم التأكيد', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-300' },
            PREPARING: { label: 'المطعم يجهز الوجبة', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-800 dark:text-orange-300' },
            READY_FOR_PICKUP: { label: 'جاهز للاستلام', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-300' },
            ASSIGNED_TO_DRIVER: { label: 'تم تعيين الطيار', bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-800 dark:text-indigo-300' },
            OUT_FOR_DELIVERY: { label: 'الطيار في الطريق إليك', bg: 'bg-teal-100 dark:bg-teal-950', text: 'text-teal-800 dark:text-teal-300' },
            DELIVERED: { label: 'تم التوصيل بنجاح', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-300' },
            CANCELLED: { label: 'ملغي', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-300' },
        };
        const s = map[status] || { label: status, bg: 'bg-stone-100', text: 'text-stone-700' };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    return (
        <CustomerLayout title={`تفاصيل الطلب ${order.order_number}`}>
            <Head title={`تفاصيل الطلب ${order.order_number} — فطرنا شكراً`} />

            <div className="space-y-6">
                {/* Header card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-stone-900 dark:text-white font-mono">
                                {order.order_number}
                            </h1>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                            تاريخ ووقت الطلب: {new Date(order.created_at).toLocaleString('ar-EG')}
                        </p>
                    </div>

                    <Link
                        href="/customer/orders"
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1"
                    >
                        <span>الرجوع لسجل الطلبات</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Progress Status Bar (if not cancelled) */}
                {order.status !== 'CANCELLED' && order.status !== 'REJECTED' && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-6">مراحل تنفيذ وتوصيل الطلب</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                            {steps.map((step, idx) => {
                                const isPassed = currentStepIndex >= idx;
                                const isCurrent = currentStepIndex === idx;
                                return (
                                    <div key={step.key} className="text-center space-y-2">
                                        <div className={`h-2 rounded-full transition-all ${
                                            isPassed ? 'bg-orange-600' : 'bg-stone-200 dark:bg-stone-800'
                                        }`} />
                                        <span className={`text-[11px] block font-bold leading-tight ${
                                            isCurrent 
                                                ? 'text-orange-600 dark:text-orange-400' 
                                                : isPassed 
                                                ? 'text-stone-800 dark:text-stone-200' 
                                                : 'text-stone-400'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items Breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                                الوجبات المطلوبة من {order.restaurant?.name}
                            </h2>

                            <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="py-3.5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-black text-xs">
                                                    {item.quantity}
                                                </span>
                                                <span className="font-bold text-sm text-stone-900 dark:text-white">
                                                    {item.name}
                                                </span>
                                            </div>
                                            {item.selected_options && (
                                                <p className="text-xs text-stone-500">
                                                    {JSON.stringify(item.selected_options)}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm text-stone-900 dark:text-white">
                                            {item.total_price} ج.م
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery address & notes */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white">
                                بيانات التوصيل
                            </h2>
                            <div className="space-y-2 text-xs">
                                <p className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                    <span>{order.address}</span>
                                </p>
                                {order.customer_notes && (
                                    <p className="flex items-start gap-2 text-stone-500 italic pt-1">
                                        <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                        <span>ملاحظاتك: {order.customer_notes}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column: Captain Info + Financial Total */}
                    <div className="space-y-6">
                        {/* Driver Card if assigned */}
                        {order.deliveryDriver && (
                            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-stone-900 border border-emerald-300 dark:border-stone-800 shadow-xs space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                        <Bike className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">كابتن التوصيل المعين</span>
                                        <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">{order.deliveryDriver.name}</h3>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${order.deliveryDriver.phone}`}
                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>اتصال بالكابتن: {order.deliveryDriver.phone}</span>
                                </a>
                            </div>
                        )}

                        {/* Invoice Summary */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 text-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">
                                الحساب المالي
                            </h2>

                            <div className="flex items-center justify-between text-stone-500">
                                <span>المجموع الفرعي</span>
                                <span className="font-bold text-stone-800 dark:text-stone-200">{order.subtotal} ج.م</span>
                            </div>

                            {Number(order.student_discount_amount) > 0 && (
                                <div className="flex items-center justify-between text-emerald-600 font-bold">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        خصم الطلاب
                                    </span>
                                    <span>-{order.student_discount_amount} ج.م</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-stone-500">
                                <span>رسوم التوصيل</span>
                                <span className="font-bold text-stone-800 dark:text-stone-200">{order.delivery_fee} ج.م</span>
                            </div>

                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-sm font-black text-stone-900 dark:text-white">
                                <span>الإجمالي المطلوب نقداً</span>
                                <span className="text-xl text-orange-600">{order.total_amount} ج.م</span>
                            </div>

                            <p className="text-[11px] text-stone-400 text-center pt-2">
                                طريقة الدفع: كاش عند الاستلام
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
