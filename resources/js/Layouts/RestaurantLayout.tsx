import React, { useMemo, useState } from 'react';
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
    Activity,
    Receipt,
} from 'lucide-react';
import { SharedInertiaProps } from '../Types';
import { useThemeMode } from '../hooks/useThemeMode';

interface RestaurantLayoutProps {
    children: React.ReactNode;
    title?: string;
    restaurantName?: string;
    isOpen?: boolean;
}

const navItems = [
    { label: 'الوردية', href: '/restaurant/dashboard', icon: LayoutDashboard },
    { label: 'الطلبات', href: '/restaurant/orders', icon: ShoppingBag },
    { label: 'المنيو', href: '/restaurant/menu', icon: UtensilsCrossed },
    { label: 'التصنيفات', href: '/restaurant/categories', icon: Layers },
    { label: 'العروض', href: '/restaurant/offers', icon: Tag },
    { label: 'الكباتن', href: '/restaurant/delivery-drivers', icon: Bike },
    { label: 'نشاط التوصيل', href: '/restaurant/driver-stats', icon: Activity },
    { label: 'الفواتير', href: '/restaurant/billing', icon: Receipt },
    { label: 'التقارير', href: '/restaurant/analytics', icon: BarChart3 },
    { label: 'إعدادات الفرع', href: '/restaurant/settings', icon: Settings },
];

function isActivePath(currentPath: string, href: string) {
    if (href === '/restaurant/dashboard') {
        return currentPath === href;
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function RestaurantLayout({
    children,
    title,
    restaurantName,
    isOpen,
}: RestaurantLayoutProps) {
    const page = usePage<SharedInertiaProps>();
    const { auth, flash, shell_restaurant } = page.props;
    const { darkMode, toggleDarkMode } = useThemeMode();
    const [menuOpen, setMenuOpen] = useState(false);
    const currentPath = page.url.split('?')[0];
    const branchName = restaurantName || shell_restaurant?.name || auth.user?.name || 'فرع شريك';
    const branchOpen = isOpen ?? shell_restaurant?.status === 'ACTIVE';

    const activeLabel = useMemo(() => {
        const match = navItems.find((item) => isActivePath(currentPath, item.href));
        return title || match?.label || 'الوردية';
    }, [currentPath, title]);

    return (
        <div className="restaurant-shell min-h-screen">
            <header className="kitchen-mast">
                <div className="flex min-w-0 items-center gap-3">
                    <button onClick={() => setMenuOpen(true)} className="kitchen-icon-btn lg:hidden">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="kitchen-seal">ف</div>
                    <div className="min-w-0">
                        <p className="kitchen-kicker">تذكرة المطبخ</p>
                        <h1 className="truncate text-base font-black text-[#3b2416] sm:text-lg">{branchName}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`kitchen-status ${branchOpen ? 'is-open' : 'is-closed'}`}>
                        <span />
                        {branchOpen ? 'الفرع يستقبل' : 'الفرع مغلق'}
                    </span>
                    <button onClick={toggleDarkMode} className="kitchen-icon-btn" aria-label="تبديل المظهر">
                        {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                    </button>
                    <Link href="/logout" method="post" as="button" className="kitchen-icon-btn" title="تسجيل الخروج">
                        <LogOut className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            <nav className="kitchen-tabs hidden lg:flex">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(currentPath, item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch="hover"
                            cacheFor="10m"
                            className={`kitchen-tab ${active ? 'is-active' : ''}`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {menuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <button className="absolute inset-0 bg-[#2b160c]/70" onClick={() => setMenuOpen(false)} />
                    <div className="relative z-10 flex w-72 flex-col bg-[#fff7ed] p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-black text-[#3b2416]">محطات الفرع</span>
                            <button onClick={() => setMenuOpen(false)} className="kitchen-icon-btn">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActivePath(currentPath, item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        prefetch="hover"
                                        cacheFor="10m"
                                        onClick={() => setMenuOpen(false)}
                                        className={`kitchen-tab w-full justify-start ${active ? 'is-active' : ''}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {flash?.success && <div className="kitchen-flash is-success">{flash.success}</div>}
            {flash?.error && <div className="kitchen-flash is-error">{flash.error}</div>}

            <div className="kitchen-pass">
                <p className="kitchen-station">{activeLabel}</p>
                <main className="restaurant-workspace">{children}</main>
            </div>
        </div>
    );
}
