import React from 'react';
import { Head } from '@inertiajs/react';
import { Shield, Users, Check } from 'lucide-react';

interface Role {
    name: string;
    users_count: number;
    permissions: string[];
}

interface Props {
    roles: Role[];
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'مدير عام', ADMIN: 'مدير', PLATFORM_STAFF: 'موظف منصة',
    RESTAURANT_OWNER: 'مالك مطعم', RESTAURANT_STAFF: 'موظف مطعم',
    DELIVERY_DRIVER: 'سائق توصيل', CUSTOMER: 'عميل',
};

const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'from-red-500/20 to-red-600/10 border-red-500/30',
    ADMIN: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    PLATFORM_STAFF: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    RESTAURANT_OWNER: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
    RESTAURANT_STAFF: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    DELIVERY_DRIVER: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    CUSTOMER: 'from-stone-500/20 to-stone-600/10 border-stone-500/30',
};

const permLabels: Record<string, string> = {
    'restaurants.view': 'عرض المطاعم',
    'restaurants.create': 'إنشاء المطاعم',
    'restaurants.update': 'تعديل المطاعم',
    'restaurants.delete': 'حذف المطاعم',
    'orders.view': 'عرض الطلبات',
    'orders.manage': 'إدارة الطلبات',
    'finance.view': 'عرض المالية',
    'finance.manage': 'إدارة المالية',
    'users.view': 'عرض المستخدمين',
    'users.manage': 'إدارة المستخدمين',
    'settings.manage': 'إدارة الإعدادات',
};

export default function AdminRolesIndex({ roles }: Props) {
    return (
        <>
            <Head title="الأدوار والصلاحيات — فطرنا" />
            <div className="space-y-6" dir="rtl">
                <div>
                    <h1 className="text-2xl font-bold text-white">الأدوار والصلاحيات</h1>
                    <p className="text-stone-400 text-sm mt-1">نظرة عامة على أدوار المستخدمين وصلاحياتهم</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {roles.map(role => (
                        <div key={role.name}
                            className={`bg-gradient-to-br ${roleColors[role.name] ?? roleColors.CUSTOMER} border rounded-2xl p-6`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-white/70" />
                                        <h2 className="text-lg font-bold text-white">{roleLabels[role.name] ?? role.name}</h2>
                                    </div>
                                    <p className="text-xs text-stone-400 mt-1 font-mono">{role.name}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                                    <Users className="w-3.5 h-3.5 text-stone-300" />
                                    <span className="text-sm text-stone-300 font-semibold">{role.users_count}</span>
                                </div>
                            </div>

                            {role.permissions.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-stone-500 uppercase font-medium mb-2">الصلاحيات</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions.map(perm => (
                                            <span key={perm}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-white/10 text-stone-300 rounded text-xs">
                                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                                {permLabels[perm] ?? perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-stone-500 text-xs">صلاحيات محدودة (حسب الدور)</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
