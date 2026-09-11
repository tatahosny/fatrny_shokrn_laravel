import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, ShoppingBag, Clock, User, Phone, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    subtotal_amount: number;
    delivery_fee: number;
    discount_amount: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    delivery_address: any;
    notes: string | null;
    created_at: string;
    restaurant: { id: number; name: string; slug: string };
    customer: { id: number; user: { name: string; email: string; phone?: string } };
    deliveryDriver: { id: number; user: { name: string } } | null;
    items: Array<{
        id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        menuItem: { name: string };
        notes: string | null;
    }>;
    statusHistory: Array<{
        id: number;
        status: string;
        note: string | null;
        created_at: string;
        user?: { name: string };
    }>;
}

interface Props { order: Order }

const statusMap: Record<string, { label: string; cls: string }> = {
    PENDING:       { label: 'في الانتظار', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    CONFIRMED:     { label: 'مؤكد', cls: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    PREPARING:     { label: 'قيد التحضير', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    OUT_FOR_DELIVERY: { label: 'في الطريق', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    DELIVERED:     { label: 'تم التوصيل', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    CANCELLED:     { label: 'ملغى', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function AdminOrderShow({ order }: Props) {
    const sc = statusMap[order.status] ?? statusMap.PENDING;
    const fmt = (v: number) => (v / 100).toFixed(2);

    return (
        <>
            <Head title={`طلب #${order.order_number} — فطرنا`} />
            <div className="space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">طلب #{order.order_number}</h1>
                            <p className="text-stone-400 text-sm mt-1">{new Date(order.created_at).toLocaleString('ar-EG')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${sc.cls}`}>{sc.label}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-400" />
                                عناصر الطلب
                            </h2>
                            <div className="space-y-3">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="text-white font-medium text-sm">{item.menuItem.name}</p>
                                            {item.notes && <p className="text-stone-400 text-xs mt-0.5">{item.notes}</p>}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-stone-300 text-sm">x{item.quantity} × {fmt(item.unit_price)} ج</p>
                                            <p className="text-white font-semibold text-sm">{fmt(item.total_price)} ج</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                <div className="flex justify-between text-sm text-stone-300">
                                    <span>المجموع الفرعي</span>
                                    <span>{fmt(order.subtotal_amount)} ج</span>
                                </div>
                                <div className="flex justify-between text-sm text-stone-300">
                                    <span>رسوم التوصيل</span>
                                    <span>{fmt(order.delivery_fee)} ج</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400">
                                        <span>الخصم</span>
                                        <span>- {fmt(order.discount_amount)} ج</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/10">
                                    <span>الإجمالي</span>
                                    <span>{fmt(order.total_amount)} ج</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-400" />
                                سجل الحالات
                            </h2>
                            <div className="relative space-y-4">
                                {order.statusHistory.map((h, i) => {
                                    const hSc = statusMap[h.status] ?? statusMap.PENDING;
                                    return (
                                        <div key={h.id} className="flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${hSc.cls}`}>
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 pb-4 border-b border-white/5 last:border-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white font-medium text-sm">{hSc.label}</span>
                                                    <span className="text-stone-500 text-xs">{new Date(h.created_at).toLocaleString('ar-EG')}</span>
                                                </div>
                                                {h.note && <p className="text-stone-400 text-xs mt-1">{h.note}</p>}
                                                {h.user && <p className="text-stone-500 text-xs mt-0.5">بواسطة: {h.user.name}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Restaurant */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-3">المطعم</h3>
                            <Link href={`/admin/restaurants/${order.restaurant.id}`}
                                className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                                {order.restaurant.name}
                            </Link>
                        </div>

                        {/* Customer */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" /> العميل
                            </h3>
                            <p className="text-white font-medium">{order.customer.user.name}</p>
                            <p className="text-stone-400 text-sm mt-1">{order.customer.user.email}</p>
                            {order.customer.user.phone && (
                                <p className="text-stone-400 text-sm mt-0.5">{order.customer.user.phone}</p>
                            )}
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> عنوان التوصيل
                            </h3>
                            {order.delivery_address ? (
                                <div className="text-sm text-stone-300 space-y-1">
                                    {order.delivery_address.street && <p>{order.delivery_address.street}</p>}
                                    {order.delivery_address.city && <p>{order.delivery_address.city}</p>}
                                    {order.delivery_address.notes && <p className="text-stone-400">{order.delivery_address.notes}</p>}
                                </div>
                            ) : <p className="text-stone-500 text-sm">غير محدد</p>}
                        </div>

                        {/* Delivery Driver */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-3">السائق</h3>
                            {order.deliveryDriver ? (
                                <p className="text-white font-medium">{order.deliveryDriver.user.name}</p>
                            ) : (
                                <p className="text-stone-500 text-sm">لم يتم التعيين بعد</p>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> الدفع
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-400">الطريقة</span>
                                    <span className="text-white">{order.payment_method === 'CASH' ? 'نقدي' : order.payment_method}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-400">الحالة</span>
                                    <span className={order.payment_status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>
                                        {order.payment_status === 'PAID' ? 'مدفوع' : 'في الانتظار'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-stone-300 mb-2">ملاحظات</h3>
                                <p className="text-stone-300 text-sm">{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
