import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { ArrowLeft, Save, Tag, Calendar, Percent, DollarSign } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
}

interface Props {
    menuItems: MenuItem[];
}

export default function OfferCreate({ menuItems }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        min_order_amount: '',
        start_date: '',
        end_date: '',
        is_active: true,
        menu_item_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/restaurant/offers');
    };

    return (
        <RestaurantLayout>
            <Head title="إضافة عرض جديد" />

            <div className="max-w-2xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/restaurant/offers"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إضافة عرض جديد</h1>
                        <p className="text-stone-400 text-sm mt-1">أنشئ عرضاً ترويجياً لمطعمك</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Tag className="w-5 h-5 text-orange-400" />
                            تفاصيل العرض
                        </h2>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">عنوان العرض *</label>
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="خصم 20% على كل الفطائر"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-stone-400 mb-1">الوصف</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                rows={2} placeholder="وصف مختصر للعرض..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">نوع الخصم</label>
                                <select value={data.discount_type} onChange={e => setData('discount_type', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                                    <option value="FIXED">مبلغ ثابت (ج.م)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">
                                    قيمة الخصم {data.discount_type === 'PERCENTAGE' ? '(%)' : '(ج.م)'} *
                                </label>
                                <input type="number" step="0.01" min="0" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)}
                                    placeholder={data.discount_type === 'PERCENTAGE' ? '20' : '10.00'}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.discount_value && <p className="text-red-400 text-xs mt-1">{errors.discount_value}</p>}
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الحد الأدنى للطلب (ج.م)</label>
                                <input type="number" step="0.01" value={data.min_order_amount} onChange={e => setData('min_order_amount', e.target.value)}
                                    placeholder="0.00 (لا يوجد حد أدنى)"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الطبق المرتبط (اختياري)</label>
                                <select value={data.menu_item_id} onChange={e => setData('menu_item_id', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="">عرض عام</option>
                                    {menuItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            مدة العرض
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">تاريخ البداية</label>
                                <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">تاريخ الانتهاء</label>
                                <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                className="w-4 h-4 accent-orange-500" />
                            <span className="text-sm text-stone-300">تفعيل العرض فوراً</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/restaurant/offers"
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الإنشاء...' : 'إنشاء العرض'}
                        </button>
                    </div>
                </form>
            </div>
        </RestaurantLayout>
    );
}
