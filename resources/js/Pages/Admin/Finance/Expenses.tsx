import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmModal from '../../../Components/ConfirmModal';
import { ArrowLeft, Plus, Trash2, DollarSign, Tag, Calendar, FileText } from 'lucide-react';

interface Expense {
    id: number;
    description: string;
    amount: number;
    category: string;
    date: string;
    notes: string | null;
}

interface ExpenseCategory {
    name: string;
    total: number;
    count: number;
}

interface Props {
    expenses: { data: Expense[]; total: number; current_page: number; last_page: number };
    categories: ExpenseCategory[];
    totalThisMonth: number;
    totalThisYear: number;
}

export default function AdminFinanceExpenses({ expenses, categories, totalThisMonth, totalThisYear }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const fmt = (v: number) => (v / 100).toFixed(2);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/finance/expenses', {
            onSuccess: () => { reset(); setShowForm(false); }
        });
    };

    const handleDelete = (id: number) => {
        setConfirmDeleteId(id);
    };

    return (
        <AdminLayout>
            <Head title="المصروفات" />

            <div className="space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/finance" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">المصروفات</h1>
                            <p className="text-stone-400 text-sm mt-1">إدارة مصروفات المنصة</p>
                        </div>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        إضافة مصروف
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'هذا الشهر', value: `${fmt(totalThisMonth)} ج`, color: 'text-red-400' },
                        { label: 'هذا العام', value: `${fmt(totalThisYear)} ج`, color: 'text-orange-400' },
                        ...categories.slice(0, 2).map(c => ({ label: c.name, value: `${fmt(c.total)} ج`, color: 'text-stone-300' })),
                    ].map((card, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-stone-400 text-xs mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">إضافة مصروف جديد</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">الوصف *</label>
                                <input type="text" value={data.description} onChange={e => setData('description', e.target.value)}
                                    placeholder="وصف المصروف"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">المبلغ (ج.م) *</label>
                                <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الفئة</label>
                                <input type="text" value={data.category} onChange={e => setData('category', e.target.value)}
                                    placeholder="تشغيل، تسويق..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">التاريخ</label>
                                <input type="date" value={data.date} onChange={e => setData('date', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">ملاحظات</label>
                                <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)}
                                    placeholder="ملاحظات إضافية"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={processing}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {processing ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Expenses Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">سجل المصروفات</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-stone-400 border-b border-white/10">
                                    <th className="text-right pb-3 font-medium">الوصف</th>
                                    <th className="text-right pb-3 font-medium">الفئة</th>
                                    <th className="text-right pb-3 font-medium">المبلغ</th>
                                    <th className="text-right pb-3 font-medium">التاريخ</th>
                                    <th className="text-right pb-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.data.map(exp => (
                                    <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3">
                                            <p className="text-white">{exp.description}</p>
                                            {exp.notes && <p className="text-stone-500 text-xs">{exp.notes}</p>}
                                        </td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-white/10 text-stone-300 rounded text-xs">{exp.category || '—'}</span>
                                        </td>
                                        <td className="py-3 text-red-400 font-semibold">{fmt(exp.amount)} ج</td>
                                        <td className="py-3 text-stone-400">{new Date(exp.date).toLocaleDateString('ar-EG')}</td>
                                        <td className="py-3">
                                            <button onClick={() => handleDelete(exp.id)}
                                                className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {expenses.data.length === 0 && (
                            <p className="text-stone-400 text-center py-8 text-sm">لا توجد مصروفات مسجلة</p>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmDeleteId !== null}
                title="حذف المصروف"
                message="هل أنت متأكد من رغبتك في حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="نعم، احذف"
                cancelText="إلغاء"
                variant="danger"
                onConfirm={() => {
                    if (confirmDeleteId !== null) {
                        router.delete(`/admin/finance/expenses/${confirmDeleteId}`);
                        setConfirmDeleteId(null);
                    }
                }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </AdminLayout>
    );
}
