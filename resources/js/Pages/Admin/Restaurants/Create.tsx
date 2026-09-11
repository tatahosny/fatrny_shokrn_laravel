import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Store, DollarSign, Clock } from 'lucide-react';

export default function RestaurantCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        opening_time: '08:00',
        closing_time: '23:00',
        delivery_fee: '10.00',
        minimum_order_amount: '20.00',
        estimated_delivery_time: 30,
        commission_rate: 15,
        tax_rate: 14,
        payment_method: 'CASH',
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/restaurants');
    };

    return (
        <Head title="إضافة مطعم جديد" />

            <div className="max-w-4xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/restaurants"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إضافة مطعم جديد</h1>
                        <p className="text-stone-400 text-sm mt-1">أدخل بيانات المطعم والمالك</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Restaurant Basic Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-orange-400" />
                            بيانات المطعم
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">اسم المطعم *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    placeholder="مطعم الأصالة"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">الوصف</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                    rows={3} placeholder="وصف مختصر للمطعم وأشهر أطباقه..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">رقم الهاتف *</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">البريد الإلكتروني</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                    placeholder="restaurant@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">العنوان *</label>
                                <input type="text" value={data.address} onChange={e => setData('address', e.target.value)}
                                    placeholder="برج العرب، الإسكندرية"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Owner Account */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-indigo-400" />
                            حساب المالك
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الاسم *</label>
                                <input type="text" value={data.owner_name} onChange={e => setData('owner_name', e.target.value)}
                                    placeholder="أحمد محمد"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">البريد الإلكتروني *</label>
                                <input type="email" value={data.owner_email} onChange={e => setData('owner_email', e.target.value)}
                                    placeholder="owner@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">كلمة المرور *</label>
                                <input type="password" value={data.owner_password} onChange={e => setData('owner_password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Hours & Delivery */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            أوقات العمل والتوصيل
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                <label className="block text-sm text-stone-400 mb-1">الحد الأدنى (ج.م)</label>
                                <input type="number" step="0.01" value={data.minimum_order_amount} onChange={e => setData('minimum_order_amount', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Financial */}
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

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/admin/restaurants"
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الإنشاء...' : 'إنشاء المطعم'}
                        </button>
                    </div>
                </form>
            </div>
    );
}
