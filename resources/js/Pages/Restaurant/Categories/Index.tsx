import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Restaurant, Category } from '../../../Types';
import { Layers, Plus, Trash2, Edit2 } from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface CategoriesProps {
    categories: (Category & { menu_items_count: number })[];
    restaurant: Restaurant;
}

export default function Index({ categories = [], restaurant }: CategoriesProps) {
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const form = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/restaurant/categories', {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        setConfirmDelete(id);
    };

    return (
        <>
            <Head title="تصنيفات المنيو — بوابة المطعم — فطرنا" />
            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                تصنيفات قائمة الطعام
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                تقسيم الوجبات لأقسام (فول وفلافل، ساندوتشات، مشروبات...)
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة تصنيف جديد</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        {cat.menu_items_count || 0} صنف
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-1.5 text-stone-400 hover:text-red-500 transition"
                                    title="حذف"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6 shadow-2xl z-10 animate-fade-in">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">
                            إضافة تصنيف جديد
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">اسم التصنيف</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="مثال: فطير مشلتت بالسمن البلدي"
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">الوصف (اختياري)</label>
                                <textarea
                                    rows={2}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                                >
                                    حفظ التصنيف
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
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
                isOpen={confirmDelete !== null}
                message="هل أنت متأكد من حذف هذا التصنيف؟ لن تتمكن من استعادته."
                onConfirm={() => { if (confirmDelete) router.delete(`/restaurant/categories/${confirmDelete}`); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
        </>
    );
}
