import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Restaurant } from '../../../Types';
import RestaurantLocationMap from '../../../Components/RestaurantLocationMap';
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
        delivery_base_fee: restaurant.delivery_base_fee ?? (restaurant.delivery_fee || 10),
        delivery_fee_per_km: restaurant.delivery_fee_per_km ?? 5,
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || '',
    });

    const handleMapLocationChange = (lat: number, lng: number, address: string) => {
        form.setData(data => ({
            ...data,
            latitude: lat,
            longitude: lng,
            address: address,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/restaurant/settings');
    };

    return (
        <>
            <Head title="إعدادات المطعم — بوابة المطعم — فطرنا" />
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

                        {/* تحديد موقع المطعم على الخريطة */}
                        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div>
                                    <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        تحديد موقع المطعم على الخريطة
                                    </h3>
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                        حدد موقعك بدقة حتى يستطيع الطيار والعميل إيجادك بسهولة وحساب رسوم التوصيل تلقائياً
                                    </p>
                                </div>
                                {(form.data.latitude && form.data.longitude) && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        ✓ {Number(form.data.latitude).toFixed(5)}, {Number(form.data.longitude).toFixed(5)}
                                    </span>
                                )}
                            </div>

                            <RestaurantLocationMap
                                initialLat={restaurant.latitude}
                                initialLng={restaurant.longitude}
                                restaurantName={restaurant.name}
                                onLocationChange={handleMapLocationChange}
                            />

                            {/* Still keep the price fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-orange-200/50 dark:border-orange-800/30">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-orange-600 dark:text-orange-400">سعر الكيلو (ج.م / كم) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={form.data.delivery_fee_per_km}
                                        onChange={(e) => form.setData('delivery_fee_per_km', Number(e.target.value))}
                                        placeholder="5.00"
                                        className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-stone-800 border border-orange-300 dark:border-orange-500/40"
                                    />
                                    <span className="text-[10px] text-stone-400">مثال: 5 ج لكل كيلو</span>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">سعر التوصيل الأساسي (ج.م)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={form.data.delivery_base_fee}
                                        onChange={(e) => form.setData('delivery_base_fee', Number(e.target.value))}
                                        placeholder="10.00"
                                        className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                    />
                                    <span className="text-[10px] text-stone-400">سعر فتح العداد / البداية</span>
                                </div>
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
        </>
    );
}
