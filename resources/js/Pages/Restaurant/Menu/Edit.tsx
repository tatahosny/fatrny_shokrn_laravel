import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, GraduationCap } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    discount_price?: number | null;
    student_price?: number | null;
    category_id: number;
    is_available: boolean;
    is_featured: boolean;
    calories: number | null;
    preparation_time: number | null;
    sort_order: number;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    menuItem: MenuItem;
    categories: Category[];
}

export default function MenuItemEdit({ menuItem, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: menuItem.name,
        description: menuItem.description ?? '',
        price: String(menuItem.price),
        discount_price: menuItem.discount_price ? String(menuItem.discount_price) : '',
        student_price: menuItem.student_price ? String(menuItem.student_price) : '',
        category_id: String(menuItem.category_id),
        is_available: menuItem.is_available,
        is_featured: menuItem.is_featured,
        calories: menuItem.calories ? String(menuItem.calories) : '',
        preparation_time: menuItem.preparation_time ? String(menuItem.preparation_time) : '',
        sort_order: menuItem.sort_order,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/restaurant/menu/${menuItem.id}`);
    };

    return (
        <>
            <Head title={`تعديل ${menuItem.name} — فطرنا`} />
            <div className="max-w-2xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/restaurant/menu"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">تعديل الطبق</h1>
                        <p className="text-stone-400 text-sm mt-1">{menuItem.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white">بيانات الطبق</h2>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">اسم الطبق *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">الوصف</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">السعر الأصلي (ج.م) *</label>
                                <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData('price', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">سعر الخصم / العرض (اختياري)</label>
                                <input type="number" step="0.01" min="0" value={data.discount_price} onChange={e => setData('discount_price', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.discount_price && <p className="text-red-400 text-xs mt-1">{errors.discount_price}</p>}
                            </div>

                            <div className="col-span-2 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5">
                                <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                                    <span>سعر خاص للطلاب الجامعيين (اختياري) 🎓</span>
                                </label>
                                <input type="number" step="0.01" min="0" value={data.student_price} onChange={e => setData('student_price', e.target.value)}
                                    placeholder="مثال: 25.00 (اتركه فارغاً لإلغاء سعر الطالب)"
                                    className="w-full bg-white/5 border border-indigo-500/30 rounded-lg px-4 py-2.5 text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500 transition-colors text-xs" />
                                <p className="text-[11px] text-stone-400">إذا تم تحديد هذا السعر، سيظهر هذا السندوتش/الطبق بسعر مخفض خصيصاً للطلاب المعتمدين.</p>
                                {errors.student_price && <p className="text-red-400 text-xs mt-1">{errors.student_price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الفئة *</label>
                                <select value={data.category_id} onChange={e => setData('category_id', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="">اختر الفئة</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">السعرات الحرارية</label>
                                <input type="number" value={data.calories} onChange={e => setData('calories', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">وقت التحضير (دقيقة)</label>
                                <input type="number" value={data.preparation_time} onChange={e => setData('preparation_time', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الترتيب</label>
                                <input type="number" value={data.sort_order} onChange={e => setData('sort_order', parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
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
                            {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
