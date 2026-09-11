import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowRight, Save, Store, DollarSign, Clock, Phone, Mail, MapPin, Percent, User, Lock } from 'lucide-react';

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
        <>
            <Head title="إضافة مطعم شريك — فطرنا" />
            <div className="max-w-4xl space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/restaurants"
                        className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-orange-600 transition shadow-xs"
                        title="العودة للمطاعم"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">إضافة مطعم شريك جديد</h1>
                        <p className="text-xs text-stone-400 mt-0.5">أدخل بيانات المطعم، إعدادات التوصيل وحساب المالك</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Restaurant Basic Info */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Store className="w-4 h-4 text-orange-500" />
                            بيانات المطعم الأساسية
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">اسم المطعم *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="مثال: مطعم الأصالة السوري"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">الوصف</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder="وصف مختصر للمطعم وأشهر وجباته..."
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">رقم الهاتف *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">البريد الإلكتروني للفرع</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="branch@restaurant.com"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">العنوان بالتفصيل *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="الحي الأول، برج العرب الجديدة، بجوار الجامعة"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-bold">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Owner Account */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-orange-500" />
                            بيانات حساب مالك المطعم (تسجيل الدخول)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">اسم المالك *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.owner_name}
                                    onChange={e => setData('owner_name', e.target.value)}
                                    placeholder="أحمد محمد"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.owner_name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.owner_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">البريد الإلكتروني للدخول *</label>
                                <input
                                    type="email"
                                    required
                                    value={data.owner_email}
                                    onChange={e => setData('owner_email', e.target.value)}
                                    placeholder="owner@restaurant.com"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.owner_email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.owner_email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">كلمة المرور *</label>
                                <input
                                    type="password"
                                    required
                                    value={data.owner_password}
                                    onChange={e => setData('owner_password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
                                />
                                {errors.owner_password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.owner_password}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Hours & Delivery */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-orange-500" />
                            مواعيد العمل وإعدادات التوصيل
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">وقت الافتتاح</label>
                                <input
                                    type="time"
                                    value={data.opening_time}
                                    onChange={e => setData('opening_time', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">وقت الإغلاق</label>
                                <input
                                    type="time"
                                    value={data.closing_time}
                                    onChange={e => setData('closing_time', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">وقت التحضير والتوصيل (دقيقة)</label>
                                <input
                                    type="number"
                                    value={data.estimated_delivery_time}
                                    onChange={e => setData('estimated_delivery_time', parseInt(e.target.value))}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">رسوم التوصيل الافتراضية (ج.م)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={data.delivery_fee}
                                    onChange={e => setData('delivery_fee', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">الحد الأدنى للطلب (ج.م)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={data.minimum_order_amount}
                                    onChange={e => setData('minimum_order_amount', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Config */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <DollarSign className="w-4 h-4 text-orange-500" />
                            النسب المالية والتحصيل
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">نسبة عمولة المنصة (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={data.commission_rate}
                                    onChange={e => setData('commission_rate', parseFloat(e.target.value))}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">نسبة الضريبة (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={data.tax_rate}
                                    onChange={e => setData('tax_rate', parseFloat(e.target.value))}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">طريقة الدفع المعتمدة</label>
                                <select
                                    value={data.payment_method}
                                    onChange={e => setData('payment_method', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                                >
                                    <option value="CASH">نقدي (Cash)</option>
                                    <option value="BANK_TRANSFER">تحويل بنكي / محفظة</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/admin/restaurants"
                            className="px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-xs transition"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs shadow-md transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري الحفظ...' : 'إنشاء المطعم وتفعيل الحساب'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
