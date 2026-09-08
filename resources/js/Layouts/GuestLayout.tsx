import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Moon, 
    Sun, 
    Menu as MenuIcon, 
    X, 
    GraduationCap, 
    MapPin, 
    Phone, 
    ShieldCheck, 
    Store, 
    User as UserIcon, 
    LogOut,
    ChevronDown,
    UtensilsCrossed
} from 'lucide-react';
import { useCartStore } from '../Stores/cartStore';
import { SharedInertiaProps } from '../Types';
import CartDrawer from '../Components/CartDrawer';

interface GuestLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function GuestLayout({ children, title }: GuestLayoutProps) {
    const { auth, app_name, flash } = usePage<SharedInertiaProps>().props;
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const itemCount = useCartStore((state) => state.getItemCount());
    const total = useCartStore((state) => state.getTotal());
    const openCart = useCartStore((state) => state.openCart);

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

    const { url } = usePage();

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
            {/* Top Student Announcement Bar - Compact & Responsive */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs py-1.5 px-3 sm:px-4 shadow-xs">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 shrink-0">
                            <GraduationCap className="w-3 h-3 text-white animate-bounce" />
                        </span>
                        <span className="font-bold truncate text-[11px] sm:text-xs">
                            خصومات طلاب جامعة برج العرب (BATU)
                        </span>
                        <span className="hidden md:inline text-amber-100/90 text-[11px] truncate">
                            — خصم حصري يصل لـ 25% على وجباتك اليومية
                        </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <a 
                            href={`tel:${(usePage().props as any).support_phone || '01027961208'}`} 
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-100 hover:text-white transition"
                            title="اتصل بالدعم الفني"
                        >
                            <Phone className="w-3 h-3 text-amber-200" />
                            <span className="hidden sm:inline">الدعم الفني:</span>
                            <span dir="ltr">{(usePage().props as any).support_phone || '01027961208'}</span>
                        </a>
                        <Link 
                            href="/login" 
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-all whitespace-nowrap text-white"
                        >
                            <span>سجل كارنيهك 🎓</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation - Slim, Modern & Fully Responsive */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-3">
                        
                        {/* Logo & Brand Identity */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                                    فطرني شكراً
                                </span>
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100/80 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    BATU
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-1 bg-stone-100/70 dark:bg-stone-800/70 p-1 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                            <Link 
                                href="/" 
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    url === '/' 
                                        ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-xs' 
                                        : 'text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                            >
                                الرئيسية
                            </Link>
                            <Link 
                                href="/restaurants" 
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    url.startsWith('/restaurants') 
                                        ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-xs' 
                                        : 'text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                            >
                                المطاعم
                            </Link>
                            <Link 
                                href="/offers" 
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                    url.startsWith('/offers') 
                                        ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-xs' 
                                        : 'text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                            >
                                <span>العروض</span>
                                <span className="px-1.5 py-0.2 text-[9px] font-black bg-orange-500 text-white rounded-md">
                                    وفر
                                </span>
                            </Link>
                            <Link 
                                href="/leaderboard" 
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    url.startsWith('/leaderboard') 
                                        ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-xs' 
                                        : 'text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                            >
                                الأكثر طلباً
                            </Link>
                            <Link 
                                href="/contact" 
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    url.startsWith('/contact') 
                                        ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-xs' 
                                        : 'text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                            >
                                تواصل معنا
                            </Link>
                        </nav>

                        {/* Actions Cluster (Right side in RTL) */}
                        <div className="flex items-center gap-2">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                aria-label="Toggle Theme"
                                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                            </button>

                            {/* Cart Button */}
                            <button
                                type="button"
                                onClick={openCart}
                                className="relative p-2 rounded-xl bg-orange-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-orange-100 dark:hover:bg-stone-700 text-orange-600 dark:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer border border-orange-200/60 dark:border-stone-700"
                                aria-label="Open Cart"
                            >
                                <ShoppingBag className="w-4.5 h-4.5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                                        {itemCount}
                                    </span>
                                )}
                                {total > 0 && (
                                    <span className="hidden sm:inline-block text-xs font-bold text-orange-600 dark:text-orange-400">
                                        {total.toFixed(0)} ج.م
                                    </span>
                                )}
                            </button>

                            {/* User Auth state */}
                            {auth?.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="flex items-center gap-1.5 p-1 pr-2.5 pl-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition border border-stone-200/60 dark:border-stone-700"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                        <span className="hidden md:inline-block max-w-[100px] truncate">{auth.user.name}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                                    </button>

                                    {userDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-fade-in text-xs">
                                            <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800">
                                                <p className="text-[10px] text-stone-400">مرحباً بك</p>
                                                <p className="font-bold text-xs truncate">{auth.user.name}</p>
                                                <p className="text-[10px] text-orange-600 font-semibold">{auth.user.role}</p>
                                            </div>

                                            {/* Role Dashboard Routing */}
                                            {auth.user.role === 'SUPER_ADMIN' && (
                                                <Link href="/admin/dashboard" className="flex items-center gap-2 px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800">
                                                    <ShieldCheck className="w-4 h-4 text-purple-600" /> لوحة تحكم المنصة
                                                </Link>
                                            )}
                                            {auth.user.role === 'RESTAURANT_OWNER' && (
                                                <Link href="/restaurant/dashboard" className="flex items-center gap-2 px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800">
                                                    <Store className="w-4 h-4 text-orange-600" /> بوابة المطعم
                                                </Link>
                                            )}
                                            {auth.user.role === 'DELIVERY_DRIVER' && (
                                                <Link href="/delivery/dashboard" className="flex items-center gap-2 px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800">
                                                    <MapPin className="w-4 h-4 text-emerald-600" /> بوابة الطيار
                                                </Link>
                                            )}
                                            {auth.user.role === 'CUSTOMER' && (
                                                <>
                                                    <Link href="/customer/dashboard" className="flex items-center gap-2 px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800">
                                                        <UserIcon className="w-4 h-4 text-blue-600" /> حسابي وطلباتي
                                                    </Link>
                                                    <Link href="/customer/orders" className="flex items-center gap-2 px-3.5 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800">
                                                        <ShoppingBag className="w-4 h-4 text-amber-600" /> سجل الطلبات
                                                    </Link>
                                                </>
                                            )}

                                            <div className="border-t border-stone-100 dark:border-stone-800 mt-1 pt-1">
                                                <Link 
                                                    href="/logout" 
                                                    method="post" 
                                                    as="button" 
                                                    className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-right font-medium"
                                                >
                                                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <Link
                                        href="/login"
                                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs shadow-orange-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        href="/restaurant/login"
                                        className="hidden xl:inline-flex px-2.5 py-1.5 text-[11px] font-semibold rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition whitespace-nowrap"
                                    >
                                        شريك مطعم؟
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu toggle button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Open Mobile Menu"
                                className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown / Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-fade-in shadow-lg">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <Link 
                                href="/" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                                    url === '/' ? 'bg-orange-50 dark:bg-stone-800 text-orange-600' : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                                }`}
                            >
                                <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                                <span>الرئيسية</span>
                            </Link>
                            <Link 
                                href="/restaurants" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                                    url.startsWith('/restaurants') ? 'bg-orange-50 dark:bg-stone-800 text-orange-600' : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                                }`}
                            >
                                <Store className="w-4 h-4 text-orange-500" />
                                <span>المطاعم</span>
                            </Link>
                            <Link 
                                href="/offers" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                                    url.startsWith('/offers') ? 'bg-orange-50 dark:bg-stone-800 text-orange-600' : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                <span>العروض والخصومات</span>
                            </Link>
                            <Link 
                                href="/leaderboard" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                                    url.startsWith('/leaderboard') ? 'bg-orange-50 dark:bg-stone-800 text-orange-600' : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                                }`}
                            >
                                <GraduationCap className="w-4 h-4 text-amber-500" />
                                <span>الأكثر طلباً</span>
                            </Link>
                        </div>

                        <Link 
                            href="/contact" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block w-full py-2 px-3 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-center"
                        >
                            تواصل معنا والدعم الفني
                        </Link>

                        {!auth?.user && (
                            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full py-2.5 text-center text-xs font-bold bg-orange-600 text-white rounded-xl shadow-xs"
                                >
                                    تسجيل الدخول / حساب جديد
                                </Link>
                                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-semibold">
                                    <Link 
                                        href="/restaurant/login" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                                    >
                                        دخول المطاعم
                                    </Link>
                                    <Link 
                                        href="/delivery/login" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                                    >
                                        دخول الطيارين
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-emerald-500 text-white px-4 py-2.5 text-center text-xs font-semibold shadow-xs animate-fade-in">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-500 text-white px-4 py-2.5 text-center text-xs font-semibold shadow-xs animate-fade-in">
                    {flash.error}
                </div>
            )}

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto pt-16 pb-12 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {/* Col 1: Brand & University Info */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                                    <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-black text-white">فطرني شكراً</span>
                            </div>
                            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
                                المنظومة الرقمية الذكية لطلبات الإفطار والأطعمة الخاصة بـ{' '}
                                <strong className="text-orange-400">جامعة برج العرب التكنولوجية</strong>، مصممة لخدمة{' '}
                                <strong className="text-amber-400">فريق إدارة التقديمات</strong> والطلاب لتسهيل تجميع الطلبات وحساب الكميات بدقة وسرعة فائقة.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 border border-stone-700 text-xs text-orange-400 font-semibold">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>جامعة برج العرب التكنولوجية (BATU)</span>
                            </div>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div>
                            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                                <span>أقسام سريعة</span>
                            </h3>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <Link href="/" className="hover:text-orange-400 transition-colors">
                                        الرئيسية
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/restaurants" className="hover:text-orange-400 transition-colors">
                                        المطاعم الشريكة
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/leaderboard" className="hover:text-orange-400 transition-colors">
                                        الأكثر طلباً ولوحة الشرف
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/offers" className="hover:text-orange-400 transition-colors">
                                        العروض الحصرية
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-orange-400 transition-colors">
                                        سلة التسوق
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Team & System Support */}
                        <div>
                            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-orange-400" />
                                <span>الإدارة والتشغيل</span>
                            </h3>
                            <p className="text-xs text-stone-400 leading-relaxed mb-3">
                                مخصص لفريق إدارة التقديمات واللجان الطلابية لتنسيق وجبات الإفطار الجماعية وتتبع التسليم الفوري.
                            </p>
                            <div className="space-y-2">
                                <Link
                                    href="/admin/login"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-bold transition-colors w-full justify-center"
                                >
                                    <span>دخول المشرفين (Admin)</span>
                                </Link>
                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                    <Link href="/restaurant/login" className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition">
                                        دخول المطاعم
                                    </Link>
                                    <Link href="/delivery/login" className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition">
                                        دخول الطيارين
                                    </Link>
                                </div>
                                <div className="pt-2">
                                    <a
                                        href={`tel:${(usePage().props as any).support_phone || '01027961208'}`}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 hover:text-white transition group"
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            <Phone className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                                            <span>خط الدعم الفني:</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-orange-400" dir="ltr">
                                            {(usePage().props as any).support_phone || '01027961208'}
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
                        <p>
                            جميع الحقوق محفوظة © {new Date().getFullYear()} - فطرني شكراً | جامعة برج العرب التكنولوجية
                        </p>
                        <div className="flex items-center gap-1">
                            <span>صُنع بـ</span>
                            <span className="text-red-500 text-sm">❤️</span>
                            <span>لخدمة مجتمع طلاب برج العرب</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Global Cart Slide-Over Drawer */}
            <CartDrawer />
        </div>
    );
}
