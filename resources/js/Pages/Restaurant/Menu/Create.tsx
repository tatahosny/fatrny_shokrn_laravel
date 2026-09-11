import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Image, Plus, Trash2, Tag } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

export default function MenuItemCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        is_available: true,
        is_featured: false,
        calories: '',
        preparation_time: '',
        sort_order: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/restaurant/menu');
    };

    return (
        <Head title="إضافة طبق جديد" />

            <div className="max-w-2xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/restaurant/menu"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إضافة طبق جديد</h1>
                        <p className="text-stone-400 text-sm mt-1">أضف طبقاً جديداً لقائمة مطعمك</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white">بيانات الطبق</h2>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">اسم الطبق *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                placeholder="فطير بالجبن والعسل"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">الوصف</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                rows={3} placeholder="وصف مختصر للطبق..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">السعر (ج.م) *</label>
                                <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData('price', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الفئة *</label>
                                <select value={data.category_id} onChange={e => setData('category_id', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="">اختر الفئة</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">السعرات الحرارية</label>
                                <input type="number" value={data.calories} onChange={e => setData('calories', e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">وقت التحضير (دقيقة)</label>
                                <input type="number" value={data.preparation_time} onChange={e => setData('preparation_time', e.target.value)}
                                    placeholder="15"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)}
                                    className="w-4 h-4 accent-orange-500" />
                                <span className="text-sm text-stone-300">متاح للطلب</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)}
                                    className="w-4 h-4 accent-orange-500" />
                                <span className="text-sm text-stone-300">طبق مميز</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/restaurant/menu"
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الإضافة...' : 'إضافة الطبق'}
                        </button>
                    </div>
                </form>
            </div>
    );
}
