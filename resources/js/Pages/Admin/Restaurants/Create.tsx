import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowRight, Save, Store, DollarSign, Clock, User, Percent, CreditCard, CheckCircle2 } from 'lucide-react';

export default function RestaurantCreate() {
    const [contractType, setContractType] = useState<'PERCENTAGE' | 'SUBSCRIPTION'>('PERCENTAGE');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        address: '',
        phone: '',
        whatsapp: '',
        email: '',
        opening_time: '08:00',
        closing_time: '23:00',
        delivery_fee: '10.00',
        minimum_order_amount: '20.00',
        estimated_delivery_time: 30,
        student_discount_percentage: 0,
        commission_type: 'PERCENTAGE' as 'PERCENTAGE' | 'SUBSCRIPTION',
        commission_percentage: 15,
        monthly_subscription_fee: 0,
        status: 'ACTIVE',
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });

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
        post('/admin/restaurants');
    };

    const inputCls = "w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition";
    const labelCls = "block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5";

    return (
        <>
            <Head title="إضافة مطعم شريك — فطرنا" />
            <div className="max-w-3xl space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/restaurants"
                        className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-orange-600 transition shadow-xs"
                        title="العودة للمطاعم"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white">إضافة مطعم شريك جديد</h1>
                        <p className="text-xs text-stone-400 mt-0.5">أدخل بيانات المطعم وحدد نوع الاتفاق المالي</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Restaurant Basic Info ── */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Store className="w-4 h-4 text-orange-500" />
                            بيانات المطعم الأساسية
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelCls}>اسم المطعم *</label>
                                <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)} placeholder="مثال: مطعم الأصالة السوري" className={inputCls} />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>الوصف</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} placeholder="وصف مختصر للمطعم وأشهر وجباته..." className={`${inputCls} resize-none`} />
                            </div>
                            <div>
                                <label className={labelCls}>رقم الهاتف *</label>
                                <input type="text" required value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="01xxxxxxxxx" className={inputCls} />
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>رقم الواتساب</label>
                                <input type="text" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} placeholder="01xxxxxxxxx" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>البريد الإلكتروني للفرع</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="branch@restaurant.com" className={inputCls} />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>خصم الطلاب (%)</label>
                                <input type="number" min="0" max="100" step="1" value={data.student_discount_percentage} onChange={e => setData('student_discount_percentage', parseFloat(e.target.value) || 0)} className={inputCls} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>العنوان بالتفصيل *</label>
                                <input type="text" required value={data.address} onChange={e => setData('address', e.target.value)} placeholder="الحي الأول، برج العرب الجديدة، بجوار الجامعة" className={inputCls} />
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-bold">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ── Owner Account ── */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-orange-500" />
                            بيانات حساب مالك المطعم (تسجيل الدخول)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>اسم المالك *</label>
                                <input type="text" required value={data.owner_name} onChange={e => setData('owner_name', e.target.value)} placeholder="أحمد محمد" className={inputCls} />
                                {errors.owner_name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.owner_name}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>البريد الإلكتروني للدخول *</label>
                                <input type="email" required value={data.owner_email} onChange={e => setData('owner_email', e.target.value)} placeholder="owner@restaurant.com" className={inputCls} />
                                {errors.owner_email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.owner_email}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>كلمة المرور *</label>
                                <input type="password" required value={data.owner_password} onChange={e => setData('owner_password', e.target.value)} placeholder="••••••••" className={inputCls} />
                                {errors.owner_password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.owner_password}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ── Hours & Delivery ── */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-orange-500" />
                            مواعيد العمل وإعدادات التوصيل
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
                            <input type="number" step="0.5" value={data.delivery_fee} onChange={e => setData('delivery_fee', e.target.value)} placeholder="10.00" className={`${inputCls} max-w-xs`} />
                            <p className="text-[11px] text-stone-400 mt-1">رسوم توصيل ثابتة تُضاف على كل طلب</p>
                        </div>
                    </div>

                    {/* ── Financial Agreement ── */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-5">
                        <div>
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-orange-500" />
                                الاتفاق المالي مع المطعم
                            </h2>
                            <p className="text-xs text-stone-400 mt-1">
                                حدد طريقة الاتفاق المالي — إما عمولة على كل طلب أو اشتراك شهري ثابت. سيتم إصدار فاتورة تلقائياً في بداية كل شهر.
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
                                <p className="text-[11px] text-orange-600/70 mt-2">ستُصدر فاتورة شهرية تلقائياً بإجمالي العمولات المستحقة</p>
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
                                <p className="text-[11px] text-blue-600/70 mt-2">ستُصدر فاتورة اشتراك تلقائياً في بداية كل شهر</p>
                                {errors.monthly_subscription_fee && <p className="text-red-500 text-xs mt-1 font-bold">{errors.monthly_subscription_fee}</p>}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/admin/restaurants" className="px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-xs transition">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs shadow-md transition disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'جاري الحفظ...' : 'إنشاء المطعم وتفعيل الحساب'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
