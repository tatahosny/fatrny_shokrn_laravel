import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ShieldAlert,
    PhoneCall,
    MessageCircle,
    Copy,
    Check,
    LogOut,
    Bike,
    Building2,
    Clock,
    AlertTriangle
} from 'lucide-react';

interface DeliverySuspendedProps {
    driver: {
        id: number;
        name: string;
        phone: string;
    };
    restaurant?: {
        id: number;
        name: string;
    } | null;
    supportPhone: string;
}

export default function Suspended({ driver, restaurant, supportPhone = '01027961208' }: DeliverySuspendedProps) {
    const [copied, setCopied] = useState(false);

    const copyPhone = () => {
        navigator.clipboard.writeText(supportPhone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cleanPhone = supportPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/2${cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone}?text=${encodeURIComponent(
        `مرحباً، أنا الكابتن: ${driver?.name || ''}، أستفسر عن موعد إعادة تفعيل حساب مطعم: ${restaurant?.name || ''}`
    )}`;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6" dir="rtl">
            <Head title="الحساب موقوف مؤقتاً — بوابة التوصيل" />

            {/* Header */}
            <div className="max-w-xl mx-auto w-full flex items-center justify-between py-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black">
                        <Bike className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-black text-sm text-white block">فطرني شكراً — كابتن التوصيل</span>
                        <span className="text-[11px] text-stone-400">بوابة الطيارين والمناديب</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-400 text-xs font-bold border border-stone-800 transition flex items-center gap-1.5"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                </button>
            </div>

            {/* Center Content Box */}
            <div className="max-w-lg mx-auto w-full my-auto py-8">
                <div className="bg-stone-900/90 rounded-3xl border border-red-500/30 p-6 sm:p-8 shadow-2xl shadow-red-950/50 backdrop-blur-xl space-y-6 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-xl shadow-red-600/20">
                        <div className="w-full h-full bg-stone-900 rounded-[22px] flex items-center justify-center">
                            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-black border border-red-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>توقف مؤقت للخدمة</span>
                        </span>
                        <h1 className="text-2xl font-black text-white">
                            حساب المطعم موقوف مؤقتاً
                        </h1>
                        <p className="text-xs text-stone-400 leading-relaxed max-w-md mx-auto">
                            تم إيقاف حساب المطعم التابع له{' '}
                            <strong className="text-orange-400 font-bold">({restaurant?.name || 'مطعمك'})</strong> مؤقتاً من قِبل إدارة المنصة لعدم سداد المستحقات الشهرية.
                        </p>
                    </div>

                    {/* Driver Status Notice */}
                    <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 text-right text-xs space-y-2">
                        <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">اسم الكابتن:</span>
                            <span className="font-bold text-white">{driver?.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-300">
                            <span className="text-stone-400">المطعم التابع له:</span>
                            <span className="font-bold text-orange-400">{restaurant?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-300 pt-2 border-t border-stone-800/80">
                            <span className="text-stone-400">حالة التوصيل:</span>
                            <span className="font-black text-red-400 inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                معلق حتى تفعيل المطعم
                            </span>
                        </div>
                    </div>

                    {/* Support & Action */}
                    <div className="space-y-3 pt-2">
                        <p className="text-xs font-bold text-stone-300">
                            للمزيد من المعلومات أو لإبلاغ الإدارة بسداد المستحقات، تواصل مع الدعم الفني:
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>محادثة واتساب الدعم</span>
                            </a>

                            <a
                                href={`tel:${supportPhone}`}
                                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2 transition"
                            >
                                <PhoneCall className="w-4 h-4" />
                                <span>اتصال هاتفي</span>
                            </a>
                        </div>

                        <button
                            onClick={copyPhone}
                            className="w-full py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 font-mono text-xs font-bold border border-stone-800 transition flex items-center justify-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>رقم الدعم: <span dir="ltr">{supportPhone}</span></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="max-w-xl mx-auto w-full text-center py-4 text-[11px] text-stone-600 border-t border-stone-900">
                منصة فطرني شكراً — نظام إدارة وتشغيل التوصيل
            </div>
        </div>
    );
}
