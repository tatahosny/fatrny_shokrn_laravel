import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, User, ShoppingBag, MapPin, Calendar, GraduationCap, CheckCircle, XCircle, Phone } from 'lucide-react';

interface Customer {
    id: number;
    is_student: boolean;
    student_id: string | null;
    student_verified_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        is_active: boolean;
        created_at: string;
    };
    addresses: Array<{ id: number; label: string; address: string; is_default: boolean }>;
    orders: Array<{
        id: number;
        order_number: string;
        status: string;
        total_amount: number;
        created_at: string;
        restaurant: { name: string };
    }>;
}

interface Props {
    customer: Customer;
    stats: { total_orders: number; completed_orders: number; total_spent: number; avg_order_value: number };
}

export default function CustomerShow({ customer, stats }: Props) {
    const fmt = (v: number) => (v / 100).toFixed(2);

    return (
        <AdminLayout>
            <Head title={`${customer.user.name} — العملاء`} />

            <div className="space-y-6" dir="rtl">
                <div className="flex items-center gap-4">
                    <Link href="/admin/customers" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{customer.user.name}</h1>
                        <p className="text-stone-400 text-sm mt-1">{customer.user.email}</p>
                    </div>
                    {customer.is_student && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold">
                            <GraduationCap className="w-3 h-3" /> طالب
                            {customer.student_verified_at ? ' ✓' : ' (غير مؤكد)'}
                        </span>
                    )}
                    {!customer.user.is_active && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold">معطل</span>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'إجمالي الطلبات', value: stats.total_orders, icon: ShoppingBag, color: 'text-orange-400' },
                        { label: 'الطلبات المكتملة', value: stats.completed_orders, icon: CheckCircle, color: 'text-emerald-400' },
                        { label: 'إجمالي الإنفاق', value: `${fmt(stats.total_spent)} ج`, icon: ShoppingBag, color: 'text-amber-400' },
                        { label: 'متوسط الطلب', value: `${fmt(stats.avg_order_value)} ج`, icon: ShoppingBag, color: 'text-indigo-400' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                            <p className="text-xl font-bold text-white">{item.value}</p>
                            <p className="text-xs text-stone-400 mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">سجل الطلبات</h2>
                            {customer.orders.length === 0 ? (
                                <p className="text-stone-400 text-sm text-center py-8">لا توجد طلبات بعد</p>
                            ) : (
                                <div className="space-y-3">
                                    {customer.orders.map(order => (
                                        <Link key={order.id} href={`/admin/orders/${order.id}`}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                            <div>
                                                <p className="text-white text-sm font-medium">#{order.order_number}</p>
                                                <p className="text-stone-400 text-xs">{order.restaurant.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white text-sm font-semibold">{fmt(order.total_amount)} ج</p>
                                                <p className="text-stone-400 text-xs">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-4">معلومات الحساب</h3>
                            <div className="space-y-3">
                                <InfoRow icon={User} label="الاسم" value={customer.user.name} />
                                <InfoRow icon={Phone} label="الهاتف" value={customer.user.phone ?? '—'} />
                                <InfoRow icon={Calendar} label="تاريخ التسجيل" value={new Date(customer.user.created_at).toLocaleDateString('ar-EG')} />
                                {customer.is_student && (
                                    <InfoRow icon={GraduationCap} label="الرقم الجامعي" value={customer.student_id ?? '—'} />
                                )}
                            </div>
                        </div>

                        {customer.addresses.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-stone-300 mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> العناوين
                                </h3>
                                <div className="space-y-3">
                                    {customer.addresses.map(addr => (
                                        <div key={addr.id} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-stone-200">{addr.label}</span>
                                                {addr.is_default && <span className="text-xs text-emerald-400">افتراضي</span>}
                                            </div>
                                            <p className="text-stone-400 text-xs mt-0.5">{addr.address}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
                <p className="text-xs text-stone-500">{label}</p>
                <p className="text-sm text-stone-200">{value}</p>
            </div>
        </div>
    );
}
