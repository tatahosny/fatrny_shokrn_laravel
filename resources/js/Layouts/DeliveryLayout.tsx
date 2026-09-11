import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { 
    Bike, 
    User, 
    LogOut, 
    Moon, 
    Sun, 
    Navigation,
    History,
    Radio
} from 'lucide-react';
import { SharedInertiaProps } from '../Types';
import ErrorBoundary from '../Components/ErrorBoundary';

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
    const page = usePage<SharedInertiaProps>();
    const { auth, flash } = page.props;
    const currentPath = (page.url || '').split('?')[0];

    const [darkMode, setDarkMode] = useState(false);
    const [available, setAvailable] = useState(isAvailable);
    const [gpsStatus, setGpsStatus] = useState<'active' | 'searching' | 'denied'>('searching');
    const lastLocationSyncRef = useRef<number>(0);
    const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

    // 1. Dark mode initialization
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

    // 2. Global Captain Location Tracking (Runs continuously across all delivery pages)
    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus('denied');
            return;
        }

        let watchId: number | null = null;

        const handleSuccess = (pos: GeolocationPosition) => {
            const { latitude, longitude, speed, heading } = pos.coords;
            const now = Date.now();

            lastCoordsRef.current = { lat: latitude, lng: longitude };
            setGpsStatus('active');

            try {
                localStorage.setItem('captain_lat', String(latitude));
                localStorage.setItem('captain_lng', String(longitude));
            } catch { /* ignore */ }

            // Sync with backend every 5 seconds (throttled)
            if (now - lastLocationSyncRef.current > 5000) {
                lastLocationSyncRef.current = now;
                axios.post('/delivery/location', {
                    latitude,
                    longitude,
                    speed: speed || 0,
                    heading: heading || 0,
                }).catch(() => {});
            }
        };

        const handleError = (err: GeolocationPositionError) => {
            if (err.code === err.PERMISSION_DENIED) {
                setGpsStatus('denied');
            } else {
                setGpsStatus('searching');
            }
        };

        try {
            watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 3000,
            });
        } catch {
            setGpsStatus('denied');
        }

        // Before closing tab or locking phone, send final beacon to maintain tracking
        const handleUnloadOrHide = () => {
            if (lastCoordsRef.current) {
                const payload = JSON.stringify({
                    latitude: lastCoordsRef.current.lat,
                    longitude: lastCoordsRef.current.lng,
                });
                if (navigator.sendBeacon) {
                    const blob = new Blob([payload], { type: 'application/json' });
                    navigator.sendBeacon('/delivery/location', blob);
                } else {
                    axios.post('/delivery/location', lastCoordsRef.current).catch(() => {});
                }
            }
        };

        window.addEventListener('beforeunload', handleUnloadOrHide);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                handleUnloadOrHide();
            }
        });

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
            window.removeEventListener('beforeunload', handleUnloadOrHide);
        };
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem('captain_lat');
            localStorage.removeItem('captain_lng');
        } catch { /* ignore */ }
    };

    return (
        <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-20 sm:pb-0 transition-colors duration-200" dir="rtl">
            {/* Top Captain Bar */}
            <header className="sticky top-0 z-30 bg-stone-900 text-white px-4 py-3 shadow-md border-b border-stone-800">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shrink-0">
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

                    {/* Navigation Desktop */}
                    <nav className="hidden sm:flex items-center gap-1 bg-stone-800/80 p-1 rounded-2xl border border-stone-700/60">
                        <Link
                            href="/delivery/dashboard"
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                currentPath === '/delivery/dashboard' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                            }`}
                        >
                            <Bike className="w-4 h-4" />
                            <span>الرئيسية</span>
                        </Link>
                        <Link
                            href="/delivery/active-order"
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                currentPath === '/delivery/active-order' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                            }`}
                        >
                            <Navigation className="w-4 h-4" />
                            <span>الطلب النشط</span>
                        </Link>
                        <Link
                            href="/delivery/order-history"
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                currentPath === '/delivery/order-history' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            <span>سجل الطلبات</span>
                        </Link>
                        <Link
                            href="/delivery/profile"
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                currentPath === '/delivery/profile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>حسابي</span>
                        </Link>
                    </nav>

                    {/* Right utilities: GPS status + Dark Mode + Logout */}
                    <div className="flex items-center gap-2">
                        {/* Live GPS badge */}
                        <div 
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-bold ${
                                gpsStatus === 'active' 
                                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' 
                                    : gpsStatus === 'denied' 
                                    ? 'bg-red-950/60 border-red-700/60 text-red-300' 
                                    : 'bg-stone-800 border-stone-700 text-amber-300'
                            }`}
                            title={
                                gpsStatus === 'active' 
                                    ? 'موقعك المباشر يتم إرساله للمطعم والعميل بنجاح' 
                                    : gpsStatus === 'denied' 
                                    ? 'يرجى تفعيل صلاحية الـ GPS في متصفحك أو هاتفك' 
                                    : 'جاري التقاط إشارة GPS...'
                            }
                        >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                                gpsStatus === 'active' 
                                    ? 'bg-emerald-400 animate-pulse' 
                                    : gpsStatus === 'denied' 
                                    ? 'bg-red-400' 
                                    : 'bg-amber-400 animate-ping'
                            }`} />
                            <span className="hidden sm:inline">
                                {gpsStatus === 'active' ? 'GPS مباشر' : gpsStatus === 'denied' ? 'GPS معطل' : 'جاري البحث'}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
                            aria-label="Toggle Theme"
                        >
                            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            onClick={handleLogout}
                            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-red-400 cursor-pointer"
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

            {/* Page Content wrapped in ErrorBoundary */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
                <ErrorBoundary fallbackMessage="حدث خطأ في تحميل هذه الصفحة">
                    {children}
                </ErrorBoundary>
            </main>

            {/* Bottom Mobile Bar for Captains */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 py-2 px-4 flex items-center justify-around shadow-lg sm:hidden">
                <Link
                    href="/delivery/dashboard"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <Bike className="w-5 h-5" />
                    <span>الرئيسية</span>
                </Link>

                <Link
                    href="/delivery/active-order"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/active-order' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <Navigation className="w-5 h-5" />
                    <span>الطلب النشط</span>
                </Link>

                <Link
                    href="/delivery/order-history"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/order-history' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <History className="w-5 h-5" />
                    <span>السجل</span>
                </Link>

                <Link
                    href="/delivery/profile"
                    className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                        currentPath === '/delivery/profile' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                    <User className="w-5 h-5" />
                    <span>حسابي</span>
                </Link>
            </nav>
        </div>
    );
}
