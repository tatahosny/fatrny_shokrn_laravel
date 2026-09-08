import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Invoice, Restaurant, PaginatedResponse } from '../../../Types';
import { Receipt, Plus, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

interface InvoicesIndexProps {
    invoices: PaginatedResponse<Invoice>;
    restaurants: Restaurant[];
    filters: { status?: string; restaurant_id?: string };
}

export default function Index({ invoices, restaurants = [], filters }: InvoicesIndexProps) {
    const items = invoices?.data || [];
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmPayId, setConfirmPayId] = useState<number | null>(null);
    const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

    const form = useForm({
        restaurant_id: restaurants[0]?.id || '',
        invoice_type: 'COMMISSION',
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        subtotal: '',
        tax_amount: 0,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/invoices', {
            onSuccess: () => {
                setShowCreateModal(false);
                form.reset();
            }
        });
    };

    const handleMarkPaid = (id: number) => {
        setConfirmPayId(id);
    };

    const handleCancel = (id: number) => {
        setConfirmCancelId(id);
    };

    return (
        <AdminLayout title="إدارة الفواتير والاشتراكات">
            <Head title="الفواتير والاشتراكات — الإدارة المركزية" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                فواتير العمولات والاشتراكات
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                إصدار المطالبات المالية للمطاعم ومتابعة دورات السداد
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إصدار فاتورة جديدة</span>
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا توجد فواتير مسجلة حالياً.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                        <th className="py-3 px-4">رقم الفاتورة</th>
                                        <th className="py-3 px-4">المطعم</th>
                                        <th className="py-3 px-4">النوع</th>
                                        <th className="py-3 px-4">الفترة</th>
                                        <th className="py-3 px-4">المبلغ</th>
                                        <th className="py-3 px-4">تاريخ الاستحقاق</th>
                                        <th className="py-3 px-4">الحالة</th>
                                        <th className="py-3 px-4 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {items.map(inv => (
                                        <tr key={inv.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                            <td className="py-4 px-4 font-mono font-bold text-orange-600">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                                {inv.restaurant?.name}
                                            </td>
                                            <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                                {inv.invoice_type === 'COMMISSION' ? 'عمولة مبيعات' : 'اشتراك شهري'}
                                            </td>
                                            <td className="py-4 px-4 text-stone-400 text-[11px]">
                                                {inv.period_start} إلى {inv.period_end}
                                            </td>
                                            <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                {inv.total_amount} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-stone-500 font-mono">
                                                {inv.due_date}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    inv.status === 'PAID'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : inv.status === 'OVERDUE'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inv.status === 'PAID' ? 'مدفوعة' : inv.status === 'OVERDUE' ? 'متأخرة' : 'بانتظار السداد'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center space-x-1.5 space-x-reverse">
                                                {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(inv.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                                                    >
                                                        تسجيل السداد
                                                    </button>
                                                )}
                                                {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                                                    <button
                                                        onClick={() => handleCancel(inv.id)}
                                                        className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-red-600 text-[11px]"
                                                    >
                                                        إلغاء
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6 shadow-2xl z-10 animate-fade-in">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">إصدار فاتورة لمطعم</h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">المطعم الشريك</label>
                                <select
                                    value={form.data.restaurant_id}
                                    onChange={(e) => form.setData('restaurant_id', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                >
                                    {restaurants.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1">نوع الفاتورة</label>
                                    <select
                                        value={form.data.invoice_type}
                                        onChange={(e) => form.setData('invoice_type', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    >
                                        <option value="COMMISSION">عمولة طلبات</option>
                                        <option value="SUBSCRIPTION">اشتراك شهري</option>
                                        <option value="HYBRID">مختلط (عمولة + اشتراك)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">المبلغ المطلوب (ج.م)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.data.subtotal}
                                        onChange={(e) => form.setData('subtotal', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1">بداية الفترة</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.period_start}
                                        onChange={(e) => form.setData('period_start', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">نهاية الفترة</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.period_end}
                                        onChange={(e) => form.setData('period_end', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">تاريخ الاستحقاق الأخير</label>
                                <input
                                    type="date"
                                    required
                                    value={form.data.due_date}
                                    onChange={(e) => form.setData('due_date', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                                >
                                    إصدار الفاتورة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmPayId !== null}
                title="تأكيد سداد الفاتورة"
                message="هل أنت متأكد من تسجيل هذه الفاتورة كمسددة بالكامل؟"
                confirmText="نعم، تم السداد"
                cancelText="إلغاء"
                variant="info"
                onConfirm={() => {
                    if (confirmPayId !== null) {
                        router.patch(`/admin/invoices/${confirmPayId}/mark-paid`);
                        setConfirmPayId(null);
                    }
                }}
                onCancel={() => setConfirmPayId(null)}
            />

            <ConfirmModal
                isOpen={confirmCancelId !== null}
                title="إلغاء الفاتورة"
                message="هل أنت متأكد من إلغاء هذه الفاتورة؟ لن تكون قابلة للتحصيل بعد ذلك."
                confirmText="نعم، ألغِ الفاتورة"
                cancelText="تراجع"
                variant="danger"
                onConfirm={() => {
                    if (confirmCancelId !== null) {
                        router.patch(`/admin/invoices/${confirmCancelId}/cancel`);
                        setConfirmCancelId(null);
                    }
                }}
                onCancel={() => setConfirmCancelId(null)}
            />
        </AdminLayout>
    );
}
