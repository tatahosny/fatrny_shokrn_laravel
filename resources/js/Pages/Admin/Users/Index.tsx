import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Users, 
    Shield, 
    Search, 
    CheckCircle2, 
    XCircle, 
    Mail, 
    Phone, 
    Calendar,
    ArrowRight,
    UserCheck,
    Lock
} from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    users: { 
        data: UserItem[]; 
        total: number; 
        current_page: number; 
        last_page: number;
        links?: Array<{ url: string | null; label: string; active: boolean }>;
    };
    roles?: Array<string | { id?: number; name?: string }>;
    filters?: { role?: string; search?: string };
}

const roleColors: Record<string, string> = {
    SUPER_ADMIN:      'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-300 dark:border-red-800',
    ADMIN:            'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    PLATFORM_STAFF:   'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    RESTAURANT_OWNER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    RESTAURANT_STAFF: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    DELIVERY_DRIVER:  'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    CUSTOMER:         'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
};

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'مدير عام', 
    ADMIN: 'مدير نظام', 
    PLATFORM_STAFF: 'موظف منصة',
    RESTAURANT_OWNER: 'مالك مطعم', 
    RESTAURANT_STAFF: 'موظف مطعم',
    DELIVERY_DRIVER: 'كابتن توصيل', 
    CUSTOMER: 'عميل طالب',
};

export default function AdminUsersIndex({ users, roles = [], filters = {} }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? '');
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Normalize roles to string array safely
    const normalizedRoles = (roles || []).map((r) => {
        if (typeof r === 'string') return r;
        return (r as any)?.name ? String((r as any).name) : String(r);
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { 
            search: search || undefined, 
            role: roleFilter || undefined 
        }, { preserveState: true });
    };

    const handleToggleActive = (id: number) => {
        router.post(`/admin/users/${id}/toggle-active`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        setConfirmDeleteId(id);
    };

    return (
        <AdminLayout title="إدارة المستخدمين والصلاحيات">
            <Head title="إدارة المستخدمين — الإدارة المركزية" />

            <div className="space-y-6 pb-12" dir="rtl">
                {/* Header Top Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">لوحة التحكم الإدارية</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                            المستخدمون والصلاحيات
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
                            إدارة حسابات المديرين، موظفي المنصة، وأصحاب الصلاحيات ({users?.total || 0} مسجل)
                        </p>
                    </div>

                    <Link 
                        href="/admin/users/create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-2xl font-black text-xs shadow-md shadow-orange-600/20 transition self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مستخدم جديد</span>
                    </Link>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)}
                                placeholder="بحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl pr-10 pl-4 py-2.5 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-colors text-xs" 
                            />
                        </div>

                        <select 
                            value={roleFilter} 
                            onChange={e => {
                                setRoleFilter(e.target.value);
                                router.get('/admin/users', { 
                                    search: search || undefined, 
                                    role: e.target.value || undefined 
                                }, { preserveState: true });
                            }}
                            className="w-full sm:w-56 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-2.5 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-colors text-xs font-bold"
                        >
                            <option value="">جميع الأدوار والصلاحيات</option>
                            {normalizedRoles.map(r => (
                                <option key={r} value={r}>
                                    {roleLabels[r] ?? r}
                                </option>
                            ))}
                        </select>

                        <button 
                            type="submit" 
                            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition shadow-xs"
                        >
                            بحث
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold">
                                <tr>
                                    <th className="px-6 py-4">المستخدم</th>
                                    <th className="px-6 py-4">الدور / الصلاحية</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">تاريخ الإنشاء</th>
                                    <th className="px-6 py-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {(users?.data || []).map((user) => {
                                    const roleClass = roleColors[user.role] || 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300';
                                    const roleLabel = roleLabels[user.role] || user.role;

                                    return (
                                        <tr key={user.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-stone-900 dark:text-white text-sm block">
                                                            {user.name}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-stone-400 text-[11px] mt-0.5 font-mono">
                                                            <Mail className="w-3 h-3" />
                                                            <span>{user.email}</span>
                                                        </div>
                                                        {user.phone && (
                                                            <div className="flex items-center gap-2 text-stone-400 text-[11px] font-mono">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{user.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${roleClass}`}>
                                                    <Shield className="w-3 h-3" />
                                                    <span>{roleLabel}</span>
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(user.id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                                                        user.is_active
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-500'
                                                    }`}
                                                    title="انقر لتفعيل أو تعطيل الحساب"
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                                                    <span>{user.is_active ? 'نشط' : 'معطل'}</span>
                                                </button>
                                            </td>

                                            {/* Created At */}
                                            <td className="px-6 py-4 text-stone-400 text-[11px]">
                                                {new Date(user.created_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link 
                                                        href={`/admin/users/${user.id}/edit`}
                                                        className="p-2 rounded-xl text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-stone-800 transition"
                                                        title="تعديل المستخدم"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-stone-800 transition"
                                                        title="حذف المستخدم"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {(!users?.data || users.data.length === 0) && (
                            <div className="text-center py-16">
                                <Users className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                                <p className="text-xs text-stone-400">لا يوجد مستخدمون مسجلون مطابقون للبحث.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {users?.links && users.links.length > 3 && (
                    <div className="pt-4 flex items-center justify-center gap-1.5">
                        {users.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-orange-600 text-white shadow-xs'
                                        : !link.url
                                        ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
                                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmDeleteId !== null}
                message="هل تريد بالتأكيد حذف هذا المستخدم؟ لن تتمكن من استعادته."
                onConfirm={() => { 
                    if (confirmDeleteId) {
                        router.delete(`/admin/users/${confirmDeleteId}`, {
                            preserveScroll: true,
                            onFinish: () => setConfirmDeleteId(null)
                        });
                    }
                }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </AdminLayout>
    );
}
