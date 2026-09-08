import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import GuestLayout from './GuestLayout';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    User, 
    GraduationCap, 
    MapPin, 
    LogOut,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { SharedInertiaProps, Customer } from '../Types';

interface CustomerLayoutProps {
    children: React.ReactNode;
    title?: string;
    customer?: Customer;
}

export default function CustomerLayout({ children, title, customer }: CustomerLayoutProps) {
    const { auth } = usePage<SharedInertiaProps>().props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        { label: 'لوحة التحكم والنشاط', href: '/customer/dashboard', icon: LayoutDashboard },
        { label: 'طلباتي ومتابعة التوصيل', href: '/customer/orders', icon: ShoppingBag },
        { label: 'الملف الشخصي والعناوين', href: '/customer/profile', icon: User },
    ];

    const studentStatus = customer?.student_status || 'NONE';

    return (
        <GuestLayout title={title}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Customer sidebar card */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-orange-500/20">
                                    {auth.user?.name?.charAt(0) || 'ع'}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-bold text-stone-900 dark:text-white truncate">
                                        {auth.user?.name}
                                    </h2>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                        {auth.user?.phone || auth.user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Student Verification Badge */}
                            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                        <GraduationCap className="w-4 h-4 text-orange-500" />
                                        خصم الطلاب
                                    </span>
                                    {studentStatus === 'APPROVED' && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 text-[10px]">
                                            <CheckCircle2 className="w-3 h-3" /> مفعل (10-20%)
                                        </span>
                                    )}
                                    {studentStatus === 'PENDING' && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 text-[10px]">
                                            <Clock className="w-3 h-3" /> قيد المراجعة
                                        </span>
                                    )}
                                    {studentStatus === 'REJECTED' && (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold flex items-center gap-1 text-[10px]">
                                            <AlertCircle className="w-3 h-3" /> تم الرفض
                                        </span>
                                    )}
                                    {studentStatus === 'NONE' && (
                                        <Link href="/customer/profile#student-id" className="text-orange-600 font-bold hover:underline text-[11px]">
                                            ارفع الكارنيه
                                        </Link>
                                    )}
                                </div>
                                {studentStatus === 'APPROVED' ? (
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        جامعة برج العرب التكنولوجية — يطبق الخصم تلقائياً عند الطلب!
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-stone-400">
                                        أكد هويتك الطلابية للحصول على خصومات حصرية في جميع مطاعم برج العرب.
                                    </p>
                                )}
                            </div>

                            {/* Nav links */}
                            <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPath === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                                                isActive
                                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-right mt-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>تسجيل الخروج</span>
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Customer Main View */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
