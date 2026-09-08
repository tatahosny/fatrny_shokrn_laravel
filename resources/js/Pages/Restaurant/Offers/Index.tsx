import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { Restaurant, Offer, PaginatedResponse } from '../../../Types';
import { Tag, Plus, Trash2, Percent } from 'lucide-react';

interface OffersProps {
    offers: PaginatedResponse<Offer>;
    restaurant: Restaurant;
}

export default function Index({ offers, restaurant }: OffersProps) {
    const items = offers?.data || [];
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        title: '',
        description: '',
        original_price: '',
        discount_price: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/restaurant/offers', {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
            router.delete(`/restaurant/offers/${id}`);
        }
    };

    return (
        <RestaurantLayout title="العروض الترويجية والخصومات" restaurantName={restaurant.name}>
            <Head title="العروض الترويجية — بوابة المطعم" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                عروض وخصومات المطعم
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                العروض النشطة تظهر في الصفحة الرئيسية للمنصة وداخل صفحة مطعمك
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إنشاء عرض جديد</span>
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Tag className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا توجد عروض ترويجية نشطة حالياً.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((offer) => (
                                <div key={offer.id} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-[10px]">
                                                خصم {Number(offer.discount_percentage || 0).toFixed(0)}%
                                            </span>
                                            <button
                                                onClick={() => handleDelete(offer.id)}
                                                className="text-stone-400 hover:text-red-500 p-1"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">{offer.title}</h3>
                                        <p className="text-xs text-stone-500 line-clamp-2">{offer.description}</p>
                                    </div>
                                    <div className="pt-3 border-t border-stone-200 dark:border-stone-700 mt-4 flex items-baseline gap-2">
                                        <span className="text-base font-black text-orange-600">{offer.discount_price} ج.م</span>
                                        <span className="text-xs text-stone-400 line-through">{offer.original_price} ج.م</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6 shadow-2xl z-10 animate-fade-in">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">إنشاء عرض جديد</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">عنوان العرض</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="مثال: عرض الغداء — 3 ساندوتشات + كانز"
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1">السعر الأصلي</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.data.original_price}
                                        onChange={(e) => form.setData('original_price', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">سعر العرض المخفض</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.data.discount_price}
                                        onChange={(e) => form.setData('discount_price', e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">الوصف التفصيلي</label>
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
                                    نشر العرض
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
        </RestaurantLayout>
    );
}
