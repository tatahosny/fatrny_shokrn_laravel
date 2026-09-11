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
            { label: 'الأرباح والتدفقات', href: '/admin/finance', icon: DollarSign },
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
        <div className="admin-shell min-h-screen bg-[#0b1220] text-slate-100">
            <div className="admin-grid min-h-screen lg:grid-cols-[17.5rem_minmax(0,1fr)]">
                <aside className="admin-rail hidden lg:flex min-h-screen flex-col">
                    <Link href="/admin/dashboard" prefetch="hover" className="admin-brand">
                        <span className="admin-mark">ف</span>
                        <span>
                            <strong>منصة فطرنا</strong>
                            <small>غرفة عمليات برج العرب</small>
                        </span>
                    </Link>

                    <nav className="admin-nav custom-scrollbar">
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
                                            className={`admin-link ${active ? 'is-active' : ''}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div className="admin-user">
                        <div className="admin-avatar">{auth.user?.name?.charAt(0) || 'أ'}</div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{auth.user?.name}</p>
                            <p className="truncate text-[11px] text-cyan-200/70">مدير المنصة</p>
                        </div>
                        <Link href="/logout" method="post" as="button" className="admin-icon-btn" title="تسجيل الخروج">
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        <button className="absolute inset-0 bg-slate-950/70" onClick={() => setSidebarOpen(false)} />
                        <div className="admin-rail relative z-10 flex w-72 flex-col">
                            <div className="flex items-center justify-between px-5 py-5">
                                <span className="text-sm font-black">غرفة التحكم</span>
                                <button onClick={() => setSidebarOpen(false)} className="admin-icon-btn">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="admin-nav">
                                {navGroups.flatMap((group) => group.items).map((item) => {
                                    const Icon = item.icon;
                                    const active = isActivePath(currentPath, item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            prefetch="hover"
                                            onClick={() => setSidebarOpen(false)}
                                            className={`admin-link ${active ? 'is-active' : ''}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                <div className="flex min-w-0 flex-col">
                    <header className="admin-topbar">
                        <div className="flex min-w-0 items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="admin-icon-btn lg:hidden">
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <p className="admin-kicker">تشغيل المنصة</p>
                                <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">{activeLabel}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/" className="admin-chip hidden sm:inline-flex">
                                <ExternalLink className="h-3.5 w-3.5" />
                                المتجر
                            </Link>
                            <button onClick={toggleDarkMode} className="admin-icon-btn" aria-label="تبديل المظهر">
                                {darkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
                            </button>
                        </div>
                    </header>

                    {flash?.success && <div className="admin-flash is-success">{flash.success}</div>}
                    {flash?.error && <div className="admin-flash is-error">{flash.error}</div>}

                    <main className="admin-workspace">{children}</main>
                </div>
            </div>
        </div>
    );
}
