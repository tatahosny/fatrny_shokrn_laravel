import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Invoice, Restaurant, PaginatedResponse } from '../../../Types';
import {
    Receipt,
    Plus,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    AlertTriangle,
    Zap,
    Building2,
    Calendar,
    PhoneCall
} from 'lucide-react';

interface InvoicesIndexProps {
    invoices: PaginatedResponse<Invoice>;
    restaurants: Restaurant[];
    filters: { status?: string; restaurant_id?: string };
}

export default function Index({ invoices, restaurants = [], filters }: InvoicesIndexProps) {
    const items = invoices?.data || [];
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmPayId, setConfirmPayId] = useState<number | null>(null);
    const [confirmSuspendId, setConfirmSuspendId] = useState<number | null>(null);
    const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
    const [confirmAutoGenerate, setConfirmAutoGenerate] = useState(false);

    const form = useForm({
        restaurant_id: restaurants[0]?.id ? String(restaurants[0].id) : '',
        invoice_type: 'COMMISSION',
        subtotal: '',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: '',
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

    return (
        <>
            <Head title="الفواتير والاشتراكات — فطرنا" />
            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Receipt className="w-6 h-6 text-orange-500" />
                                <span>فواتير العمولات والاشتراكات الشهرية</span>
                            </h1>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                متابعة تحصيل الاشتراكات والعمولات وإيقاف/تفعيل حسابات المطاعم والكباتن تلقائياً
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setConfirmAutoGenerate(true)}
                                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                                title="توليد فواتير الشهر الحالي بناءً على الاشتراكات والنسب المحددة لكل مطعم"
                            >
                                <Zap className="w-4 h-4" />
                                <span>توليد فواتير الشهر تلقائياً</span>
                            </button>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إصدار فاتورة مخصصة</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 text-xs">
                        <span className="text-stone-400 font-bold ml-1">تصفية:</span>
                        <Link
                            href="/admin/invoices"
                            className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                !filters.status ? 'bg-orange-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                        >
                            الكل ({invoices.total || items.length})
                        </Link>
                        <Link
                            href="/admin/invoices?status=ISSUED"
                            className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                filters.status === 'ISSUED' ? 'bg-amber-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                        >
                            بانتظار السداد
                        </Link>
                        <Link
                            href="/admin/invoices?status=PAID"
                            className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                filters.status === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                        >
                            تم التحصيل
                        </Link>
                        <Link
                            href="/admin/invoices?status=OVERDUE"
                            className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                filters.status === 'OVERDUE' ? 'bg-red-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                        >
                            متأخرة / معلقة
                        </Link>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <Receipt className="w-14 h-14 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">لا توجد فواتير مطابقة</h3>
                            <p className="text-xs text-stone-400 mt-1">اضغط على زر "توليد فواتير الشهر تلقائياً" أو أصدر فاتورة جديدة.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                        <th className="py-3 px-4">رقم الفاتورة</th>
                                        <th className="py-3 px-4">المطعم</th>
                                        <th className="py-3 px-4">حالة المطعم</th>
                                        <th className="py-3 px-4">نوع الفاتورة</th>
                                        <th className="py-3 px-4">المبلغ</th>
                                        <th className="py-3 px-4">تاريخ الاستحقاق</th>
                                        <th className="py-3 px-4">حالة التحصيل</th>
                                        <th className="py-3 px-4 text-center">الإجراء المالي والتنفيذي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {items.map(inv => {
                                        const isSuspended = inv.restaurant?.status === 'SUSPENDED';
                                        return (
                                            <tr key={inv.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition">
                                                <td className="py-4 px-4 font-mono font-bold text-orange-600">
                                                    {inv.invoice_number}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-stone-900 dark:text-white">
                                                        {inv.restaurant?.name || 'مطعم غير محدد'}
                                                    </div>
                                                    {inv.restaurant?.phone && (
                                                        <span className="text-[10px] text-stone-400 font-mono">
                                                            {inv.restaurant.phone}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {isSuspended ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                            معلق (غير نشط)
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            نشط
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-stone-600 dark:text-stone-400">
                                                    {inv.invoice_type === 'COMMISSION' ? 'عمولة مبيعات' : 'اشتراك شهري'}
                                                </td>
                                                <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                    {Number(inv.total_amount).toLocaleString()} ج.م
                                                </td>
                                                <td className="py-4 px-4 font-mono text-stone-500">
                                                    {inv.due_date}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                        inv.status === 'PAID'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : inv.status === 'OVERDUE'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                    }`}>
                                                        {inv.status === 'PAID' ? 'تم التحصيل' : inv.status === 'OVERDUE' ? 'متأخرة عن السداد' : 'بانتظار التحصيل'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => setConfirmPayId(inv.id)}
                                                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs flex items-center gap-1 transition"
                                                                    title="تسجيل السداد وإعادة تفعيل المطعم والكباتن تلقائياً"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span>تم التحصيل ✅</span>
                                                                </button>

                                                                {!isSuspended && (
                                                                    <button
                                                                        onClick={() => setConfirmSuspendId(inv.id)}
                                                                        className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition"
                                                                        title="إيقاف حساب المطعم وكافة كباتن التوصيل لعدم السداد"
                                                                    >
                                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                                        <span>تعليق الحساب</span>
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => setConfirmCancelId(inv.id)}
                                                                    className="px-2 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-red-600 text-[11px] transition"
                                                                >
                                                                    إلغاء
                                                                </button>
                                                            </>
                                                        ) : inv.status === 'PAID' ? (
                                                            <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span>مكتمل ومسدد</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-stone-400 text-[11px]">ملغاة</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6 shadow-2xl z-10">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-orange-500" />
                            <span>إصدار فاتورة جديدة لمطعم</span>
                        </h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">المطعم الشريك</label>
                                <select
                                    value={form.data.restaurant_id}
                                    onChange={(e) => {
                                        const rId = e.target.value;
                                        form.setData('restaurant_id', rId);
                                        const found = restaurants.find(r => String(r.id) === rId);
                                        if (found) {
                                            if (found.commission_type === 'SUBSCRIPTION' || (found.monthly_subscription_fee && found.monthly_subscription_fee > 0)) {
                                                form.setData(data => ({
                                                    ...data,
                                                    restaurant_id: rId,
                                                    invoice_type: 'SUBSCRIPTION',
                                                    subtotal: String(found.monthly_subscription_fee || 100),
                                                }));
                                            }
                                        }
                                    }}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold"
                                >
                                    {restaurants.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} {r.status === 'SUSPENDED' ? '(معلق)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">نوع الفاتورة</label>
                                    <select
                                        value={form.data.invoice_type}
                                        onChange={(e) => form.setData('invoice_type', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    >
                                        <option value="COMMISSION">عمولة مبيعات</option>
                                        <option value="SUBSCRIPTION">اشتراك شهري</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">المبلغ المطلوب (ج.م)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        placeholder="مثال: 500"
                                        value={form.data.subtotal}
                                        onChange={(e) => form.setData('subtotal', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">آخر موعد للسداد (Due Date)</label>
                                <input
                                    type="date"
                                    required
                                    value={form.data.due_date}
                                    onChange={(e) => form.setData('due_date', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">ملاحظات (اختياري)</label>
                                <textarea
                                    rows={2}
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="ملاحظات تظهر لمدير المطعم في الفاتورة..."
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition"
                                >
                                    إصدار الفاتورة فوراً
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

            {/* Confirm Paid Modal */}
            <ConfirmModal
                isOpen={confirmPayId !== null}
                title="تأكيد تحصيل الفاتورة وتفعيل الحساب"
                message="عند تسجيل هذه الفاتورة كمدفوعة، سيتم تلقائياً تفعيل حساب المطعم وجميع كباتن التوصيل التابعين له ليعودوا للعمل واستقبال الطلبات. هل تريد الاستمرار؟"
                confirmText="نعم، تم التحصيل والتفعيل"
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

            {/* Confirm Suspend Modal */}
            <ConfirmModal
                isOpen={confirmSuspendId !== null}
                title="تعليق حساب المطعم والكباتن لعدم السداد"
                message="تحذير: سيتم إيقاف هذا المطعم فوراً عن استقبال أي طلبات على المنصة، وسيتم إيقاف حسابات كافة كباتن التوصيل التابعين له، ولن يتمكنوا من العمل حتى يتم التحصيل. هل أنت متأكد؟"
                confirmText="نعم، إيقاف المطعم والكباتن"
                cancelText="تراجع"
                variant="danger"
                onConfirm={() => {
                    if (confirmSuspendId !== null) {
                        router.patch(`/admin/invoices/${confirmSuspendId}/suspend-restaurant`);
                        setConfirmSuspendId(null);
                    }
                }}
                onCancel={() => setConfirmSuspendId(null)}
            />

            {/* Confirm Auto-Generate Monthly Invoices */}
            <ConfirmModal
                isOpen={confirmAutoGenerate}
                title="توليد فواتير الشهر الجديد تلقائياً"
                message="سيتم إصدار فاتورة جديدة لهذا الشهر لكل مطعم مسجل وفقاً لإعداداته المالية (الاشتراك الشهري أو نسبة المبيعات)، مع تحديد موعد استحقاق 7 أيام. هل تريد المتابعة؟"
                confirmText="توليد الفواتير الآن"
                cancelText="إلغاء"
                variant="info"
                onConfirm={() => {
                    router.post('/admin/invoices/auto-generate');
                    setConfirmAutoGenerate(false);
                }}
                onCancel={() => setConfirmAutoGenerate(false)}
            />

            {/* Confirm Cancel Invoice Modal */}
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
        </>
    );
}
