import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Store, DollarSign, Clock, Phone, Mail, MapPin, Percent } from 'lucide-react';

interface Restaurant {
    id: number;
    name: string;
    description: string;
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
}

interface Props {
    restaurant: Restaurant;
}

export default function RestaurantEdit({ restaurant }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: restaurant.name,
        description: restaurant.description ?? '',
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email ?? '',
        status: restaurant.status,
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
        delivery_fee: (restaurant.delivery_fee / 100).toFixed(2),
        minimum_order_amount: (restaurant.minimum_order_amount / 100).toFixed(2),
        estimated_delivery_time: restaurant.estimated_delivery_time,
        commission_rate: restaurant.commission_rate,
        tax_rate: restaurant.tax_rate,
        payment_method: restaurant.payment_method,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/restaurants/${restaurant.id}`);
    };

    return (
        <>
            <Head title={`تعديل ${restaurant.name} — فطرنا`} />
            <div className="max-w-4xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/admin/restaurants/${restaurant.id}`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">تعديل المطعم</h1>
                        <p className="text-stone-400 text-sm mt-1">{restaurant.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-orange-400" />
                            المعلومات الأساسية
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">اسم المطعم *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">الوصف</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                    rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">رقم الهاتف *</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">البريد الإلكتروني</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">العنوان *</label>
                                <input type="text" value={data.address} onChange={e => setData('address', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الحالة</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="ACTIVE">نشط</option>
                                    <option value="SUSPENDED">معلق</option>
                                    <option value="PENDING">قيد المراجعة</option>
                                    <option value="INACTIVE">غير نشط</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400" />
                            أوقات العمل والتوصيل
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">وقت الافتتاح</label>
                                <input type="time" value={data.opening_time} onChange={e => setData('opening_time', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">وقت الإغلاق</label>
                                <input type="time" value={data.closing_time} onChange={e => setData('closing_time', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">وقت التوصيل (دقيقة)</label>
                                <input type="number" value={data.estimated_delivery_time} onChange={e => setData('estimated_delivery_time', parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">رسوم التوصيل (ج.م)</label>
                                <input type="number" step="0.01" value={data.delivery_fee} onChange={e => setData('delivery_fee', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الحد الأدنى للطلب (ج.م)</label>
                                <input type="number" step="0.01" value={data.minimum_order_amount} onChange={e => setData('minimum_order_amount', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Financial Settings */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-400" />
                            الإعدادات المالية
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">نسبة العمولة (%)</label>
                                <input type="number" step="0.1" min="0" max="100" value={data.commission_rate} onChange={e => setData('commission_rate', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">نسبة الضريبة (%)</label>
                                <input type="number" step="0.1" min="0" max="100" value={data.tax_rate} onChange={e => setData('tax_rate', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">طريقة الدفع</label>
                                <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="CASH">نقدي</option>
                                    <option value="BANK_TRANSFER">تحويل بنكي</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/restaurants/${restaurant.id}`}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
