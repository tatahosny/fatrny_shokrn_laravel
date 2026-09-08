import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
    Store, MapPin, Phone, Mail, Clock, DollarSign, Users, ShoppingBag,
    Edit, ArrowLeft, Ban, CheckCircle, Star, TrendingUp, AlertTriangle,
    Calendar, Percent
} from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo: string | null;
    cover_image: string | null;
    address: string;
    phone: string;
    email: string | null;
    status: string;
    opening_time: string;
    closing_time: string;
    delivery_fee: number;
    minimum_order_amount: number;
    estimated_delivery_time: number;
    commission_rate: number;
    tax_rate: number;
    payment_method: string;
    created_at: string;
    owner?: { id: number; name: string; email: string };
    staff_count?: number;
    orders_count?: number;
    menu_items_count?: number;
}

interface Props {
    restaurant: Restaurant;
    stats: {
        total_orders: number;
        completed_orders: number;
        total_revenue: number;
        platform_commission: number;
        avg_order_value: number;
        active_menu_items: number;
    };
    recentOrders: any[];
}

export default function RestaurantShow({ restaurant, stats, recentOrders }: Props) {
    const [suspending, setSuspending] = useState(false);
    const [confirmSuspend, setConfirmSuspend] = useState(false);

    const handleSuspend = () => {
        setConfirmSuspend(true);
    };

    const doSuspend = () => {
        setConfirmSuspend(false);
        setSuspending(true);
        router.post(`/admin/restaurants/${restaurant.id}/suspend`, {}, {
            onFinish: () => setSuspending(false),
        });
    };

    const handleActivate = () => {
        router.post(`/admin/restaurants/${restaurant.id}/activate`);
    };

    const statusConfig: Record<string, { label: string; cls: string }> = {
        ACTIVE: { label: 'نشط', cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
        SUSPENDED: { label: 'معلق', cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
        PENDING: { label: 'قيد المراجعة', cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
        INACTIVE: { label: 'غير نشط', cls: 'bg-stone-500/20 text-stone-400 border border-stone-500/30' },
    };

    const sc = statusConfig[restaurant.status] ?? statusConfig.INACTIVE;

    return (
        <AdminLayout>
            <Head title={`${restaurant.name} — المطاعم`} />

            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/restaurants" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-stone-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
                            <p className="text-stone-400 text-sm mt-1">{restaurant.address}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.cls}`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/restaurants/${restaurant.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                            <Edit className="w-4 h-4" />
                            تعديل
                        </Link>
                        {restaurant.status === 'ACTIVE' ? (
                            <button onClick={handleSuspend} disabled={suspending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50">
                                <Ban className="w-4 h-4" />
                                تعليق
                            </button>
                        ) : (
                            <button onClick={handleActivate}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition-colors">
                                <CheckCircle className="w-4 h-4" />
                                تفعيل
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'إجمالي الطلبات', value: stats.total_orders, icon: ShoppingBag, color: 'text-indigo-400' },
                        { label: 'الطلبات المكتملة', value: stats.completed_orders, icon: CheckCircle, color: 'text-emerald-400' },
                        { label: 'إجمالي الإيرادات', value: `${(stats.total_revenue / 100).toFixed(2)} ج`, icon: DollarSign, color: 'text-amber-400' },
                        { label: 'عمولة المنصة', value: `${(stats.platform_commission / 100).toFixed(2)} ج`, icon: Percent, color: 'text-orange-400' },
                        { label: 'متوسط الطلب', value: `${(stats.avg_order_value / 100).toFixed(2)} ج`, icon: TrendingUp, color: 'text-purple-400' },
                        { label: 'عناصر القائمة', value: stats.active_menu_items, icon: Star, color: 'text-pink-400' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                            <p className="text-2xl font-bold text-white">{item.value}</p>
                            <p className="text-xs text-stone-400 mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Restaurant Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">معلومات المطعم</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow icon={Phone} label="الهاتف" value={restaurant.phone} />
                                <InfoRow icon={Mail} label="البريد الإلكتروني" value={restaurant.email ?? '—'} />
                                <InfoRow icon={MapPin} label="العنوان" value={restaurant.address} />
                                <InfoRow icon={Clock} label="أوقات العمل" value={`${restaurant.opening_time} — ${restaurant.closing_time}`} />
                                <InfoRow icon={DollarSign} label="رسوم التوصيل" value={`${(restaurant.delivery_fee / 100).toFixed(2)} ج`} />
                                <InfoRow icon={ShoppingBag} label="الحد الأدنى للطلب" value={`${(restaurant.minimum_order_amount / 100).toFixed(2)} ج`} />
                                <InfoRow icon={Clock} label="وقت التوصيل" value={`${restaurant.estimated_delivery_time} دقيقة`} />
                                <InfoRow icon={Calendar} label="تاريخ الانضمام" value={new Date(restaurant.created_at).toLocaleDateString('ar-EG')} />
                            </div>
                            {restaurant.description && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-sm text-stone-400 leading-relaxed">{restaurant.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Financial Config */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-amber-400" />
                                الإعدادات المالية
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-amber-400">{restaurant.commission_rate}%</p>
                                    <p className="text-xs text-stone-400 mt-1">نسبة العمولة</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-indigo-400">{restaurant.tax_rate}%</p>
                                    <p className="text-xs text-stone-400 mt-1">نسبة الضريبة</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-sm font-bold text-emerald-400">{restaurant.payment_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'نقدي'}</p>
                                    <p className="text-xs text-stone-400 mt-1">طريقة الدفع</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">آخر الطلبات</h2>
                            {recentOrders.length === 0 ? (
                                <p className="text-stone-400 text-sm text-center py-8">لا توجد طلبات بعد</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentOrders.map((order: any) => (
                                        <Link key={order.id} href={`/admin/orders/${order.id}`}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                            <span className="text-sm text-stone-300">#{order.order_number}</span>
                                            <span className="text-sm text-white font-medium">{(order.total_amount / 100).toFixed(2)} ج</span>
                                            <span className="text-xs text-stone-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Logo */}
                        {restaurant.logo && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <img src={restaurant.logo} alt={restaurant.name} className="w-24 h-24 rounded-full object-cover mx-auto" />
                            </div>
                        )}

                        {/* Owner Info */}
                        {restaurant.owner && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-stone-300 mb-3">مالك المطعم</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{restaurant.owner.name}</p>
                                        <p className="text-stone-400 text-xs">{restaurant.owner.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-stone-300 mb-3">إجراءات سريعة</h3>
                            <div className="space-y-2">
                                <Link href={`/admin/restaurants/${restaurant.id}/edit`}
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-white/10 text-stone-300 text-sm transition-colors">
                                    <Edit className="w-4 h-4" /> تعديل بيانات المطعم
                                </Link>
                                <Link href={`/admin/finance/overview?restaurant=${restaurant.id}`}
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-white/10 text-stone-300 text-sm transition-colors">
                                    <DollarSign className="w-4 h-4" /> عرض المالية
                                </Link>
                                <Link href={`/admin/invoices?restaurant=${restaurant.id}`}
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-white/10 text-stone-300 text-sm transition-colors">
                                    <ShoppingBag className="w-4 h-4" /> الفواتير
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmSuspend}
                title="تعليق المطعم"
                message="هل تريد تعليق هذا المطعم؟ سيتوقف عن استقبال الطلبات تلقائياً."
                confirmText="تعليق المطعم"
                variant="warning"
                onConfirm={doSuspend}
                onCancel={() => setConfirmSuspend(false)}
            />
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
