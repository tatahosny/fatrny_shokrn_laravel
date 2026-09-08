import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <GuestLayout>
            <Head title="تواصل معنا والدعم الفني — فطرنا شكراً" />

            <div className="bg-gradient-to-b from-stone-100 to-white dark:from-stone-900 dark:to-stone-950 py-12 border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-orange-600 dark:text-orange-400 tracking-wider mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>فريق الدعم الفني وخدمة العملاء</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
                        نحن هنا لمساعدتك في أي وقت
                    </h1>
                    <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto mt-2">
                        لديك استفسار حول طلبك، تريد انضمام مطعمك، أو تواجه مشكلة في توثيق كارنيه الطالب؟ تواصل معنا مباشرة.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Contact Info cards */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">المقر الرئيسي</h3>
                                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                    مدينة برج العرب الجديدة — بجوار مجمع الجامعات، الإسكندرية
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">الهاتف وواتساب</h3>
                                <p className="text-xs font-mono text-stone-600 dark:text-stone-400 leading-relaxed" dir="ltr">
                                    010-9988-7766<br />011-2233-4455
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">ساعات العمل والتوصيل</h3>
                                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                    يومياً من 6:00 صباحاً حتى 2:00 بعد منتصف الليل على مدار الأسبوع
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2">
                                    تم استلام رسالتك بنجاح!
                                </h3>
                                <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                                    شكراً لتواصلك معنا، سيقوم فريق خدمة عملاء فطرنا شكراً بمراجعة رسالتك والرد عليك عبر الهاتف أو الواتساب في أقرب وقت.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h2 className="text-xl font-black text-stone-900 dark:text-white mb-4">
                                    أرسل استفسارك أو طلبك
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                            الاسم بالكامل
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                            placeholder="أحمد محمد"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                            رقم الهاتف أو الواتساب
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                            placeholder="010xxxxxxxx"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                        موضوع الرسالة
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                        placeholder="استفسار، طلب انضمام مطعم، مشكلة في توثيق الكارنيه..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                        نص الرسالة
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                        placeholder="اكتب تفاصيل استفسارك هنا..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>إرسال الرسالة الآن</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
