import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 font-sans">
            <Head title="تسجيل الدخول — الإدارة المركزية" />

            <div className="max-w-md w-full space-y-8 bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-white">
                        الإدارة المركزية للمنصة
                    </h1>
                    <p className="text-xs text-stone-400 mt-1">
                        منصة فطرنا شكراً — تحكم كامل ومؤشرات الأداء
                    </p>
                </div>

                <div className="bg-stone-800/80 border border-stone-700 p-3 rounded-2xl text-xs">
                    <p className="font-bold text-purple-400">بيانات دخول المدير:</p>
                    <p className="text-stone-300 font-mono mt-0.5">
                        البريد: admin@fatrna.com<br />
                        كلمة المرور: password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1">
                            البريد الإلكتروني للإدارة
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:border-purple-500"
                                placeholder="admin@fatrna.com"
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
                                className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:border-purple-500"
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
                                className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>تذكر جلسة الدخول</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>{processing ? 'جارٍ التحقق...' : 'دخول لوحة التحكم'}</span>
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
