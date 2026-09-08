import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Bike, 
    MapPin, 
    Clock, 
    User, 
    LogOut, 
    Moon, 
    Sun, 
    Phone, 
    CheckCircle2, 
    Navigation,
    History
} from 'lucide-react';
import { SharedInertiaProps } from '../Types';

interface DeliveryLayoutProps {
    children: React.ReactNode;
    title?: string;
    isAvailable?: boolean;
}

export default function DeliveryLayout({ 
    children, 
    title,
    isAvailable = true 
}: DeliveryLayoutProps) {
    const { auth, flash } = usePage<SharedInertiaProps>().props;
    const [darkMode, setDarkMode] = useState(false);
    const [available, setAvailable] = useState(isAvailable);

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

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-20 sm:pb-0 transition-colors duration-200">
            {/* Top Captain Bar */}
            <header className="sticky top-0 z-30 bg-stone-900 text-white px-4 py-3 shadow-md border-b border-stone-800">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                            <Bike className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                <span>بوابة الطيار</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    available ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-stone-800 text-stone-400'
                                }`}>
                                    {available ? 'جاهز للتوصيل' : 'غير متصل'}
                                </span>
                            </h1>
                            <p className="text-xs text-stone-400">{auth.user?.name || 'كابتن التوصيل'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                            aria-label="Toggle Theme"
                        >
                            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400"
                            title="خروج"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Flash notifications */}
            {flash?.success && (
                <div className="bg-emerald-600 text-white text-center py-2 px-4 text-xs font-bold animate-fade-in">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-600 text-white text-center py-2 px-4 text-xs font-bold animate-fade-in">
                    {flash.error}
                </div>
            )}

            {/* Page Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
                {children}
            </main>

            {/* Bottom Mobile Bar for Captains */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 py-2 px-4 flex items-center justify-around shadow-lg sm:hidden">
                <Link
                    href="/delivery/dashboard"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <Bike className="w-5 h-5" />
                    <span>الرئيسية</span>
                </Link>

                <Link
                    href="/delivery/active-order"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/active-order' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <Navigation className="w-5 h-5" />
                    <span>الطلب النشط</span>
                </Link>

                <Link
                    href="/delivery/order-history"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/order-history' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <History className="w-5 h-5" />
                    <span>السجل</span>
                </Link>

                <Link
                    href="/delivery/profile"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/profile' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <User className="w-5 h-5" />
                    <span>حسابي</span>
                </Link>
            </nav>
        </div>
    );
}
