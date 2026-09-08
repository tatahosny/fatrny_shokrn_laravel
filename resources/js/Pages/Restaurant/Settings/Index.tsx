import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { Restaurant } from '../../../Types';
import { Store, Clock, MapPin, Phone, ShieldCheck, DollarSign } from 'lucide-react';

interface SettingsProps {
    restaurant: Restaurant;
}

export default function Index({ restaurant }: SettingsProps) {
    const form = useForm({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.phone || '',
        whatsapp: restaurant.whatsapp || '',
        email: restaurant.email || '',
        address: restaurant.address || '',
        opening_time: restaurant.opening_time || '08:00',
        closing_time: restaurant.closing_time || '23:00',
        minimum_order_amount: restaurant.minimum_order_amount || 0,
        estimated_delivery_time: restaurant.estimated_delivery_time || 35,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/restaurant/settings');
    };

    return (
        <RestaurantLayout title="إعدادات وبيانات المطعم" restaurantName={restaurant.name}>
            <Head title="إعدادات المطعم — بوابة المطعم" />

            <div className="space-y-6 max-w-4xl">
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <h1 className="text-xl font-black text-stone-900 dark:text-white mb-1">
                        إعدادات المطعم والفرع
                    </h1>
                    <p className="text-xs text-stone-400 mb-6">
                        تحديث مواعيد العمل، أرقام التواصل، والحد الأدنى للطلبات
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">اسم المطعم</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                                {form.errors.name && <p className="text-[11px] text-red-500 mt-1">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">رقم الهاتف الأرضي / الموبايل</label>
                                <input
                                    type="text"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">وصف المطعم والمأكولات</label>
                            <textarea
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">عنوان الفرع في برج العرب</label>
                            <input
                                type="text"
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">وقت الفتح صباحاً</label>
                                <input
                                    type="text"
                                    value={form.data.opening_time}
                                    onChange={(e) => form.setData('opening_time', e.target.value)}
                                    placeholder="07:00"
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">وقت الإغلاق ليلاً</label>
                                <input
                                    type="text"
                                    value={form.data.closing_time}
                                    onChange={(e) => form.setData('closing_time', e.target.value)}
                                    placeholder="02:00"
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">الحد الأدنى للطلب (ج.م)</label>
                                <input
                                    type="number"
                                    value={form.data.minimum_order_amount}
                                    onChange={(e) => form.setData('minimum_order_amount', Number(e.target.value))}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">متوسط وقت التجهيز (دقيقة)</label>
                                <input
                                    type="number"
                                    value={form.data.estimated_delivery_time}
                                    onChange={(e) => form.setData('estimated_delivery_time', Number(e.target.value))}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="py-3 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60"
                            >
                                {form.processing ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </RestaurantLayout>
    );
}
