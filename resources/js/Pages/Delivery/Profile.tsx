import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DeliveryLayout from '../../Layouts/DeliveryLayout';
import { DeliveryDriver } from '../../Types';
import { User, Phone, Bike, Power, CheckCircle2, Store } from 'lucide-react';

interface DriverProfileProps {
    driver: DeliveryDriver;
}

export default function Profile({ driver }: DriverProfileProps) {
    const isAvailable = driver.availability_status === 'AVAILABLE';

    const profileForm = useForm({
        phone: driver.phone || '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/delivery/profile');
    };

    const toggleAvailability = () => {
        router.post('/delivery/profile/availability', {
            availability_status: isAvailable ? 'OFFLINE' : 'AVAILABLE'
        });
    };

    return (
        <DeliveryLayout title="حساب الطيار" isAvailable={isAvailable}>
            <Head title="حساب الطيار — كابتن فطرنا شكراً" />

            <div className="space-y-6">
                {/* Profile header card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                        {driver.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">
                            {driver.name}
                        </h1>
                        {driver.restaurant ? (
                            <>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    كابتن توصيل معتمد
                                </p>
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>تابع لمطعم: {driver.restaurant.name}</span>
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-stone-500 mt-0.5">
                                كابتن توصيل
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Switch */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black text-stone-900 dark:text-white">حالة الاتصال بالمنصة</h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            {isAvailable ? 'أنت متصل ومتاح لاستقبال مهام التوصيل' : 'أنت غير متصل (لن يتم إسناد طلبات لك)'}
                        </p>
                    </div>

                    <button
                        onClick={toggleAvailability}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5 ${
                            isAvailable
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isAvailable ? 'تحويل إلى غير متصل' : 'تفعيل الحضور (متاح)'}</span>
                    </button>
                </div>

                {/* Edit Phone Form */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <h2 className="text-sm font-black text-stone-900 dark:text-white mb-4">
                        بيانات الاتصال
                    </h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                رقم الهاتف للتواصل المباشر
                            </label>
                            <input
                                type="tel"
                                required
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                            {profileForm.errors.phone && (
                                <p className="text-[11px] text-red-500 mt-1">{profileForm.errors.phone}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={profileForm.processing}
                            className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                        >
                            حفظ التعديلات
                        </button>
                    </form>
                </div>
            </div>
        </DeliveryLayout>
    );
}
