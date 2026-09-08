import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { Restaurant, MenuItem, Category, PaginatedResponse } from '../../../Types';
import { Utensils, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';

interface MenuIndexProps {
    menu_items: PaginatedResponse<MenuItem>;
    categories: Category[];
    restaurant: Restaurant;
}

export default function Index({ menu_items, categories = [], restaurant }: MenuIndexProps) {
    const items = menu_items?.data || [];
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('ALL');

    // Create item modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const form = useForm({
        name: '',
        category_id: categories[0]?.id || '',
        price: '',
        discount_price: '',
        description: '',
        is_available: true,
        is_featured: false,
        preparation_time: 10,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/restaurant/menu', {
            onSuccess: () => {
                setShowCreateModal(false);
                form.reset();
            }
        });
    };

    const handleToggleAvailable = (id: number) => {
        router.patch(`/restaurant/menu/${id}/toggle-availability`);
    };

    const handleDelete = (id: number) => {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا الصنف من المنيو؟')) {
            router.delete(`/restaurant/menu/${id}`);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = selectedCat === 'ALL' || item.category_id === Number(selectedCat);
        return matchesSearch && matchesCat;
    });

    return (
        <RestaurantLayout title="قائمة الطعام (المنيو)" restaurantName={restaurant.name}>
            <Head title="إدارة المنيو — بوابة المطعم" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                أصناف قائمة الطعام
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                إدارة الأصناف، الأسعار، وإيقاف أو تشغيل التوفر في المطبخ
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة صنف جديد</span>
                        </button>
                    </div>

                    {/* Filters bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث باسم الصنف أو الوصف..."
                                className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                            />
                        </div>

                        <select
                            value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}
                            className="p-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                        >
                            <option value="ALL">جميع التصنيفات</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Utensils className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا توجد أصناف تطابق البحث.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                        <th className="py-3 px-4">الصنف</th>
                                        <th className="py-3 px-4">التصنيف</th>
                                        <th className="py-3 px-4">السعر</th>
                                        <th className="py-3 px-4">سعر الخصم</th>
                                        <th className="py-3 px-4">التوفر</th>
                                        <th className="py-3 px-4 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                            <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.name}</span>
                                                    {item.is_featured && (
                                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">مميز</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-stone-400 truncate max-w-xs">{item.description}</p>
                                            </td>
                                            <td className="py-4 px-4 text-stone-500">
                                                {item.category?.name || '—'}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-stone-800 dark:text-stone-200">
                                                {item.price} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-emerald-600 font-bold">
                                                {item.discount_price ? `${item.discount_price} ج.م` : '—'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleToggleAvailable(item.id)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                                        item.is_available
                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                                    }`}
                                                >
                                                    {item.is_available ? 'متوفر' : 'غير متوفر'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-stone-400 hover:text-red-500 transition"
                                                    title="حذف الصنف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Item Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-lg p-6 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-black text-stone-900 dark:text-white mb-4">
                            إضافة صنف جديد للمنيو
                        </h2>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">اسم الصنف</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="مثال: ساندوتش فلافل محشية سوبر"
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1">التصنيف</label>
                                    <select
                                        value={form.data.category_id}
                                        onChange={(e) => form.setData('category_id', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">وقت التجهيز (دقائق)</label>
                                    <input
                                        type="number"
                                        value={form.data.preparation_time}
                                        onChange={(e) => form.setData('preparation_time', Number(e.target.value))}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1">السعر الأصلي (ج.م)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.data.price}
                                        onChange={(e) => form.setData('price', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">سعر مخفض (اختياري)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={form.data.discount_price}
                                        onChange={(e) => form.setData('discount_price', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">الوصف والمكونات</label>
                                <textarea
                                    rows={2}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_available}
                                        onChange={(e) => form.setData('is_available', e.target.checked)}
                                        className="rounded text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>متاح للطلب الآن</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_featured}
                                        onChange={(e) => form.setData('is_featured', e.target.checked)}
                                        className="rounded text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>صنف مميز في الواجهة</span>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow"
                                >
                                    حفظ الصنف
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="py-3 px-5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </RestaurantLayout>
    );
}
