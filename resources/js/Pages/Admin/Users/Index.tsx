import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Plus, Edit, Trash2, Users, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    users: { data: User[]; total: number; current_page: number; last_page: number };
    roles: string[];
    filters: { role: string; search: string };
}

const roleColors: Record<string, string> = {
    SUPER_ADMIN:      'bg-red-500/20 text-red-400 border-red-500/30',
    ADMIN:            'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PLATFORM_STAFF:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
    RESTAURANT_OWNER: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    RESTAURANT_STAFF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    DELIVERY_DRIVER:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
    CUSTOMER:         'bg-stone-500/20 text-stone-400 border-stone-500/30',
};

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'مدير عام', ADMIN: 'مدير', PLATFORM_STAFF: 'موظف',
    RESTAURANT_OWNER: 'مالك مطعم', RESTAURANT_STAFF: 'موظف مطعم',
    DELIVERY_DRIVER: 'سائق', CUSTOMER: 'عميل',
};

export default function AdminUsersIndex({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search, role: roleFilter }, { preserveState: true });
    };

    const handleToggleActive = (id: number) => {
        router.post(`/admin/users/${id}/toggle-active`);
    };

    const handleDelete = (id: number) => {
        if (confirm('هل تريد حذف هذا المستخدم؟'))
            router.delete(`/admin/users/${id}`);
    };

    return (
        <AdminLayout>
            <Head title="إدارة المستخدمين" />

            <div className="space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
                        <p className="text-stone-400 text-sm mt-1">{users.total} مستخدم مسجل</p>
                    </div>
                    <Link href="/admin/users/create"
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        مستخدم جديد
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="بحث بالاسم أو البريد..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors text-sm" />
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm">
                            <option value="">كل الأدوار</option>
                            {roles.map(r => <option key={r} value={r}>{roleLabels[r] ?? r}</option>)}
                        </select>
                        <button type="submit" className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors">
                            بحث
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/10">
                                <tr className="text-stone-400">
                                    <th className="text-right px-6 py-4 font-medium">المستخدم</th>
                                    <th className="text-right px-6 py-4 font-medium">الدور</th>
                                    <th className="text-right px-6 py-4 font-medium">الحالة</th>
                                    <th className="text-right px-6 py-4 font-medium">تاريخ التسجيل</th>
                                    <th className="text-right px-6 py-4 font-medium">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.data.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-stone-400 text-xs mt-0.5">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${roleColors[user.role] ?? roleColors.CUSTOMER}`}>
                                                {roleLabels[user.role] ?? user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleActive(user.id)}
                                                className={`px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${user.is_active
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                                                    : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'}`}>
                                                {user.is_active ? 'نشط' : 'معطل'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-stone-400">
                                            {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/users/${user.id}/edit`}
                                                    className="p-1.5 text-stone-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.data.length === 0 && (
                            <p className="text-stone-400 text-center py-12 text-sm">لا توجد نتائج</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
