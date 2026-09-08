import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bike, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';

export default function DeliveryLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/delivery/login');
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 font-sans">
            <Head title="تسجيل الدخول — بوابة كباتن التوصيل" />

            <div className="max-w-md w-full space-y-8 bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
                        <Bike className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-white">
                        بوابة كباتن التوصيل
                    </h1>
                    <p className="text-xs text-stone-400 mt-1">
                        استلم طلباتك، حدد مسارك عبر الخريطة، وأكّد استلام الكاش
                    </p>
                </div>

                <div className="bg-stone-800/80 border border-stone-700 p-3 rounded-2xl text-xs">
                    <p className="font-bold text-emerald-400">حساب تجريبي (كابتن محمود):</p>
                    <p className="text-stone-300 font-mono mt-0.5">
                        البريد: driver@shabrawy.com<br />
                        كلمة المرور: password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1">
                            البريد الإلكتروني للطيار
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:border-emerald-500"
                                placeholder="driver@shabrawy.com"
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
                                className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:border-emerald-500"
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
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>تذكرني أثناء العمل اليومي</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>{processing ? 'جارٍ تسجيل الدخول...' : 'دخول حساب الطيار'}</span>
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
