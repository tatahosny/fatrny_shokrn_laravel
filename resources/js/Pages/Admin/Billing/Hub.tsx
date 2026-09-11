import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Zap, Lock, CheckCircle2, Clock, AlertTriangle, Plus,
    DollarSign, Receipt, CreditCard, TrendingUp, Store,
    Calendar, XCircle, ChevronLeft, ChevronRight, Banknote,
    RefreshCw, ShieldOff, Settings2, ListChecks, Pencil
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface Restaurant {
    id: number;
    name: string;
    status: string;
    billing_suspended_at?: string | null;
    commission_type?: string;
    commission_percentage?: number;
    monthly_subscription_fee?: number;
    overdue_invoices_count?: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    restaurant: { id: number; name: string; status: string };
    total_amount: string;
    paid_amount: string;
    status: string;
    invoice_type: string;
    issue_date: string;
    due_date: string;
    notes?: string;
}

interface Collection {
    id: number;
    amount: number;
    collection_date: string;
    payment_method: string;
    notes?: string;
    restaurant: { id: number; name: string };
    collectedByUser?: { name: string } | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Stats {
    total_revenue: number;
    total_pending: number;
    overdue_count: number;
    total_collected: number;
}

interface Props {
    stats: Stats;
    invoices: Paginated<Invoice>;
    collections: Paginated<Collection>;
    overdueRestaurants: Restaurant[];
    restaurants: Restaurant[];
    filters: { inv_status?: string; restaurant_id?: string };
}

// ─── Status Config ────────────────────────────────────────────────
const invoiceStatusMap: Record<string, { label: string; cls: string }> = {
    DRAFT:           { label: 'مسودة',        cls: 'bg-stone-500/20 text-stone-400 border-stone-500/30' },
    ISSUED:          { label: 'صادرة',        cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    PAID:            { label: 'مدفوعة',       cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    PARTIALLY_PAID:  { label: 'جزئياً',       cls: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    OVERDUE:         { label: 'متأخرة',       cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    CANCELLED:       { label: 'ملغاة',        cls: 'bg-stone-700/30 text-stone-500 border-stone-600/30' },
};

const invoiceTypeMap: Record<string, string> = {
    COMMISSION:   'عمولة',
    SUBSCRIPTION: 'اشتراك',
    MANUAL:       'يدوي',
    COMBINED:     'مجمّع',
};

const fmt = (v: number | string) => {
    const num = Number(v);
    if (isNaN(num)) return '0';
    return Number(num.toFixed(2)).toString();
};

// ─── Confirm Modal ────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel, danger = false }: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <p className="text-white text-sm font-medium mb-5 text-center leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 rounded-xl text-sm transition">إلغاء</button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition text-white ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'}`}>تأكيد</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────
export default function BillingHub({ stats, invoices, collections, overdueRestaurants, restaurants, filters }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'collections' | 'overdue'>('overview');
    const [confirm, setConfirm] = useState<{ msg: string; action: () => void; danger?: boolean } | null>(null);

    // Forms
    const collectionForm = useForm({
        restaurant_id: '',
        invoice_id: '',
        amount: '',
        payment_method: 'CASH',
        collection_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const invoiceForm = useForm({
        restaurant_id: restaurants[0]?.id ? String(restaurants[0].id) : '',
        invoice_type: 'SUBSCRIPTION',
        subtotal: '',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: '',
    });

    const [showCollectionForm, setShowCollectionForm] = useState(false);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);

    // Edit Invoice Form
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const editForm = useForm({
        subtotal: '',
        due_date: '',
        invoice_type: 'SUBSCRIPTION',
        notes: '',
    });

    const openEditInvoice = (inv: Invoice) => {
        setEditingInvoice(inv);
        editForm.setData({
            subtotal: String(inv.total_amount),
            due_date: inv.due_date,
            invoice_type: inv.invoice_type || 'SUBSCRIPTION',
            notes: inv.notes || '',
        });
    };

    const submitEditInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInvoice) return;
        editForm.put(`/admin/billing/invoice/${editingInvoice.id}`, {
            onSuccess: () => {
                setEditingInvoice(null);
                editForm.reset();
            },
        });
    };

    const ask = (msg: string, action: () => void, danger = false) => setConfirm({ msg, action, danger });

    const doAutoGenerate = () =>
        ask('سيتم توليد فواتير هذا الشهر لجميع المطاعم تلقائياً. هل تريد المتابعة؟', () => {
            router.post('/admin/billing/auto-generate');
        });

    const doAutoLock = () =>
        ask('سيتم قفل جميع حسابات المطاعم التي لديها فواتير لم تسدّد بعد. هل تريد المتابعة؟', () => {
            router.post('/admin/billing/auto-lock-overdue');
        }, true);

    const doMarkPaid = (id: number, num: string) =>
        ask(`هل تريد تسجيل الفاتورة ${num} كمدفوعة وإعادة تفعيل المطعم؟`, () => {
            router.post(`/admin/billing/invoice/${id}/mark-paid`);
        });

    const doSuspend = (id: number, num: string) =>
        ask(`هل تريد قفل المطعم بسبب عدم سداد الفاتورة ${num}؟`, () => {
            router.post(`/admin/billing/invoice/${id}/suspend`);
        }, true);

    const doCancel = (id: number, num: string) =>
        ask(`هل تريد إلغاء الفاتورة ${num}؟`, () => {
            router.post(`/admin/billing/invoice/${id}/cancel`);
        }, true);

    const submitCollection = (e: React.FormEvent) => {
        e.preventDefault();
        collectionForm.post('/admin/billing/collection', {
            onSuccess: () => { collectionForm.reset(); setShowCollectionForm(false); }
        });
    };

    const submitInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        invoiceForm.post('/admin/billing/invoice', {
            onSuccess: () => { invoiceForm.reset(); setShowInvoiceForm(false); }
        });
    };

    const tabs = [
        { id: 'overview',     label: 'لوحة التحكم',      icon: Settings2 },
        { id: 'invoices',     label: 'الفواتير',          icon: Receipt },
        { id: 'collections',  label: 'سجل التحصيل',       icon: CreditCard },
        { id: 'overdue',      label: `المتأخرون (${overdueRestaurants.length})`, icon: AlertTriangle },
    ] as const;

    return (
        <Head title="مركز التحصيل — الإدارة المركزية" />

            {confirm && (
                <ConfirmModal
                    message={confirm.msg}
                    onConfirm={() => { confirm.action(); setConfirm(null); }}
                    onCancel={() => setConfirm(null)}
                    danger={confirm.danger}
                />
            )}

            <div className="space-y-6" dir="rtl">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <Banknote className="w-7 h-7 text-orange-500" />
                            مركز التحصيل
                        </h1>
                        <p className="text-stone-400 text-sm mt-1">إدارة الفواتير والتحصيل وقفل الحسابات — كل شيء في مكان واحد</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={doAutoGenerate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-amber-500/20"
                        >
                            <Zap className="w-4 h-4" />
                            توليد فواتير الشهر
                        </button>
                        <button
                            onClick={doAutoLock}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-red-500/20"
                        >
                            <Lock className="w-4 h-4" />
                            قفل المتأخرين تلقائياً
                        </button>
                    </div>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                        label="إجمالي المحصّل"
                        value={`${fmt(stats.total_revenue)} ج`}
                        cls="border-emerald-500/20 bg-emerald-500/10"
                    />
                    <StatCard
                        icon={<Clock className="w-5 h-5 text-amber-400" />}
                        label="في الانتظار"
                        value={`${fmt(stats.total_pending)} ج`}
                        cls="border-amber-500/20 bg-amber-500/10"
                    />
                    <StatCard
                        icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                        label="فواتير متأخرة"
                        value={stats.overdue_count.toString()}
                        cls="border-red-500/20 bg-red-500/10"
                    />
                    <StatCard
                        icon={<CreditCard className="w-5 h-5 text-indigo-400" />}
                        label="سندات التحصيل"
                        value={`${fmt(stats.total_collected)} ج`}
                        cls="border-indigo-500/20 bg-indigo-500/10"
                    />
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ─────────────────────────────── TAB: Overview ── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Auto Actions Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-orange-400" />
                                العمليات التلقائية
                            </h2>
                            <p className="text-stone-400 text-sm">اضغط الزر لتنفيذ العمليات على جميع المطاعم دفعة واحدة</p>

                            <div className="space-y-3">
                                <ActionRow
                                    icon={<Zap className="w-5 h-5 text-amber-400" />}
                                    title="توليد فواتير الشهر الحالي"
                                    desc="يُنشئ فاتورة لكل مطعم لم يتم إصدار فاتورة له هذا الشهر بعد"
                                    btnLabel="تنفيذ"
                                    btnCls="bg-amber-500 hover:bg-amber-400"
                                    onClick={doAutoGenerate}
                                />
                                <ActionRow
                                    icon={<Lock className="w-5 h-5 text-red-400" />}
                                    title="قفل الحسابات المتأخرة"
                                    desc="يوقف كل المطاعم التي تجاوزت تاريخ استحقاق الفاتورة ولم تسدّد"
                                    btnLabel="قفل الآن"
                                    btnCls="bg-red-600 hover:bg-red-500"
                                    onClick={doAutoLock}
                                />
                            </div>
                        </div>

                        {/* Quick Collection */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-white font-bold flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                    تسجيل تحصيل سريع
                                </h2>
                                <button
                                    onClick={() => setShowCollectionForm(!showCollectionForm)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    تسجيل
                                </button>
                            </div>

                            {showCollectionForm && (
                                <form onSubmit={submitCollection} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-stone-400 mb-1">المطعم *</label>
                                            <select value={collectionForm.data.restaurant_id} onChange={e => collectionForm.setData('restaurant_id', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                                                <option value="">اختر المطعم</option>
                                                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">المبلغ (ج.م) *</label>
                                            <input type="number" step="0.01" value={collectionForm.data.amount} onChange={e => collectionForm.setData('amount', e.target.value)}
                                                placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">طريقة الدفع *</label>
                                            <select value={collectionForm.data.payment_method} onChange={e => collectionForm.setData('payment_method', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                                                <option value="CASH">نقدي</option>
                                                <option value="BANK_TRANSFER">تحويل بنكي</option>
                                                <option value="VODAFONE_CASH">فودافون كاش</option>
                                                <option value="INSTAPAY">انستاباي</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">تاريخ التحصيل</label>
                                            <input type="date" value={collectionForm.data.collection_date} onChange={e => collectionForm.setData('collection_date', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">ملاحظات</label>
                                            <input type="text" value={collectionForm.data.notes} onChange={e => collectionForm.setData('notes', e.target.value)}
                                                placeholder="اختياري" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowCollectionForm(false)} className="px-3 py-1.5 bg-white/5 text-stone-300 rounded-lg text-xs transition hover:bg-white/10">إلغاء</button>
                                        <button type="submit" disabled={collectionForm.processing} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50">
                                            {collectionForm.processing ? 'جاري الحفظ...' : 'حفظ التحصيل'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {!showCollectionForm && (
                                <p className="text-stone-500 text-sm text-center py-4">اضغط "تسجيل" لإضافة سند تحصيل جديد</p>
                            )}
                        </div>

                        {/* Overdue snapshot */}
                        {overdueRestaurants.length > 0 && (
                            <div className="col-span-full bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    تحذير — {overdueRestaurants.length} مطعم لم يسدّد مستحقاته
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {overdueRestaurants.map(r => (
                                        <span key={r.id} className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-full border border-red-500/30">
                                            {r.name} ({r.overdue_invoices_count} فاتورة)
                                        </span>
                                    ))}
                                </div>
                                <button onClick={doAutoLock} className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition">
                                    <Lock className="w-4 h-4" />
                                    قفل جميعهم الآن
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─────────────────────────────── TAB: Invoices ── */}
                {activeTab === 'invoices' && (
                    <div className="space-y-4">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                {['', 'ISSUED', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'CANCELLED'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => router.get('/admin/billing', { inv_status: s || undefined, restaurant_id: filters.restaurant_id }, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                            (filters.inv_status || '') === s
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {s ? invoiceStatusMap[s]?.label : 'الكل'}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
                            >
                                <Plus className="w-4 h-4" />
                                فاتورة جديدة
                            </button>
                        </div>

                        {/* New Invoice Form */}
                        {showInvoiceForm && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="text-white font-bold mb-4">إصدار فاتورة مخصصة</h3>
                                <form onSubmit={submitInvoice} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">المطعم *</label>
                                        <select value={invoiceForm.data.restaurant_id} onChange={e => invoiceForm.setData('restaurant_id', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">النوع *</label>
                                        <select value={invoiceForm.data.invoice_type} onChange={e => invoiceForm.setData('invoice_type', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                                            <option value="SUBSCRIPTION">اشتراك شهري</option>
                                            <option value="COMMISSION">عمولة</option>
                                            <option value="MANUAL">يدوي</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">المبلغ (ج.م) *</label>
                                        <input type="number" step="0.01" value={invoiceForm.data.subtotal} onChange={e => invoiceForm.setData('subtotal', e.target.value)}
                                            placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">تاريخ الاستحقاق *</label>
                                        <input type="date" value={invoiceForm.data.due_date} onChange={e => invoiceForm.setData('due_date', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                    </div>
                                    <div className="col-span-2 md:col-span-4 flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-4 py-2 bg-white/5 text-stone-300 rounded-lg text-xs transition hover:bg-white/10">إلغاء</button>
                                        <button type="submit" disabled={invoiceForm.processing} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50">
                                            {invoiceForm.processing ? 'جاري الإصدار...' : 'إصدار الفاتورة'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Invoices Table */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-white/10">
                                        <tr className="text-stone-400 text-right">
                                            <th className="px-5 py-3 font-medium">رقم الفاتورة</th>
                                            <th className="px-5 py-3 font-medium">المطعم</th>
                                            <th className="px-5 py-3 font-medium">النوع</th>
                                            <th className="px-5 py-3 font-medium">المبلغ</th>
                                            <th className="px-5 py-3 font-medium">المدفوع</th>
                                            <th className="px-5 py-3 font-medium">الحالة</th>
                                            <th className="px-5 py-3 font-medium">الاستحقاق</th>
                                            <th className="px-5 py-3 font-medium">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {invoices.data.map(inv => {
                                            const isPaid = inv.status === 'PAID';
                                            const isCancelled = inv.status === 'CANCELLED';
                                            // طالما لم يتم تسجيل السداد = متأخرة
                                            const isOverdue = !isPaid && !isCancelled;
                                            const sc = isPaid
                                                ? invoiceStatusMap.PAID
                                                : isCancelled
                                                ? invoiceStatusMap.CANCELLED
                                                : invoiceStatusMap.OVERDUE;

                                            return (
                                                <tr key={inv.id} className={`hover:bg-white/5 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}>
                                                    <td className="px-5 py-3 text-indigo-400 font-mono text-xs">{inv.invoice_number}</td>
                                                    <td className="px-5 py-3 text-white font-medium">{inv.restaurant.name}</td>
                                                    <td className="px-5 py-3 text-stone-400 text-xs">{invoiceTypeMap[inv.invoice_type] ?? inv.invoice_type}</td>
                                                    <td className="px-5 py-3 text-white font-semibold">{fmt(inv.total_amount)} ج</td>
                                                    <td className="px-5 py-3 text-emerald-400">{fmt(inv.paid_amount)} ج</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${sc.cls}`}>{sc.label}</span>
                                                    </td>
                                                    <td className={`px-5 py-3 text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-stone-400'}`}>
                                                        {new Date(inv.due_date).toLocaleDateString('ar-EG')}
                                                        {isOverdue && ' ⚠️'}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {/* زر تعديل الفاتورة - متاح طالما لم تسدد */}
                                                            {!isPaid && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditInvoice(inv)}
                                                                    title="تعديل الفاتورة"
                                                                    className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {!isPaid && !isCancelled && (
                                                                <button onClick={() => doMarkPaid(inv.id, inv.invoice_number)} title="تسجيل كمدفوعة"
                                                                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {!isPaid && !isCancelled && (
                                                                <button onClick={() => doSuspend(inv.id, inv.invoice_number)} title="قفل المطعم"
                                                                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition">
                                                                    <ShieldOff className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {!isPaid && !isCancelled && (
                                                                <button onClick={() => doCancel(inv.id, inv.invoice_number)} title="إلغاء الفاتورة"
                                                                    className="p-1.5 rounded-lg bg-stone-500/20 hover:bg-stone-500/40 text-stone-400 transition">
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {invoices.data.length === 0 && (
                                    <p className="text-stone-500 text-center py-12 text-sm">لا توجد فواتير</p>
                                )}
                            </div>
                            {/* Pagination */}
                            {invoices.last_page > 1 && (
                                <Pagination
                                    current={invoices.current_page}
                                    last={invoices.last_page}
                                    total={invoices.total}
                                    onChange={p => router.get('/admin/billing', { ...filters, inv_page: p }, { preserveState: true })}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────── TAB: Collections ── */}
                {activeTab === 'collections' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-white font-bold text-lg">سجل التحصيلات</h2>
                            <button onClick={() => setShowCollectionForm(!showCollectionForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition">
                                <Plus className="w-4 h-4" />
                                تسجيل تحصيل
                            </button>
                        </div>

                        {showCollectionForm && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="text-white font-bold mb-4">تسجيل سند تحصيل جديد</h3>
                                <form onSubmit={submitCollection} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs text-stone-400 mb-1">المطعم *</label>
                                        <select value={collectionForm.data.restaurant_id} onChange={e => collectionForm.setData('restaurant_id', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                                            <option value="">اختر المطعم</option>
                                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">المبلغ (ج.م) *</label>
                                        <input type="number" step="0.01" value={collectionForm.data.amount} onChange={e => collectionForm.setData('amount', e.target.value)}
                                            placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">طريقة الدفع *</label>
                                        <select value={collectionForm.data.payment_method} onChange={e => collectionForm.setData('payment_method', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                                            <option value="CASH">نقدي</option>
                                            <option value="BANK_TRANSFER">تحويل بنكي</option>
                                            <option value="VODAFONE_CASH">فودافون كاش</option>
                                            <option value="INSTAPAY">انستاباي</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">تاريخ التحصيل</label>
                                        <input type="date" value={collectionForm.data.collection_date} onChange={e => collectionForm.setData('collection_date', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 mb-1">ملاحظات</label>
                                        <input type="text" value={collectionForm.data.notes} onChange={e => collectionForm.setData('notes', e.target.value)}
                                            placeholder="اختياري" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                                    </div>
                                    <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowCollectionForm(false)} className="px-4 py-2 bg-white/5 text-stone-300 rounded-lg text-xs transition hover:bg-white/10">إلغاء</button>
                                        <button type="submit" disabled={collectionForm.processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50">
                                            {collectionForm.processing ? 'جاري الحفظ...' : 'حفظ التحصيل'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-white/10">
                                        <tr className="text-stone-400 text-right">
                                            <th className="px-5 py-3 font-medium">المطعم</th>
                                            <th className="px-5 py-3 font-medium">المبلغ</th>
                                            <th className="px-5 py-3 font-medium">طريقة الدفع</th>
                                            <th className="px-5 py-3 font-medium">تاريخ التحصيل</th>
                                            <th className="px-5 py-3 font-medium">بواسطة</th>
                                            <th className="px-5 py-3 font-medium">ملاحظات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {collections.data.map(col => (
                                            <tr key={col.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-5 py-3 text-white font-medium">{col.restaurant.name}</td>
                                                <td className="px-5 py-3 text-emerald-400 font-bold">{fmt(col.amount)} ج</td>
                                                <td className="px-5 py-3 text-stone-400 text-xs">{col.payment_method}</td>
                                                <td className="px-5 py-3 text-stone-400 text-xs">{new Date(col.collection_date).toLocaleDateString('ar-EG')}</td>
                                                <td className="px-5 py-3 text-stone-400 text-xs">{col.collectedByUser?.name ?? '—'}</td>
                                                <td className="px-5 py-3 text-stone-500 text-xs">{col.notes ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {collections.data.length === 0 && (
                                    <p className="text-stone-500 text-center py-12 text-sm">لا توجد تحصيلات بعد</p>
                                )}
                            </div>
                            {collections.last_page > 1 && (
                                <Pagination
                                    current={collections.current_page}
                                    last={collections.last_page}
                                    total={collections.total}
                                    onChange={p => router.get('/admin/billing', { ...filters, col_page: p }, { preserveState: true })}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────── TAB: Overdue ── */}
                {activeTab === 'overdue' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                المطاعم المتأخرة عن السداد
                            </h2>
                            {overdueRestaurants.length > 0 && (
                                <button onClick={doAutoLock}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition">
                                    <Lock className="w-4 h-4" />
                                    قفل الكل تلقائياً
                                </button>
                            )}
                        </div>

                        {overdueRestaurants.length === 0 ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                <p className="text-emerald-400 font-bold text-lg">ممتاز!</p>
                                <p className="text-stone-400 text-sm mt-1">لا توجد مطاعم متأخرة عن السداد حالياً</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {overdueRestaurants.map(r => (
                                    <div key={r.id} className="bg-white/5 border border-red-500/20 rounded-2xl p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                                <Store className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{r.name}</p>
                                                <p className="text-red-400 text-xs mt-0.5">{r.overdue_invoices_count} فاتورة متأخرة</p>
                                                <p className="text-stone-500 text-xs">
                                                    الحالة: {r.status === 'SUSPENDED' ? '🔒 موقوف' : r.status === 'ACTIVE' ? '🟢 نشط' : r.status}
                                                </p>
                                            </div>
                                        </div>
                                        {r.status !== 'SUSPENDED' && (
                                            <button
                                                onClick={() => ask(`هل تريد قفل مطعم "${r.name}"؟`, () => router.post('/admin/billing/auto-lock-overdue'), true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition"
                                            >
                                                <Lock className="w-3.5 h-3.5" />
                                                قفل
                                            </button>
                                        )}
                                        {r.status === 'SUSPENDED' && (
                                            <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold border border-red-500/30">
                                                🔒 مقفل
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Edit Invoice Modal ── */}
                {editingInvoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setEditingInvoice(null)}>
                        <div className="bg-stone-900 border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Pencil className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-base">تعديل الفاتورة</h3>
                                        <p className="text-stone-400 text-xs font-mono">{editingInvoice.invoice_number} — {editingInvoice.restaurant.name}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingInvoice(null)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={submitEditInvoice} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">نوع الفاتورة *</label>
                                    <select
                                        value={editForm.data.invoice_type}
                                        onChange={e => editForm.setData('invoice_type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                                        <option value="SUBSCRIPTION">اشتراك شهري</option>
                                        <option value="COMMISSION">عمولة مبيعات</option>
                                        <option value="MANUAL">يدوي</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">المبلغ (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.subtotal}
                                        onChange={e => editForm.setData('subtotal', e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">تاريخ الاستحقاق *</label>
                                    <input
                                        type="date"
                                        value={editForm.data.due_date}
                                        onChange={e => editForm.setData('due_date', e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">ملاحظات</label>
                                    <textarea
                                        rows={2}
                                        value={editForm.data.notes}
                                        onChange={e => editForm.setData('notes', e.target.value)}
                                        placeholder="أي تفاصيل أو ملاحظات إضافية..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingInvoice(null)}
                                        className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-xl text-sm transition"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        {editForm.processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
}

// ─── Helper Components ────────────────────────────────────────────
function StatCard({ icon, label, value, cls }: { icon: React.ReactNode; label: string; value: string; cls: string }) {
    return (
        <div className={`rounded-2xl border p-5 ${cls}`}>
            <div className="mb-2">{icon}</div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-stone-400 text-xs mt-1">{label}</p>
        </div>
    );
}

function ActionRow({ icon, title, desc, btnLabel, btnCls, onClick }: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    btnLabel: string;
    btnCls: string;
    onClick: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 bg-white/5 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{desc}</p>
                </div>
            </div>
            <button onClick={onClick} className={`shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition ${btnCls}`}>
                {btnLabel}
            </button>
        </div>
    );
}

function Pagination({ current, last, total, onChange }: { current: number; last: number; total: number; onChange: (p: number) => void }) {
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
            <p className="text-stone-400 text-xs">إجمالي {total} سجل</p>
            <div className="flex items-center gap-2">
                <button onClick={() => onChange(current - 1)} disabled={current === 1}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 disabled:opacity-30 transition">
                    <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-stone-400 text-xs">{current} / {last}</span>
                <button onClick={() => onChange(current + 1)} disabled={current === last}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 disabled:opacity-30 transition">
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
