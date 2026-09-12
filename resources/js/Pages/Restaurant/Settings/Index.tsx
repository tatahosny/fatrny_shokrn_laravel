import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Restaurant } from '../../../Types';
import RestaurantLocationMap from '../../../Components/RestaurantLocationMap';
import { Store, Clock, MapPin, Phone, ShieldCheck, DollarSign, Upload, Image, Camera, Sparkles, GraduationCap } from 'lucide-react';

interface SettingsProps {
    restaurant: Restaurant;
}

export default function Index({ restaurant }: SettingsProps) {
    const initialImage = restaurant.cover_image || restaurant.logo || null;
    const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
    const initialPercentage = Number(restaurant.student_discount_percentage || 0);
    const [studentDiscountEnabled, setStudentDiscountEnabled] = useState<boolean>(initialPercentage > 0);

    const form = useForm({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.phone || '',
        whatsapp: restaurant.whatsapp || '',
        email: restaurant.email || '',
        address: restaurant.address || '',
        opening_time: restaurant.opening_time ? restaurant.opening_time.substring(0, 5) : '08:00',
        closing_time: restaurant.closing_time ? restaurant.closing_time.substring(0, 5) : '23:00',
        minimum_order_amount: restaurant.minimum_order_amount || 0,
        estimated_delivery_time: restaurant.estimated_delivery_time || 35,
        delivery_base_fee: restaurant.delivery_base_fee ?? (restaurant.delivery_fee || 10),
        delivery_fee_per_km: restaurant.delivery_fee_per_km ?? 5,
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || '',
        logo: null as File | null,
        cover_image: null as File | null,
        student_discount_percentage: initialPercentage,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData(data => ({
                ...data,
                logo: file,
                cover_image: file,
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

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
        form.post('/restaurant/settings', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="إعدادات المطعم — بوابة المطعم — فطرنا" />
            <div className="space-y-6 max-w-4xl" dir="rtl">
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <h1 className="text-xl font-black text-stone-900 dark:text-white mb-1">
                        إعدادات المطعم والفرع
                    </h1>
                    <p className="text-xs text-stone-400 mb-6">
                        تحديث مواعيد العمل، أرقام التواصل، وشعار وصورة المطعم الخارجية
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ── صورة وشعار المطعم الموحد ── */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent border border-orange-500/20 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-orange-500" />
                                        <span>صورة وشعار المطعم (اللوجو والغلاف موحدان)</span>
                                    </h3>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                        صورة الغلاف هي نفسها اللوجو، تظهر لجميع الزوار والطلاب في واجهة الموقع (الاندينج بيدج) وقائمة طعامك
                                    </p>
                                </div>
                                <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{imagePreview ? 'تغيير صورة وشعار المطعم' : 'رفع صورة وشعار المطعم'}</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                                {/* المعاينة كشعار دائري/مربع */}
                                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-center space-y-2">
                                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">مظهر الشعار (اللوجو)</span>
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-orange-300 dark:border-orange-500/40 bg-stone-50 dark:bg-stone-900 flex items-center justify-center group shadow-inner">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt={restaurant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-10 h-10 text-stone-300 dark:text-stone-600" />
                                        )}
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-bold gap-1">
                                            <Upload className="w-4 h-4" />
                                            <span>تغيير</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                    <span className="text-[10px] text-stone-400">يظهر في بطاقة المطعم والقوائم</span>
                                </div>

                                {/* المعاينة كغلاف أفقي */}
                                <div className="md:col-span-8 flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                                            مظهر الغلاف (في اللاندينج بيدج والمنيو)
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400">
                                            واجهة المطعم
                                        </span>
                                    </div>

                                    <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-dashed border-orange-300 dark:border-orange-500/40 bg-stone-50 dark:bg-stone-900 group shadow-inner">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt={restaurant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 space-y-1">
                                                <Image className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                                                <span className="text-xs">لم يتم رفع صورة للمطعم بعد</span>
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-xs font-bold gap-1">
                                            <Upload className="w-5 h-5" />
                                            <span>تغيير الصورة</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                                        <span>الصورة الواحدة تستخدم كشعار وكغلاف تلقائياً</span>
                                        <span>صيغ مدعومة: JPG, PNG, WEBP (بحد أقصى 10MB)</span>
                                    </div>
                                </div>
                            </div>
                            {(form.errors.logo || form.errors.cover_image) && (
                                <p className="text-[11px] text-red-500 font-bold">{form.errors.logo || form.errors.cover_image}</p>
                            )}
                        </div>
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

                        {/* ── خصومات وعروض الطلاب الجامعيين ── */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-transparent border border-indigo-500/20 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-indigo-500" />
                                        <span>خصم الطلاب الجامعيين (جامعة برج العرب والجامعات الشريكة)</span>
                                    </h3>
                                    <p className="text-xs text-stone-400">
                                        تفعيل أو إيقاف خصم عام لجميع الطلاب المعتمدين عند الطلب من مطعمك، بالإضافة لإمكانية تخصيص وجبات/سندوتشات فردية بسعر طالب من صفحة الوجبات.
                                    </p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={studentDiscountEnabled}
                                        onChange={(e) => {
                                            const enabled = e.target.checked;
                                            setStudentDiscountEnabled(enabled);
                                            if (!enabled) {
                                                form.setData('student_discount_percentage', 0);
                                            } else if (Number(form.data.student_discount_percentage) <= 0) {
                                                form.setData('student_discount_percentage', 10);
                                            }
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-indigo-600"></div>
                                    <span className="ms-3 text-xs font-bold text-stone-700 dark:text-stone-300">
                                        {studentDiscountEnabled ? 'الخصم مفعل' : 'الخصم معطل'}
                                    </span>
                                </label>
                            </div>

                            {studentDiscountEnabled && (
                                <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-stone-800 dark:text-stone-200">
                                            نسبة الخصم العام للطلاب على كامل الطلب (%) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                step="1"
                                                required={studentDiscountEnabled}
                                                value={form.data.student_discount_percentage || ''}
                                                onChange={(e) => form.setData('student_discount_percentage', Number(e.target.value))}
                                                placeholder="مثال: 10 أو 15"
                                                className="w-full p-2.5 pl-8 text-xs font-bold rounded-xl bg-white dark:bg-stone-800 border border-indigo-200 dark:border-indigo-800 text-stone-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                            />
                                            <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">%</span>
                                        </div>
                                        {form.errors.student_discount_percentage && (
                                            <p className="text-[11px] text-red-500 mt-1">{form.errors.student_discount_percentage}</p>
                                        )}
                                    </div>

                                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                                        <p className="font-bold flex items-center gap-1">
                                            <span>💡 تنبيه للمطعم:</span>
                                        </p>
                                        <p className="text-[11px] leading-relaxed">
                                            يُخصم هذا المعدل فقط للزبائن الذين اعتمدت إدارة المنصة كارنيهاتهم الجامعية. كما يمكنك أيضاً تحديد سعر خاص ومخفض لأي وجبة أو سندوتش بعينه من صفحة "قائمة الطعام".
                                        </p>
                                    </div>
                                </div>
                            )}
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
