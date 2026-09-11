import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save, Globe, Phone, Mail, MapPin, GraduationCap, Settings2 } from 'lucide-react';

interface Props {
    settings: Record<string, string>;
}

export default function AdminCmsIndex({ settings }: Props) {
    const { data, setData, put, processing, wasSuccessful } = useForm({
        platform_name_ar: settings.platform_name_ar ?? '',
        platform_name_en: settings.platform_name_en ?? '',
        hero_title: settings.hero_title ?? '',
        hero_subtitle: settings.hero_subtitle ?? '',
        city_badge: settings.city_badge ?? '',
        student_banner_title: settings.student_banner_title ?? '',
        contact_phone: settings.contact_phone ?? '',
        contact_whatsapp: settings.contact_whatsapp ?? '',
        contact_email: settings.contact_email ?? '',
        footer_description: settings.footer_description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/cms');
    };

    const Field = ({ label, id, value, onChange, multi = false, placeholder = '' }: any) => (
        <div>
            <label className="block text-sm text-stone-400 mb-1">{label}</label>
            {multi ? (
                <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm" />
            ) : (
                <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors text-sm" />
            )}
        </div>
    );

    return (
        <Head title="إدارة محتوى الصفحة الرئيسية" />

            <div className="max-w-3xl space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">إدارة محتوى الصفحة الرئيسية</h1>
                        <p className="text-stone-400 text-sm mt-1">تحكم في نصوص وبيانات Landing Page</p>
                    </div>
                    {wasSuccessful && (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm">
                            ✓ تم الحفظ
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Platform Identity */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-orange-400" />
                            هوية المنصة
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="اسم المنصة (عربي)" id="platform_name_ar" value={data.platform_name_ar}
                                onChange={(v: string) => setData('platform_name_ar', v)} placeholder="فطرنا شكراً" />
                            <Field label="اسم المنصة (إنجليزي)" id="platform_name_en" value={data.platform_name_en}
                                onChange={(v: string) => setData('platform_name_en', v)} placeholder="Fatrna Shokran" />
                        </div>
                        <Field label="شارة المدينة" id="city_badge" value={data.city_badge}
                            onChange={(v: string) => setData('city_badge', v)} placeholder="برج العرب والإسكندرية" />
                    </div>

                    {/* Hero Section */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-indigo-400" />
                            قسم Hero
                        </h2>
                        <Field label="عنوان Hero الرئيسي" id="hero_title" value={data.hero_title}
                            onChange={(v: string) => setData('hero_title', v)} placeholder="أسرع وألذ فطار وغدا وعشا في برج العرب" />
                        <Field label="نص Hero الفرعي" id="hero_subtitle" value={data.hero_subtitle}
                            onChange={(v: string) => setData('hero_subtitle', v)} multi
                            placeholder="اطلب من مطاعم برج العرب المفضلة..." />
                        <Field label="شعار طلاب الجامعة" id="student_banner_title" value={data.student_banner_title}
                            onChange={(v: string) => setData('student_banner_title', v)} placeholder="خصومات خاصة لطلاب جامعة برج العرب التكنولوجية" />
                    </div>

                    {/* Contact */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Phone className="w-5 h-5 text-emerald-400" />
                            معلومات الاتصال
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="رقم الهاتف" id="contact_phone" value={data.contact_phone}
                                onChange={(v: string) => setData('contact_phone', v)} placeholder="01000000000" />
                            <Field label="واتساب" id="contact_whatsapp" value={data.contact_whatsapp}
                                onChange={(v: string) => setData('contact_whatsapp', v)} placeholder="201000000000" />
                            <Field label="البريد الإلكتروني" id="contact_email" value={data.contact_email}
                                onChange={(v: string) => setData('contact_email', v)} placeholder="support@fatrna-shokran.com" />
                        </div>
                        <Field label="وصف الفوتر" id="footer_description" value={data.footer_description}
                            onChange={(v: string) => setData('footer_description', v)} multi
                            placeholder="منصة فطرنا شكراً — توصيل الطعام الأسرع في برج العرب" />
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
    );
}
