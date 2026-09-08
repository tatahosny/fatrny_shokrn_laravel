import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { ArrowLeft, Save, User, Phone, Car } from 'lucide-react';

export default function DeliveryDriverCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicle_type: 'MOTORCYCLE',
        vehicle_plate: '',
        national_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/restaurant/delivery-drivers');
    };

    return (
        <RestaurantLayout>
            <Head title="إضافة سائق توصيل" />

            <div className="max-w-2xl" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/restaurant/delivery-drivers"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إضافة سائق توصيل</h1>
                        <p className="text-stone-400 text-sm mt-1">أضف سائقاً جديداً لفريق التوصيل</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-400" />
                            البيانات الشخصية
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-stone-400 mb-1">الاسم الكامل *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    placeholder="محمد أحمد"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">البريد الإلكتروني *</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                    placeholder="driver@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">رقم الهاتف *</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">كلمة المرور *</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">الرقم القومي</label>
                                <input type="text" value={data.national_id} onChange={e => setData('national_id', e.target.value)}
                                    placeholder="xxxxxxxxxxxxxxxxxxx"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Car className="w-5 h-5 text-indigo-400" />
                            بيانات المركبة
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">نوع المركبة</label>
                                <select value={data.vehicle_type} onChange={e => setData('vehicle_type', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors">
                                    <option value="MOTORCYCLE">دراجة نارية</option>
                                    <option value="CAR">سيارة</option>
                                    <option value="BICYCLE">دراجة هوائية</option>
                                    <option value="WALKING">مشياً</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1">رقم اللوحة</label>
                                <input type="text" value={data.vehicle_plate} onChange={e => setData('vehicle_plate', e.target.value)}
                                    placeholder="أ ب ج 1234"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href="/restaurant/delivery-drivers"
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg font-medium transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الإضافة...' : 'إضافة السائق'}
                        </button>
                    </div>
                </form>
            </div>
        </RestaurantLayout>
    );
}
