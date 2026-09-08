import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { Restaurant, DeliveryDriver, PaginatedResponse } from '../../../Types';
import { Bike, Plus, Trash2, Phone, Power, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface DriversProps {
    drivers: PaginatedResponse<DeliveryDriver>;
    restaurant: Restaurant;
}

export default function Index({ drivers, restaurant }: DriversProps) {
    const items = drivers?.data || [];
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/restaurant/delivery-drivers', {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            }
        });
    };

    const handleToggleStatus = (id: number) => {
        router.patch(`/restaurant/delivery-drivers/${id}/toggle-status`);
    };

    const handleDelete = (id: number) => {
        setConfirmDelete(id);
    };

    return (
        <RestaurantLayout title="كباتن التوصيل" restaurantName={restaurant.name}>
            <Head title="كباتن التوصيل — بوابة المطعم" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h1 className="text-xl font-black text-stone-900 dark:text-white">
                                طيارو وكباتن المطعم
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                إدارة فريق التوصيل الخاص بفرع برج العرب وحالات الاتصال
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة كابتن جديد</span>
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Bike className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا يوجد طيارون مسجلون في المطعم حالياً.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((d) => (
                                <div key={d.id} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                                                {d.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-stone-900 dark:text-white">{d.name}</h3>
                                                <p className="text-xs font-mono text-stone-500">{d.phone}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            className="text-stone-400 hover:text-red-500 p-1"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            d.availability_status === 'AVAILABLE'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-stone-200 text-stone-600'
                                        }`}>
                                            {d.availability_status === 'AVAILABLE' ? 'متصل ومتاح' : 'غير متصل'}
                                        </span>

                                        <button
                                            onClick={() => handleToggleStatus(d.id)}
                                            className="text-stone-500 hover:text-stone-900 dark:hover:text-white underline text-[11px]"
                                        >
                                            {d.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                        </button>
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
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">إضافة كابتن توصيل للمطعم</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">اسم الكابتن</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">البريد الإلكتروني لتسجيل الدخول</label>
                                <input
                                    type="email"
                                    required
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                                {form.errors.email && <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    required
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                                {form.errors.phone && <p className="text-red-500 text-xs mt-1">{form.errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">كلمة المرور</label>
                                <input
                                    type="password"
                                    required
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                                />
                                {form.errors.password && <p className="text-red-500 text-xs mt-1">{form.errors.password}</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                                >
                                    إضافة الكابتن
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
                message="هل أنت متأكد من حذف هذا الكابتن؟ لن تتمكن من استعادته."
                onConfirm={() => { if (confirmDelete) router.delete(`/restaurant/delivery-drivers/${confirmDelete}`); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
        </RestaurantLayout>
    );
}
