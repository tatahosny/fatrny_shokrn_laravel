import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save, Settings, Globe, Mail, Phone, CreditCard, Clock } from 'lucide-react';

interface Props {
    settings: Record<string, string>;
}

export default function AdminSettingsIndex({ settings }: Props) {
    const { data, setData, put, processing, wasSuccessful } = useForm({
        app_name: settings.app_name ?? 'فطرنا شكراً',
        app_tagline: settings.app_tagline ?? '',
        support_email: settings.support_email ?? '',
        support_phone: settings.support_phone ?? '',
        default_commission_rate: settings.default_commission_rate ?? '15',
        default_tax_rate: settings.default_tax_rate ?? '14',
        default_delivery_fee: settings.default_delivery_fee ?? '10.00',
        order_auto_cancel_minutes: settings.order_auto_cancel_minutes ?? '30',
        maintenance_mode: settings.maintenance_mode ?? '0',
        allow_registrations: settings.allow_registrations ?? '1',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings');
    };

    const Field = ({ label, id, value, onChange, type = 'text', placeholder = '' }: any) => (
        <div>
            <label htmlFor={id} className="block text-sm text-stone-400 mb-1">{label}</label>
            <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors text-sm" />
        </div>
    );

    const Toggle = ({ label, id, value, onChange, description }: any) => (
        <div className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
            <div>
                <label htmlFor={id} className="text-white text-sm font-medium cursor-pointer">{label}</label>
                {description && <p className="text-stone-400 text-xs mt-0.5">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(value === '1' ? '0' : '1')}
                id={id}
                className={`relative w-11 h-6 rounded-full transition-colors ${value === '1' ? 'bg-orange-500' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value === '1' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );

    return (
        <Head title="إعدادات النظام" />

            <div className="max-w-3xl space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Settings className="w-6 h-6 text-orange-400" />
                            إعدادات النظام
                        </h1>
                        <p className="text-stone-400 text-sm mt-1">الإعدادات العامة للمنصة</p>
                    </div>
                    {wasSuccessful && (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm">✓ تم الحفظ</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-orange-400" />
                            الإعدادات العامة
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="اسم التطبيق" id="app_name" value={data.app_name} onChange={(v: string) => setData('app_name', v)} />
                            <Field label="الشعار (Tagline)" id="app_tagline" value={data.app_tagline} onChange={(v: string) => setData('app_tagline', v)} />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Mail className="w-5 h-5 text-indigo-400" />
                            معلومات الدعم
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="بريد الدعم" id="support_email" value={data.support_email} type="email"
                                onChange={(v: string) => setData('support_email', v)} placeholder="support@fatrna-shokran.com" />
                            <Field label="هاتف الدعم" id="support_phone" value={data.support_phone}
                                onChange={(v: string) => setData('support_phone', v)} placeholder="01000000000" />
                        </div>
                    </div>

                    {/* Defaults */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                            الإعدادات المالية الافتراضية
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <Field label="نسبة العمولة الافتراضية (%)" id="default_commission_rate" type="number"
                                value={data.default_commission_rate} onChange={(v: string) => setData('default_commission_rate', v)} />
                            <Field label="نسبة الضريبة الافتراضية (%)" id="default_tax_rate" type="number"
                                value={data.default_tax_rate} onChange={(v: string) => setData('default_tax_rate', v)} />
                            <Field label="رسوم التوصيل الافتراضية (ج.م)" id="default_delivery_fee" type="number"
                                value={data.default_delivery_fee} onChange={(v: string) => setData('default_delivery_fee', v)} />
                        </div>
                    </div>

                    {/* Order Settings */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            إعدادات الطلبات
                        </h2>
                        <Field label="مدة إلغاء الطلب تلقائياً (دقيقة)" id="order_auto_cancel_minutes" type="number"
                            value={data.order_auto_cancel_minutes} onChange={(v: string) => setData('order_auto_cancel_minutes', v)} />
                    </div>

                    {/* Toggles */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">خيارات النظام</h2>
                        <Toggle label="وضع الصيانة" id="maintenance_mode" value={data.maintenance_mode}
                            onChange={(v: string) => setData('maintenance_mode', v)}
                            description="تعطيل الموقع مؤقتاً للصيانة" />
                        <Toggle label="السماح بالتسجيل" id="allow_registrations" value={data.allow_registrations}
                            onChange={(v: string) => setData('allow_registrations', v)}
                            description="السماح للعملاء الجدد بإنشاء حسابات" />
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                        </button>
                    </div>
                </form>
            </div>
    );
}
