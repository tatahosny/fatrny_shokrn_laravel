import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowRight, Save, Store, DollarSign, Clock, User, Percent, CreditCard, CheckCircle2, Upload, Image, Camera } from 'lucide-react';
import { Restaurant } from '../../../Types';

interface Props {
    restaurant: Restaurant & {
        commission_percentage?: number;
        monthly_subscription_fee?: number;
    };
}

export default function RestaurantEdit({ restaurant }: Props) {
    const initialCommissionType = (restaurant.commission_type === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'PERCENTAGE') as 'PERCENTAGE' | 'SUBSCRIPTION';
    const [contractType, setContractType] = useState<'PERCENTAGE' | 'SUBSCRIPTION'>(initialCommissionType);
    const initialImage = restaurant.cover_image || restaurant.logo || null;
    const [imagePreview, setImagePreview] = useState<string | null>(initialImage);

    const { data, setData, processing, errors } = useForm({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        whatsapp: restaurant.whatsapp || '',
        email: restaurant.email || '',
        status: restaurant.status || 'ACTIVE',
        opening_time: restaurant.opening_time ? restaurant.opening_time.substring(0, 5) : '08:00',
        closing_time: restaurant.closing_time ? restaurant.closing_time.substring(0, 5) : '23:00',
        delivery_fee: restaurant.delivery_fee != null ? restaurant.delivery_fee.toString() : '10.00',
        minimum_order_amount: restaurant.minimum_order_amount != null ? restaurant.minimum_order_amount.toString() : '20.00',
        estimated_delivery_time: restaurant.estimated_delivery_time || 30,
        student_discount_percentage: restaurant.student_discount_percentage || 0,
        commission_type: initialCommissionType,
        commission_percentage: restaurant.commission_percentage != null ? Number(restaurant.commission_percentage) : 15,
        monthly_subscription_fee: restaurant.monthly_subscription_fee != null ? Number(restaurant.monthly_subscription_fee) : 0,
        logo: null as File | null,
        cover_image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(d => ({
                ...d,
                logo: file,
                cover_image: file,
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleContractTypeChange = (type: 'PERCENTAGE' | 'SUBSCRIPTION') => {
        setContractType(type);
        setData('commission_type', type);
        if (type === 'PERCENTAGE') {
            setData('monthly_subscription_fee', 0);
        } else {
            setData('commission_percentage', 0);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/restaurants/${restaurant.id}`, {
            ...data,
            _method: 'PUT',
        }, {
            forceFormData: true,
        });
    };

    const inputCls = "w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition";
    const labelCls = "block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5";

    return (
        <>
            <Head title={`تعديل ${restaurant.name} — فطرنا`} />
            <div className="max-w-3xl space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/restaurants/${restaurant.id}`}
                        className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-orange-600 transition shadow-xs"
                        title="العودة لتفاصيل المطعم"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">تعديل بيانات المطعم</h1>
                        <p className="text-xs text-stone-400 mt-0.5">{restaurant.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Media / Images */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-orange-500" />
                                    <span>شعار وصورة غلاف المطعم (اللوجو والغلاف موحدان)</span>
                                </h2>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                    صورة الغلاف هي نفسها اللوجو، تظهر للزوار والطلاب في الصفحة الرئيسية (الاندينج) وصفحة المطعم وقائمته
                                </p>
                            </div>
                            <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{imagePreview ? 'تغيير صورة وشعار المطعم' : 'رفع صورة وشعار المطعم'}</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                            {/* Logo view */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-center space-y-2">
                                <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">مظهر الشعار (اللوجو)</span>
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-orange-300 dark:border-orange-500/40 bg-white dark:bg-stone-900 flex items-center justify-center group shadow-inner">
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

                            {/* Cover view */}
                            <div className="md:col-span-8 flex flex-col justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                        مظهر الغلاف (في اللاندينج بيدج والمنيو)
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400">
                                        واجهة المطعم
                                    </span>
                                </div>
                                <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-dashed border-orange-300 dark:border-orange-500/40 bg-white dark:bg-stone-900 group shadow-inner">
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
                        {(errors.logo || errors.cover_image) && (
                            <p className="text-[11px] text-red-500 font-bold">{errors.logo || errors.cover_image}</p>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Store className="w-4 h-4 text-orange-500" />
                            بيانات المطعم الأساسية
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelCls}>اسم المطعم *</label>
                                <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>الوصف</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                            </div>
                            <div>
                                <label className={labelCls}>رقم الهاتف *</label>
                                <input type="text" required value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputCls} />
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>رقم الواتساب</label>
                                <input type="text" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>البريد الإلكتروني للفرع</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputCls} />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>خصم الطلاب (%)</label>
                                <input type="number" min="0" max="100" step="1" value={data.student_discount_percentage} onChange={e => setData('student_discount_percentage', parseFloat(e.target.value) || 0)} className={inputCls} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>العنوان بالتفصيل *</label>
                                <input type="text" required value={data.address} onChange={e => setData('address', e.target.value)} className={inputCls} />
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-bold">{errors.address}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>حالة المطعم</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value as any)} className={inputCls}>
                                    <option value="ACTIVE">نشط (مفتوح للطلبات)</option>
                                    <option value="SUSPENDED">موقوف (معلق عن العمل)</option>
                                    <option value="INACTIVE">غير نشط</option>
                                    <option value="PENDING">قيد المراجعة</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Hours & Delivery */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-orange-500" />
                            مواعيد العمل والتوصيل
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className={labelCls}>وقت الافتتاح</label>
                                <input type="time" value={data.opening_time} onChange={e => setData('opening_time', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>وقت الإغلاق</label>
                                <input type="time" value={data.closing_time} onChange={e => setData('closing_time', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>وقت التوصيل (دقيقة)</label>
                                <input type="number" min="5" value={data.estimated_delivery_time} onChange={e => setData('estimated_delivery_time', parseInt(e.target.value))} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>الحد الأدنى للطلب (ج.م)</label>
                                <input type="number" step="1" value={data.minimum_order_amount} onChange={e => setData('minimum_order_amount', e.target.value)} className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>رسوم التوصيل الثابتة (ج.م)</label>
                            <input type="number" step="0.5" value={data.delivery_fee} onChange={e => setData('delivery_fee', e.target.value)} className={`${inputCls} max-w-xs`} />
                            <p className="text-[11px] text-stone-400 mt-1">رسوم توصيل ثابتة على كل طلب من المطعم</p>
                        </div>
                    </div>

                    {/* Financial Agreement */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-5">
                        <div>
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-orange-500" />
                                الاتفاق المالي مع المطعم
                            </h2>
                            <p className="text-xs text-stone-400 mt-1">
                                إما عمولة نسبة مئوية على الطلبات أو اشتراك شهري ثابت يتم تحصيله أول كل شهر.
                            </p>
                        </div>

                        {/* Contract Type Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleContractTypeChange('PERCENTAGE')}
                                className={`p-4 rounded-2xl border-2 text-right transition ${
                                    contractType === 'PERCENTAGE'
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Percent className={`w-5 h-5 ${contractType === 'PERCENTAGE' ? 'text-orange-600' : 'text-stone-400'}`} />
                                    {contractType === 'PERCENTAGE' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                                </div>
                                <p className={`font-black text-sm ${contractType === 'PERCENTAGE' ? 'text-orange-700 dark:text-orange-300' : 'text-stone-700 dark:text-stone-300'}`}>
                                    عمولة على كل طلب
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">نسبة مئوية من قيمة كل طلب</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleContractTypeChange('SUBSCRIPTION')}
                                className={`p-4 rounded-2xl border-2 text-right transition ${
                                    contractType === 'SUBSCRIPTION'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <CreditCard className={`w-5 h-5 ${contractType === 'SUBSCRIPTION' ? 'text-blue-600' : 'text-stone-400'}`} />
                                    {contractType === 'SUBSCRIPTION' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                </div>
                                <p className={`font-black text-sm ${contractType === 'SUBSCRIPTION' ? 'text-blue-700 dark:text-blue-300' : 'text-stone-700 dark:text-stone-300'}`}>
                                    اشتراك شهري ثابت
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">مبلغ ثابت في بداية كل شهر</p>
                            </button>
                        </div>

                        {/* Contract Value */}
                        {contractType === 'PERCENTAGE' ? (
                            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
                                <label className="block text-xs font-black text-orange-700 dark:text-orange-400 mb-2">نسبة العمولة (%)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="50"
                                        value={data.commission_percentage}
                                        onChange={e => setData('commission_percentage', parseFloat(e.target.value) || 0)}
                                        className="w-32 px-3.5 py-2.5 text-sm font-black rounded-xl bg-white dark:bg-stone-800 border-2 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 focus:outline-none transition"
                                    />
                                    <span className="text-sm font-bold text-stone-600 dark:text-stone-400">% من قيمة كل طلب</span>
                                </div>
                                {errors.commission_percentage && <p className="text-red-500 text-xs mt-1 font-bold">{errors.commission_percentage}</p>}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                                <label className="block text-xs font-black text-blue-700 dark:text-blue-400 mb-2">قيمة الاشتراك الشهري (ج.م)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        step="50"
                                        min="0"
                                        value={data.monthly_subscription_fee}
                                        onChange={e => setData('monthly_subscription_fee', parseFloat(e.target.value) || 0)}
                                        className="w-36 px-3.5 py-2.5 text-sm font-black rounded-xl bg-white dark:bg-stone-800 border-2 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 focus:outline-none transition"
                                    />
                                    <span className="text-sm font-bold text-stone-600 dark:text-stone-400">ج.م / شهر</span>
                                </div>
                                {errors.monthly_subscription_fee && <p className="text-red-500 text-xs mt-1 font-bold">{errors.monthly_subscription_fee}</p>}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href={`/admin/restaurants/${restaurant.id}`} className="px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-xs transition">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs shadow-md transition disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
