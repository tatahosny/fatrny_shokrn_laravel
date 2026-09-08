import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Save, User, Shield } from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
}

interface Props {
    user: UserData;
    roles: string[];
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'مدير عام', ADMIN: 'مدير', PLATFORM_STAFF: 'موظف منصة',
    RESTAURANT_OWNER: 'مالك مطعم', RESTAURANT_STAFF: 'موظف مطعم',
    DELIVERY_DRIVER: 'سائق توصيل', CUSTOMER: 'عميل',
};

export default function UserEdit({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        password: '',
        role: user.role,
        is_active: user.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`تعديل ${user.name}`} />

            <div className="max-w-2xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/users" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">تعديل المستخدم</h1>
                        <p className="text-stone-400 text-sm mt-1">{user.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-400" />
                            البيانات الأساسية
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">الاسم الكامل *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">البريد الإلكتروني *</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">رقم الهاتف</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">كلمة المرور الجديدة (اتركها فارغة إن لم تريد تغييرها)</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div className="col-span-2 flex items-center gap-3">
                                <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 accent-orange-500" />
                                <label htmlFor="is_active" className="text-sm text-stone-300">الحساب نشط</label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-400" />
                            الدور
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(roles || []).map(roleItem => {
                                const role = typeof roleItem === 'string' ? roleItem : (roleItem as any)?.name ?? String(roleItem);
                                return (
                                    <label key={role}
                                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${data.role === role
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                        <input type="radio" name="role" value={role} checked={data.role === role}
                                            onChange={() => setData('role', role)} className="accent-orange-500" />
                                        <span className="text-sm text-white">{roleLabels[role] ?? role}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/admin/users" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
