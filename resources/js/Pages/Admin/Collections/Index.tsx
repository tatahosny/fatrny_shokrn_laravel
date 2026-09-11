import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Eye, Store, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Collection {
    id: number;
    amount: number;
    collected_at: string | null;
    notes: string | null;
    status: string;
    created_at: string;
    restaurant: { id: number; name: string };
    collectedBy: { name: string } | null;
    invoice: { invoice_number: string } | null;
}

interface Restaurant {
    id: number;
    name: string;
}

interface Props {
    collections: { data: Collection[]; total: number; current_page: number; last_page: number };
    restaurants: Restaurant[];
    totalCollected: number;
    totalPending: number;
}

export default function AdminCollectionsIndex({ collections, restaurants, totalCollected, totalPending }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        restaurant_id: '',
        amount: '',
        collected_at: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const fmt = (v: number) => (v / 100).toFixed(2);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/collections', {
            onSuccess: () => { reset(); setShowForm(false); }
        });
    };

    const statusConfig: Record<string, { label: string; cls: string }> = {
        PENDING:   { label: 'في الانتظار', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
        COLLECTED: { label: 'تم التحصيل', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    };

    return (
        <Head title="التحصيلات" />

            <div className="space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">التحصيلات</h1>
                        <p className="text-stone-400 text-sm mt-1">متابعة تحصيل عمولات المطاعم</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        تسجيل تحصيل
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{fmt(totalCollected)} ج</p>
                        <p className="text-stone-400 text-sm mt-1">إجمالي المحصّل</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                        <Clock className="w-6 h-6 text-amber-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{fmt(totalPending)} ج</p>
                        <p className="text-stone-400 text-sm mt-1">في الانتظار</p>
                    </div>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">تسجيل تحصيل جديد</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">المطعم *</label>
                                <select value={data.restaurant_id} onChange={e => setData('restaurant_id', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm">
                                    <option value="">اختر المطعم</option>
                                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">المبلغ (ج.م) *</label>
                                <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">تاريخ التحصيل</label>
                                <input type="date" value={data.collected_at} onChange={e => setData('collected_at', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">ملاحظات</label>
                                <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)}
                                    placeholder="تفاصيل..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors text-sm" />
                            </div>
                            <div className="md:col-span-4 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg text-sm transition-colors">إلغاء</button>
                                <button type="submit" disabled={processing}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                    {processing ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/10">
                                <tr className="text-stone-400">
                                    <th className="text-right px-6 py-4 font-medium">المطعم</th>
                                    <th className="text-right px-6 py-4 font-medium">المبلغ</th>
                                    <th className="text-right px-6 py-4 font-medium">الحالة</th>
                                    <th className="text-right px-6 py-4 font-medium">تاريخ التحصيل</th>
                                    <th className="text-right px-6 py-4 font-medium">الفاتورة</th>
                                    <th className="text-right px-6 py-4 font-medium">بواسطة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {collections.data.map(col => {
                                    const sc = statusConfig[col.status] ?? statusConfig.PENDING;
                                    return (
                                        <tr key={col.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/restaurants/${col.restaurant.id}`}
                                                    className="text-white hover:text-orange-400 transition-colors font-medium">
                                                    {col.restaurant.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-emerald-400 font-semibold">{fmt(col.amount)} ج</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${sc.cls}`}>{sc.label}</span>
                                            </td>
                                            <td className="px-6 py-4 text-stone-400">
                                                {col.collected_at ? new Date(col.collected_at).toLocaleDateString('ar-EG') : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {col.invoice ? (
                                                    <span className="text-indigo-400 text-xs">{col.invoice.invoice_number}</span>
                                                ) : <span className="text-stone-500 text-xs">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-stone-400 text-xs">{col.collectedBy?.name ?? '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {collections.data.length === 0 && (
                            <p className="text-stone-400 text-center py-12 text-sm">لا توجد تحصيلات بعد</p>
                        )}
                    </div>
                </div>
            </div>
    );
}
