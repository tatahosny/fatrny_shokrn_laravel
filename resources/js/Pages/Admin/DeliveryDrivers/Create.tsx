import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Restaurant } from '../../../Types';
import { ArrowRight, Save, User, Phone, Store, Lock } from 'lucide-react';

interface CreateDriverProps {
    restaurants: Restaurant[];
}

export default function Create({ restaurants }: CreateDriverProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        restaurant_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/delivery-drivers');
    };

    return (
        <Head title="إضافة مندوب — لوحة الإدارة" />

            <div className="max-w-2xl space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/delivery-drivers"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">إضافة مندوب توصيل جديد</h1>
                        <p className="text-xs text-stone-500 mt-0.5">أنشئ حساب مندوب وحدد المطعم التابع له</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Restaurant Assignment — Most important, shown first */}
                    <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-orange-200 dark:border-orange-900 shadow-xs">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Store className="w-4 h-4 text-orange-500" />
                            المطعم التابع له المندوب
                            <span className="text-red-500 text-xs">*</span>
                        </h2>
                        <p className="text-xs text-stone-500 mb-3">
                            يجب تحديد مطعم واحد فقط. المندوب سيكون حصرياً تابعاً لهذا المطعم ولن يظهر في أي مطعم آخر.
                        </p>
                        <select
                            required
                            value={data.restaurant_id}
                            onChange={e => setData('restaurant_id', e.target.value)}
                            className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                                errors.restaurant_id
                                    ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white'
                            }`}
                        >
                            <option value="">— اختر المطعم —</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        {errors.restaurant_id && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <span>⚠</span> {errors.restaurant_id}
                            </p>
                        )}
                        {data.restaurant_id && (
                            <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-2 font-bold">
                                ✓ سيكون المندوب تابعاً لـ: {restaurants.find(r => String(r.id) === data.restaurant_id)?.name}
                            </p>
                        )}
                    </div>

                    {/* Personal Info */}
                    <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-blue-500" />
                            البيانات الشخصية
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                                    الاسم الكامل <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="محمد أحمد"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                                        errors.name ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white'
                                    }`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                                    البريد الإلكتروني <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="driver@example.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                                        errors.email ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white'
                                    }`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                                    رقم الهاتف <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="01xxxxxxxxx"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                                        errors.phone ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white'
                                    }`}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Lock className="w-4 h-4 text-purple-500" />
                            كلمة مرور الحساب
                        </h2>
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                                كلمة المرور <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="8 أحرف على الأقل"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                                    errors.password ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white'
                                }`}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/admin/delivery-drivers"
                            className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !data.restaurant_id}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                        </button>
                    </div>
                </form>
            </div>
    );
}
