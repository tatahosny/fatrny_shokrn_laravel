import React, { useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Store,
    ShoppingBag,
    Users,
    DollarSign,
    Receipt,
    BarChart3,
    Layers,
    Activity,
    Database,
    Settings,
    Moon,
    Sun,
    LogOut,
    Menu,
    X,
    ExternalLink,
    GraduationCap,
    Bike,
} from 'lucide-react';
import { SharedInertiaProps } from '../Types';
import { useThemeMode } from '../hooks/useThemeMode';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const navGroups = [
    {
        label: 'التشغيل',
        items: [
            { label: 'غرفة التحكم', href: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'المطاعم الشريكة', href: '/admin/restaurants', icon: Store },
            { label: 'طلبات المنصة', href: '/admin/orders', icon: ShoppingBag },
            { label: 'العملاء والطلاب', href: '/admin/customers', icon: GraduationCap },
            { label: 'المستخدمون', href: '/admin/users', icon: Users },
            { label: 'كباتن التوصيل', href: '/admin/delivery-drivers', icon: Bike },
        ],
    },
    {
        label: 'المال',
        items: [
            { label: 'المالية والأرباح', href: '/admin/finance', icon: DollarSign },
            { label: 'مركز التحصيل', href: '/admin/billing', icon: Receipt },
            { label: 'المؤشرات', href: '/admin/analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'النظام',
        items: [
            { label: 'المحتوى', href: '/admin/cms', icon: Layers },
            { label: 'سجل النشاط', href: '/admin/activity-logs', icon: Activity },
            { label: 'النسخ الاحتياطي', href: '/admin/backups', icon: Database },
            { label: 'الإعدادات', href: '/admin/settings', icon: Settings },
        ],
    },
];

function isActivePath(currentPath: string, href: string) {
    if (href === '/admin/dashboard') {
        return currentPath === href;
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const page = usePage<SharedInertiaProps>();
    const { auth, flash } = page.props;
    const { darkMode, toggleDarkMode } = useThemeMode();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = page.url.split('?')[0];

    const activeLabel = useMemo(() => {
        const match = navGroups.flatMap((group) => group.items).find((item) => isActivePath(currentPath, item.href));
        return title || match?.label || 'غرفة التحكم';
    }, [currentPath, title]);

    return (
        <div className="admin-shell min-h-screen text-stone-100" dir="rtl">
            <div className="admin-grid min-h-screen lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
                {/* Desktop Fixed/Sticky Sidebar */}
                <aside className="admin-rail hidden lg:flex lg:sticky lg:top-0 h-screen w-[17.5rem] flex-col overflow-hidden shrink-0">
                    <Link href="/admin/dashboard" prefetch="hover" className="admin-brand shrink-0">
                        <span className="admin-mark">ف</span>
                        <span>
                            <strong>منصة فطرنا</strong>
                            <small>غرفة عمليات برج العرب</small>
                        </span>
                    </Link>

                    <nav className="admin-nav custom-scrollbar flex-1 overflow-y-auto">
                        {navGroups.map((group) => (
                            <div key={group.label} className="admin-nav-group">
                                <p>{group.label}</p>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActivePath(currentPath, item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            prefetch="hover"
                                            cacheFor="10m"
                                            className={`admin-link ${active ? 'is-active' : ''}`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div className="admin-user shrink-0">
                        <div className="admin-avatar shrink-0">{auth.user?.name?.charAt(0) || 'أ'}</div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-stone-100">{auth.user?.name}</p>
                            <p className="truncate text-[11px] text-orange-400/80">مدير المنصة</p>
                        </div>
                        <Link href="/logout" method="post" as="button" className="admin-icon-btn shrink-0" title="تسجيل الخروج">
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </aside>

                {/* Mobile Drawer */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        <button
                            type="button"
                            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs transition-opacity"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="إغلاق القائمة"
                        />
                        <div className="admin-rail relative z-10 flex w-72 max-w-[85vw] flex-col h-full shadow-2xl">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-500/15 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <span className="admin-mark !w-8 !h-8 !text-sm">ف</span>
                                    <span className="text-sm font-black text-stone-100">غرفة التحكم</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="admin-icon-btn"
                                    aria-label="إغلاق"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="admin-nav custom-scrollbar flex-1 overflow-y-auto py-3">
                                {navGroups.map((group) => (
                                    <div key={group.label} className="admin-nav-group">
                                        <p>{group.label}</p>
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const active = isActivePath(currentPath, item.href);

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    prefetch="hover"
                                                    cacheFor="10m"
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`admin-link ${active ? 'is-active' : ''}`}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                            <div className="admin-user shrink-0 border-t border-orange-500/15">
                                <div className="admin-avatar shrink-0">{auth.user?.name?.charAt(0) || 'أ'}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-stone-100">{auth.user?.name}</p>
                                    <p className="truncate text-[11px] text-orange-400/80">مدير المنصة</p>
                                </div>
                                <Link href="/logout" method="post" as="button" className="admin-icon-btn shrink-0" title="تسجيل الخروج">
                                    <LogOut className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Viewport */}
                <div className="flex min-w-0 flex-col min-h-screen">
                    <header className="admin-topbar">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="admin-icon-btn lg:hidden"
                                aria-label="فتح القائمة"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <p className="admin-kicker">تشغيل المنصة</p>
                                <h1 className="truncate text-lg font-black tracking-tight sm:text-xl text-stone-100">{activeLabel}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/" className="admin-chip hidden sm:inline-flex">
                                <ExternalLink className="h-3.5 w-3.5" />
                                المتجر
                            </Link>
                            <button type="button" onClick={toggleDarkMode} className="admin-icon-btn" aria-label="تبديل المظهر">
                                {darkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
                            </button>
                        </div>
                    </header>

                    {flash?.success && <div className="admin-flash is-success">{flash.success}</div>}
                    {flash?.error && <div className="admin-flash is-error">{flash.error}</div>}

                    <main className="admin-workspace flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
