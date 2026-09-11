import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Calendar, DollarSign, Store } from 'lucide-react';

interface Restaurant {
    id: number;
    name: string;
}

interface Props {
    restaurants: Restaurant[];
}

export default function InvoiceCreate({ restaurants }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        restaurant_id: '',
        period_start: '',
        period_end: '',
        due_date: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/invoices');
    };

    return (
        <Head title="إنشاء فاتورة جديدة" />

            <div className="max-w-2xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/invoices"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إنشاء فاتورة جديدة</h1>
                        <p className="text-stone-400 text-sm mt-1">فاتورة عمولة للمطعم</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-400" />
                            بيانات الفاتورة
                        </h2>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">المطعم *</label>
                            <select value={data.restaurant_id} onChange={e => setData('restaurant_id', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                <option value="">اختر المطعم</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            {errors.restaurant_id && <p className="text-red-400 text-xs mt-1">{errors.restaurant_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">بداية الفترة *</label>
                                <input type="date" value={data.period_start} onChange={e => setData('period_start', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.period_start && <p className="text-red-400 text-xs mt-1">{errors.period_start}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">نهاية الفترة *</label>
                                <input type="date" value={data.period_end} onChange={e => setData('period_end', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">تاريخ الاستحقاق</label>
                            <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                        </div>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">ملاحظات</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                rows={3} placeholder="ملاحظات إضافية للفاتورة..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-amber-300 text-sm">
                            💡 سيقوم النظام تلقائياً بحساب مبلغ الفاتورة بناءً على طلبات المطعم والعمولة المتفق عليها خلال الفترة المحددة.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/admin/invoices"
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الإنشاء...' : 'إنشاء الفاتورة'}
                        </button>
                    </div>
                </form>
            </div>
    );
}
