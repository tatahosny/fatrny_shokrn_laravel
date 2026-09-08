import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, FileText, Eye, DollarSign, CheckCircle, Clock, Download } from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    period_start: string;
    period_end: string;
    subtotal_amount: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    due_date: string | null;
    paid_at: string | null;
    issued_at: string | null;
    created_at: string;
    restaurant: { id: number; name: string };
}

interface Props { invoice: Invoice }

const statusMap: Record<string, { label: string; cls: string }> = {
    DRAFT:    { label: 'مسودة', cls: 'bg-stone-500/20 text-stone-400 border-stone-500/30' },
    ISSUED:   { label: 'صادرة', cls: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    PAID:     { label: 'مدفوعة', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    OVERDUE:  { label: 'متأخرة', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function InvoiceShow({ invoice }: Props) {
    const fmt = (v: number) => (v / 100).toFixed(2);
    const sc = statusMap[invoice.status] ?? statusMap.DRAFT;

    return (
        <AdminLayout>
            <Head title={`فاتورة ${invoice.invoice_number}`} />

            <div className="max-w-3xl" dir="rtl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/invoices" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">فاتورة {invoice.invoice_number}</h1>
                            <p className="text-stone-400 text-sm mt-1">{invoice.restaurant.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${sc.cls}`}>{sc.label}</span>
                    </div>
                    <a href={`/admin/invoices/${invoice.id}/pdf`}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        تحميل PDF
                    </a>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-orange-400">فطرنا شكراً</h2>
                            <p className="text-stone-400 text-sm mt-1">منصة توصيل الطعام</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-white">{invoice.invoice_number}</p>
                            <p className="text-stone-400 text-sm mt-1">تاريخ الإصدار: {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString('ar-EG') : '—'}</p>
                            {invoice.due_date && (
                                <p className="text-stone-400 text-sm">تاريخ الاستحقاق: {new Date(invoice.due_date).toLocaleDateString('ar-EG')}</p>
                            )}
                        </div>
                    </div>

                    <hr className="border-white/10" />

                    {/* Restaurant Details */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-stone-500 uppercase mb-2">إلى</p>
                            <p className="text-white font-semibold">{invoice.restaurant.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-stone-500 uppercase mb-2">الفترة</p>
                            <p className="text-white">{new Date(invoice.period_start).toLocaleDateString('ar-EG')} — {new Date(invoice.period_end).toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <hr className="border-white/10" />

                    {/* Line Items */}
                    <div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-stone-400 border-b border-white/10">
                                    <th className="text-right pb-3 font-medium">البند</th>
                                    <th className="text-right pb-3 font-medium">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="py-3 text-stone-200">عمولة المنصة عن الفترة</td>
                                    <td className="py-3 text-white font-medium">{fmt(invoice.subtotal_amount)} ج</td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-stone-200">ضريبة القيمة المضافة</td>
                                    <td className="py-3 text-white font-medium">{fmt(invoice.tax_amount)} ج</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <hr className="border-white/10" />

                    {/* Total */}
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">الإجمالي</span>
                        <span className="text-3xl font-bold text-orange-400">{fmt(invoice.total_amount)} ج</span>
                    </div>

                    {/* Payment Status */}
                    {invoice.paid_at && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                            <p className="text-emerald-300 text-sm">تم السداد في {new Date(invoice.paid_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                    )}
                    {invoice.status === 'OVERDUE' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-red-300 text-sm">الفاتورة متأخرة — يرجى السداد فوراً</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
