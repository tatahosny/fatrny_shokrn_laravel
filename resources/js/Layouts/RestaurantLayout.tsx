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
    Sparkles,
    Store,
    Flame,
    Activity,
    Receipt,
    ShieldAlert
} from 'lucide-react';
import { SharedInertiaProps } from '../Types';

interface RestaurantLayoutProps {
    children: React.ReactNode;
    title?: string;
    restaurantName?: string;
    isOpen?: boolean;
    activeTab?: string;
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
        { label: 'لوحة التحكم والطلبات الحية', href: '/restaurant/dashboard', icon: LayoutDashboard, badge: 'مباشر' },
        { label: 'إدارة الطلبات الواردة', href: '/restaurant/orders', icon: ShoppingBag },
        { label: 'قائمة الطعام والوجبات (المنيو)', href: '/restaurant/menu', icon: UtensilsCrossed, highlight: true },
        { label: 'تصنيفات المنيو', href: '/restaurant/categories', icon: Layers },
        { label: 'العروض وخصومات الطلاب', href: '/restaurant/offers', icon: Tag, highlight: true },
        { label: 'كباتن التوصيل للفرع', href: '/restaurant/delivery-drivers', icon: Bike },
        { label: 'إحصائيات ونشاط الكباتن', href: '/restaurant/driver-stats', icon: Activity },
        { label: 'الفواتير والاشتراكات', href: '/restaurant/billing', icon: Receipt, highlight: true },
        { label: 'تقارير المبيعات والأرباح', href: '/restaurant/analytics', icon: BarChart3 },
        { label: 'بيانات وإعدادات المطعم', href: '/restaurant/settings', icon: Settings },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="h-screen overflow-hidden flex bg-gradient-to-br from-stone-50 via-orange-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex flex-col w-72 h-screen bg-white/80 dark:bg-stone-900/90 backdrop-blur-xl border-l border-orange-100/80 dark:border-stone-800 shadow-2xl shadow-orange-500/5 shrink-0 select-none z-20">
                {/* Brand header */}
                <div className="h-24 px-6 flex items-center justify-between border-b border-orange-100/70 dark:border-stone-800/80">
                    <Link href="/restaurant/dashboard" className="flex items-center gap-3.5 group">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-all duration-300">
                                🍳
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-stone-900 rounded-full"></span>
                        </div>
                        <div className="min-w-0">
                            <span className="text-base font-black text-stone-900 dark:text-white block truncate max-w-[150px] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {restaurantName || auth.user?.name || 'مطعم شريك'}
                            </span>
                            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                لوحة تحكم الفرع
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Restaurant Status Banner */}
                <div className="px-4 pt-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200/50 dark:border-orange-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black text-stone-800 dark:text-stone-200">الفرع متصل ومباشر</span>
                        </div>
                        <Link 
                            href="/" 
                            target="_blank"
                            className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-1 rounded-lg border border-orange-200 dark:border-stone-700 shadow-xs"
                            title="معاينة المتجر للعملاء"
                        >
                            <span>المتجر</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Navigation menu */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href || (item.href !== '/restaurant/dashboard' && currentPath.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30 translate-x-1'
                                        : 'text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                                    <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer user */}
                <div className="p-4 border-t border-orange-100/70 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between rounded-t-3xl">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-stone-800 to-stone-700 text-orange-400 border border-stone-600/50 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                            {auth.user?.name?.charAt(0) || 'م'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-stone-900 dark:text-white truncate">{auth.user?.name}</p>
                            <p className="text-[10px] text-stone-400 font-bold truncate">مدير الفرع</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
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
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative flex flex-col w-72 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-l border-stone-200 dark:border-stone-800 z-10 shadow-2xl">
                        <div className="h-20 px-6 flex items-center justify-between border-b border-stone-100 dark:border-stone-800">
                            <span className="text-base font-black text-stone-900 dark:text-white">بوابة المطعم الشريك</span>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white">
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
                                        className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition ${
                                            isActive
                                                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-orange-100/70 dark:border-stone-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                                    {title || 'لوحة تحكم المطعم'}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                                    isOpen 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                                        : 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300'
                                }`}>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {isOpen ? 'المطعم جاهز لاستقبال الطلبات' : 'المطعم مغلق حالياً'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-stone-700 transition"
                            aria-label="Toggle Theme"
                        >
                            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-600" />}
                        </button>
                    </div>
                </header>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center justify-between animate-fade-in">
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-red-600 text-white text-xs font-black shadow-lg shadow-red-600/20 flex items-center justify-between animate-fade-in">
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-7xl w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

