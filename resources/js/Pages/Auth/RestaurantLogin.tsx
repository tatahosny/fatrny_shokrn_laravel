import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Store, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';

export default function RestaurantLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/restaurant/login');
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 font-sans">
            <Head title="تسجيل الدخول — بوابة المطاعم الشريكة" />

            <div className="max-w-md w-full space-y-8 bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/30">
                        <Store className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-white">
                        بوابة المطاعم الشريكة
                    </h1>
                    <p className="text-xs text-stone-400 mt-1">
                        استقبل الطلبات الحية، حدّث الأسعار، وتابع تقارير أرباحك
                    </p>
                </div>

                <div className="bg-stone-800/80 border border-stone-700 p-3 rounded-2xl text-xs">
                    <p className="font-bold text-orange-400">حساب تجريبي (مطعم الشبراوي):</p>
                    <p className="text-stone-300 font-mono mt-0.5">
                        البريد: owner@shabrawy.com<br />
                        كلمة المرور: password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1">
                            بريد إدارة المطعم
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:border-orange-500"
                                placeholder="owner@shabrawy.com"
                            />
                        </div>
                        {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                            <input
                                type="password"
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:border-orange-500"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded text-orange-600 focus:ring-orange-500"
                            />
                            <span>تذكر جلسة المطعم</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>{processing ? 'جارٍ تسجيل الدخول...' : 'دخول لوحة تحكم المطعم'}</span>
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-stone-800">
                    <Link href="/" className="text-xs text-stone-400 hover:text-white flex items-center justify-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        <span>العودة للموقع الرئيسي</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
