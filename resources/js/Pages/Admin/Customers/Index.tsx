import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Customer, PaginatedResponse } from '../../../Types';
import { GraduationCap, Search, CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';

interface CustomersIndexProps {
    customers: PaginatedResponse<Customer & { orders_count: number }>;
    filters: { search?: string; student_status?: string };
}

export default function Index({ customers, filters }: CustomersIndexProps) {
    const items = customers?.data || [];
    const [search, setSearch] = useState(filters.search || '');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/customers', { search, student_status: filters.student_status }, { preserveState: true });
    };

    const handleFilterStatus = (st: string) => {
        router.get('/admin/customers', { search, student_status: st === 'ALL' ? '' : st }, { preserveState: true });
    };

    const handleVerify = (id: number) => {
        router.patch(`/admin/customers/${id}/verify-student`);
    };

    const handleReject = (id: number) => {
        router.patch(`/admin/customers/${id}/reject-student`);
    };

    return (
        <AdminLayout title="إدارة الطلاب والعملاء">
            <Head title="إدارة الطلاب والعملاء — الإدارة المركزية" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                الطلاب والعملاء المسجلين
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                مراجعة وتوثيق بطاقات وكارنيهات طلاب جامعات برج العرب لتفعيل الخصم
                            </p>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                            {[
                                { key: 'ALL', label: 'الكل' },
                                { key: 'PENDING', label: 'بانتظار المراجعة' },
                                { key: 'APPROVED', label: 'مفعل (طلاب)' },
                                { key: 'REJECTED', label: 'مرفوض' },
                            ].map((st) => (
                                <button
                                    key={st.key}
                                    onClick={() => handleFilterStatus(st.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                        (filters.student_status === st.key) || (!filters.student_status && st.key === 'ALL')
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="mb-6 max-w-sm relative">
                        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث بالاسم أو الهاتف..."
                            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                        />
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                    <th className="py-3 px-4">اسم الطالب / العميل</th>
                                    <th className="py-3 px-4">رقم الهاتف والبريد</th>
                                    <th className="py-3 px-4">الجامعة</th>
                                    <th className="py-3 px-4">حالة التوثيق</th>
                                    <th className="py-3 px-4">عدد الطلبات</th>
                                    <th className="py-3 px-4 text-center">إجراءات المراجعة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.map((c) => (
                                    <tr key={c.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                        <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                            {c.user?.name}
                                        </td>
                                        <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                            <span className="font-mono block">{c.user?.phone || '—'}</span>
                                            <span className="text-[11px] text-stone-400">{c.user?.email}</span>
                                        </td>
                                        <td className="py-4 px-4 text-stone-700 dark:text-stone-300 font-medium">
                                            {c.university_name || '—'}
                                        </td>
                                        <td className="py-4 px-4">
                                            {c.student_status === 'APPROVED' && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                                    طالب موثق
                                                </span>
                                            )}
                                            {c.student_status === 'PENDING' && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse">
                                                    بانتظار المراجعة
                                                </span>
                                            )}
                                            {c.student_status === 'REJECTED' && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                                                    مرفوض
                                                </span>
                                            )}
                                            {(!c.student_status || c.student_status === 'NONE') && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-500">
                                                    عميل عادي
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                            {c.orders_count || 0} طلب
                                        </td>
                                        <td className="py-4 px-4 text-center space-x-1.5 space-x-reverse">
                                            {c.university_id_card_image && (
                                                <button
                                                    onClick={() => {
                                                        const img = c.university_id_card_image!;
                                                        const src = img.startsWith('http') || img.startsWith('/') ? img : `/storage/${img}`;
                                                        setPreviewImage(src);
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold text-[11px] hover:bg-orange-200 transition"
                                                >
                                                    معاينة الكارنيه 🎓
                                                </button>
                                            )}

                                            {c.student_status !== 'APPROVED' && (
                                                <button
                                                    onClick={() => handleVerify(c.id)}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                                                >
                                                    قبول وتوثيق
                                                </button>
                                            )}

                                            {c.student_status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleReject(c.id)}
                                                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px]"
                                                >
                                                    رفض
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm"
                        onClick={() => setPreviewImage(null)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 p-4 rounded-3xl max-w-lg w-full z-10 shadow-2xl animate-fade-in text-center">
                        <h3 className="font-bold text-sm mb-3">معاينة صورة كارنيه الطالب</h3>
                        <img src={previewImage} alt="كارنيه الطالب" className="max-h-[60vh] mx-auto rounded-xl object-contain" />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="mt-4 px-6 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
