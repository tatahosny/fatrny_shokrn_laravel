import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    UtensilsCrossed, 
    Layers, 
    Tag, 
    Bike, 
    BarChart3, 
    Settings, 
    Moon, 
    Sun, 
    LogOut, 
    Menu, 
    X, 
    ExternalLink,
    Clock,
    Circle
} from 'lucide-react';
import { SharedInertiaProps } from '../Types';

interface RestaurantLayoutProps {
    children: React.ReactNode;
    title?: string;
    restaurantName?: string;
    isOpen?: boolean;
}

export default function RestaurantLayout({ 
    children, 
    title, 
    restaurantName,
    isOpen = true 
}: RestaurantLayoutProps) {
    const { auth, flash } = usePage<SharedInertiaProps>().props;
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('fatrna_theme') === 'dark' || 
            (!('fatrna_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('fatrna_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('fatrna_theme', 'light');
        }
    };

    const navItems = [
        { label: 'لوحة التحكم والمتابعة', href: '/restaurant/dashboard', icon: LayoutDashboard },
        { label: 'الطلبات الواردة والنشطة', href: '/restaurant/orders', icon: ShoppingBag },
        { label: 'قائمة الأصناف والوجبات', href: '/restaurant/menu', icon: UtensilsCrossed },
        { label: 'تصنيفات المنيو', href: '/restaurant/categories', icon: Layers },
        { label: 'العروض والخصومات', href: '/restaurant/offers', icon: Tag },
        { label: 'كباتن التوصيل للمطعم', href: '/restaurant/delivery-drivers', icon: Bike },
        { label: 'تقارير المبيعات والأرباح', href: '/restaurant/analytics', icon: BarChart3 },
        { label: 'بيانات وإعدادات المطعم', href: '/restaurant/settings', icon: Settings },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen flex bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex flex-col w-72 bg-stone-900 text-stone-200 border-l border-stone-800 shrink-0 select-none">
                {/* Brand header */}
                <div className="h-20 px-6 flex items-center justify-between border-b border-stone-800/80">
                    <Link href="/restaurant/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/30">
                            مـ
                        </div>
                        <div>
                            <span className="text-base font-extrabold text-white block truncate max-w-[170px]">
                                {restaurantName || 'بوابة المطعم الشريك'}
                            </span>
                            <span className="text-[10px] font-semibold text-orange-400">لوحة تحكم الفرع</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation menu */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href || (item.href !== '/restaurant/dashboard' && currentPath.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30 translate-x-1'
                                        : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/70'
                                }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer user */}
                <div className="p-4 border-t border-stone-800/80 bg-stone-950/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {auth.user?.name?.charAt(0) || 'م'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{auth.user?.name}</p>
                            <p className="text-[10px] text-stone-400 font-medium truncate">مدير الفرع</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                        title="تسجيل الخروج"
                    >
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative flex flex-col w-72 bg-stone-900 text-stone-200 border-l border-stone-800 z-10 animate-slide-in-left">
                        <div className="h-20 px-6 flex items-center justify-between border-b border-stone-800">
                            <span className="text-lg font-bold text-white">بوابة المطعم</span>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-stone-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPath === item.href || (item.href !== '/restaurant/dashboard' && currentPath.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? 'bg-orange-600 text-white shadow-md'
                                                : 'text-stone-400 hover:text-white hover:bg-stone-800'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                                    {title || 'لوحة تحكم المطعم'}
                                </h1>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    isOpen 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                }`}>
                                    <Circle className={`w-2 h-2 fill-current ${isOpen ? 'text-emerald-500' : 'text-stone-400'}`} />
                                    {isOpen ? 'المطعم مفتوح لاستقبال الطلبات' : 'المطعم مغلق حالياً'}
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                استقبل الطلبات وحدث قائمة الطعام وتابع أرباحك لحظياً
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                            aria-label="Toggle Theme"
                        >
                            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="bg-emerald-600 text-white px-6 py-3 text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-600 text-white px-6 py-3 text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
