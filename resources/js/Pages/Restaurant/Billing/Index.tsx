import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PaginatedResponse } from '../../../Types';
import {
    Receipt,
    AlertTriangle,
    CheckCircle2,
    Clock,
    PhoneCall,
    MessageCircle,
    Copy,
    Check,
    CreditCard,
    DollarSign,
    ShieldAlert,
    Calendar,
    HelpCircle,
    ExternalLink
} from 'lucide-react';

interface InvoiceItem {
    id: number;
    description: string;
    amount: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    paid_amount: number;
    status: 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    invoice_type: string;
    notes?: string;
    items?: InvoiceItem[];
}

interface RestaurantBillingProps {
    restaurant: {
        id: number;
        name: string;
        status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
        commission_type: string;
        commission_percentage?: number;
        monthly_subscription_fee?: number;
        billing_cycle: string;
        payment_due_date?: string;
        billing_suspended_at?: string;
        suspension_reason?: string;
    };
    invoices: PaginatedResponse<Invoice>;
    pendingInvoice?: Invoice | null;
    daysUntilDue?: number | null;
    totalPaid: number;
    supportPhone: string;
}

export default function Index({
    restaurant,
    invoices,
    pendingInvoice,
    daysUntilDue,
    totalPaid,
    supportPhone = '01027961208'
}: RestaurantBillingProps) {
    const items = invoices?.data || [];
    const [copied, setCopied] = useState(false);

    const isSuspended = restaurant.status === 'SUSPENDED';
    const isDueSoon = daysUntilDue !== null && daysUntilDue !== undefined && daysUntilDue >= 0 && daysUntilDue <= 5 && !isSuspended && pendingInvoice;
    const isPastDue = daysUntilDue !== null && daysUntilDue !== undefined && daysUntilDue < 0 && pendingInvoice;

    const copyPhone = () => {
        navigator.clipboard.writeText(supportPhone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cleanPhone = supportPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/2${cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone}?text=${encodeURIComponent(
        `مرحباً، أود الاستفسار بخصوص فواتير وتفعيل مطعم: ${restaurant.name}`
    )}`;

    return (
        <>
            <Head title="الفواتير والاشتراكات — بوابة المطعم — فطرنا" />
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* 1. SUSPENSION ALERT BANNER */}
                {isSuspended && (
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl shadow-red-500/20 border-2 border-red-400/30 animate-pulse">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className="p-3 bg-white/20 rounded-2xl shrink-0 backdrop-blur-sm">
                                    <ShieldAlert className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
                                        <span>تنبيه عاجل: تم إيقاف حساب المطعم مؤقتاً لعدم سداد المستحقات!</span>
                                    </h2>
                                    <p className="text-xs text-red-100 mt-1 leading-relaxed max-w-3xl">
                                        تم إيقاف ظهور مطعمك للعملاء على منصة فطرني شكراً وإيقاف حسابات كباتن التوصيل التابعين لك حتى إتمام سداد الفاتورة المستحقة.
                                        يرجى مراجعة المبلغ المطلوب أدناه والتواصل الفوري مع الدعم الفني لإعادة التنشيط.
                                    </p>
                                    {restaurant.suspension_reason && (
                                        <div className="mt-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl inline-block">
                                            السبب المسجل: {restaurant.suspension_reason}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>تواصل واتساب لتنشيط الحساب</span>
                                </a>
                                <a
                                    href={`tel:${supportPhone}`}
                                    className="px-4 py-3 rounded-2xl bg-white text-red-700 hover:bg-stone-100 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition"
                                >
                                    <PhoneCall className="w-4 h-4" />
                                    <span>اتصال</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. DUE SOON / PAST DUE WARNING BANNER */}
                {!isSuspended && isDueSoon && (
                    <div className="p-5 rounded-3xl bg-amber-500 text-stone-950 border border-amber-400 shadow-md flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-stone-950 shrink-0" />
                            <div>
                                <h3 className="text-sm font-black">تذكير بموعد سداد الفاتورة الشهرية</h3>
                                <p className="text-xs font-medium text-stone-900 mt-0.5">
                                    متبقي {daysUntilDue} أيام على موعد الاستحقاق ({restaurant.payment_due_date}). يرجى السداد لتجنب توقف الحساب المؤقت.
                                </p>
                            </div>
                        </div>
                        <div className="font-mono font-black text-sm bg-stone-950 text-amber-400 px-3 py-1.5 rounded-xl">
                            مستحق: {Number(pendingInvoice?.total_amount || 0).toLocaleString()} ج.م
                        </div>
                    </div>
                )}

                {/* 3. CONTRACT & FINANCIAL OVERVIEW CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: System Type */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-400 font-bold">نظام التعاقد</span>
                            <CreditCard className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="text-base font-black text-stone-900 dark:text-white">
                            {restaurant.commission_type === 'SUBSCRIPTION' || restaurant.commission_type === 'MONTHLY_SUBSCRIPTION' || (restaurant.monthly_subscription_fee && restaurant.monthly_subscription_fee > 0 && !restaurant.commission_percentage)
                                ? 'اشتراك شهري ثابت'
                                : restaurant.commission_type === 'PERCENTAGE'
                                ? `نسبة عمولة (%${restaurant.commission_percentage || 0})`
                                : 'حسب الاتفاق'}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                            {restaurant.commission_type === 'SUBSCRIPTION' || (restaurant.monthly_subscription_fee && restaurant.monthly_subscription_fee > 0)
                                ? `${Number(restaurant.monthly_subscription_fee).toLocaleString()} ج.م شهرياً (بدون عمولة على المبيعات)`
                                : 'نسبة مقتطعة من إجمالي مبيعات الطلبات'}
                        </p>
                    </div>

                    {/* Card 2: Account Status */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-400 font-bold">حالة الحساب</span>
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            {isSuspended ? (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    موقوف مؤقتاً
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    نشط ويعمل
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1.5">
                            {isSuspended ? 'يرجى سداد الفاتورة لإعادة التشغيل' : 'المطعم متاح للطلب على المنصة'}
                        </p>
                    </div>

                    {/* Card 3: Due Date */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-400 font-bold">موعد السداد القادم</span>
                            <Calendar className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="text-base font-black font-mono text-stone-900 dark:text-white">
                            {restaurant.payment_due_date ? restaurant.payment_due_date.split('T')[0] : 'غير محدد'}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                            {!pendingInvoice
                                ? `تم سداد اشتراك هذا الشهر بنجاح ✅ (التجديد القادم بعد ${typeof daysUntilDue === 'number' && daysUntilDue > 0 ? daysUntilDue : 30} يوم)`
                                : typeof daysUntilDue === 'number'
                                ? daysUntilDue > 0
                                    ? `متبقي ${daysUntilDue} يوم على الاستحقاق`
                                    : daysUntilDue === 0
                                    ? 'اليوم هو موعد الاستحقاق'
                                    : `متأخر منذ ${Math.abs(daysUntilDue)} يوم`
                                : 'دورة السداد: شهرية'}
                        </p>
                    </div>

                    {/* Card 4: Total Paid */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-400 font-bold">إجمالي المسدد سابقاً</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="text-base font-black text-stone-900 dark:text-white">
                            {Number(totalPaid).toLocaleString()} ج.م
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                            كل الفواتير السابقة المسددة
                        </p>
                    </div>
                </div>

                {/* 4. SUPPORT & PAYMENT ASSISTANCE CARD */}
                <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-6 border border-stone-800 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30 mb-1">
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>قسم التحصيل والدعم الفني</span>
                            </div>
                            <h3 className="text-base font-black">طرق السداد والدعم الفني للمطاعم</h3>
                            <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
                                يتم سداد المستحقات عبر المحافظ الإلكترونية (فودافون كاش / إنستاباي) أو التحويل البنكي.
                                بعد التحويل يرجى إرسال الإشعار لرقم الدعم الفني ليتم تأكيد التحصيل وتفعيل الحساب فورياً.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={copyPhone}
                                className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold flex items-center justify-center gap-2 border border-stone-700 transition"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                <span dir="ltr">{supportPhone}</span>
                            </button>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>واتساب الدعم</span>
                            </a>

                            <a
                                href={`tel:${supportPhone}`}
                                className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                            >
                                <PhoneCall className="w-4 h-4" />
                                <span>اتصال هاتفي</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 5. INVOICES TABLE */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-orange-500" />
                                <span>سجل الفواتير والمطالبات</span>
                            </h2>
                            <p className="text-xs text-stone-400 mt-0.5">
                                كافة الفواتير الشهرية الصادرة لمطعمك وتفاصيل سدادها
                            </p>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <Receipt className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا توجد فواتير مسجلة لمطعمك حتى الآن.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                        <th className="py-3 px-4">رقم الفاتورة</th>
                                        <th className="py-3 px-4">تاريخ الإصدار</th>
                                        <th className="py-3 px-4">النوع</th>
                                        <th className="py-3 px-4">المبلغ المستحق</th>
                                        <th className="py-3 px-4">تاريخ الاستحقاق</th>
                                        <th className="py-3 px-4">حالة السداد</th>
                                        <th className="py-3 px-4">ملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {items.map(inv => (
                                        <tr key={inv.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                            <td className="py-4 px-4 font-mono font-bold text-orange-600">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="py-4 px-4 text-stone-500 font-mono">
                                                {inv.issue_date ? inv.issue_date.split('T')[0] : '—'}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-stone-700 dark:text-stone-300">
                                                {inv.invoice_type === 'SUBSCRIPTION' ? 'اشتراك شهري' : 'عمولة مبيعات'}
                                            </td>
                                            <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                {Number(inv.total_amount).toLocaleString()} ج.م
                                            </td>
                                            <td className="py-4 px-4 font-mono text-stone-500">
                                                {inv.due_date ? inv.due_date.split('T')[0] : '—'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                                    inv.status === 'PAID'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : inv.status === 'OVERDUE'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                }`}>
                                                    {inv.status === 'PAID' ? 'تم السداد بنجاح ✅' : inv.status === 'OVERDUE' ? 'متأخرة عن السداد ⚠️' : 'بانتظار السداد'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-stone-400 text-[11px] max-w-xs truncate">
                                                {inv.notes || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
