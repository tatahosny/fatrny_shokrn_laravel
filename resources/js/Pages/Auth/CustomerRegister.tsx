import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { GraduationCap, UserPlus, Mail, Lock, Phone, User as UserIcon } from 'lucide-react';

export default function CustomerRegister() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="إنشاء حساب جديد — فطرنا شكراً" />

            <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl">
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-stone-900 dark:text-white">
                            إنشاء حساب طالب / عميل
                        </h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                            انضم لمجتمع فطرنا شكراً في برج العرب واستمتع بخصومات حصرية
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                الاسم بالكامل
                            </label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                    placeholder="أحمد محمد"
                                />
                            </div>
                            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                    placeholder="student@batu.edu.eg أو بريدك الشخصي"
                                />
                            </div>
                            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                رقم الهاتف المحمول (لتسهيل توصيل الطلبات)
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                    placeholder="010xxxxxxxx"
                                />
                            </div>
                            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
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
                                    placeholder="•••••••• (8 أحرف على الأقل)"
                                />
                            </div>
                            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                تأكيد كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                                <input
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{processing ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب الآن'}</span>
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                        <span>لديك حساب بالفعل؟ </span>
                        <Link href="/login" className="text-orange-600 font-bold hover:underline">
                            سجل دخولك هنا
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
