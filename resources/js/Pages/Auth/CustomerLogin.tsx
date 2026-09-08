import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { GraduationCap, LogIn, ShieldCheck, Mail, Lock, Phone } from 'lucide-react';

export default function CustomerLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول — حساب الطالب والعميل" />

            <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl">
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-stone-900 dark:text-white">
                            مرحباً بك في فطرنا شكراً
                        </h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                            سجل دخولك لتتبع طلباتك والحصول على خصومات الطلاب المباشرة
                        </p>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 p-3 rounded-2xl text-xs">
                        <p className="font-bold text-amber-800 dark:text-amber-300">حساب تجريبي سريع:</p>
                        <p className="text-stone-600 dark:text-stone-300 font-mono mt-0.5">
                            البريد: customer@fatrna.com<br />
                            كلمة المرور: password
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                البريد الإلكتروني أو رقم الهاتف
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                    placeholder="your-email@example.com أو 010xxxxxxxx"
                                />
                            </div>
                            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer text-stone-600 dark:text-stone-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded text-orange-600 focus:ring-orange-500"
                                />
                                <span>تذكرني على هذا الجهاز</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{processing ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</span>
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                        <span>ليس لديك حساب بعد؟ </span>
                        <Link href="/register" className="text-orange-600 font-bold hover:underline">
                            أنشئ حسابك كطالب أو عميل
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
