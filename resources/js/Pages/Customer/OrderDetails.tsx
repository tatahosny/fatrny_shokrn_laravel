import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import CustomerLiveTrackingMap from '../../Components/CustomerLiveTrackingMap';
import { Order, OrderStatus } from '../../Types';
import { 
    Clock, 
    Bike, 
    Store, 
    MapPin, 
    Phone, 
    CheckCircle2, 
    FileText, 
    GraduationCap, 
    ArrowRight,
    Sparkles,
    Flame,
    PackageCheck,
    Navigation,
    UtensilsCrossed,
    Copy,
    Check,
    Printer,
    RefreshCw,
    ShieldCheck,
    CreditCard,
    AlertTriangle,
    Calendar,
    ChevronDown,
    ChevronUp,
    Info
} from 'lucide-react';

interface OrderDetailsProps {
    order: Order;
}

interface StepInfo {
    key: OrderStatus;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgLight: string;
    activeText: string;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
    const [copied, setCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const driver = order.delivery_driver || order.deliveryDriver;

    const steps: StepInfo[] = [
        { 
            key: 'PENDING', 
            label: 'استلام الطلب', 
            sublabel: 'تم إرسال طلبك وبانتظار قبول المطعم', 
            icon: Clock,
            accentColor: 'from-amber-500 to-orange-500',
            bgLight: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            activeText: 'طلبك قيد المراجعة لدى المطعم حالياً'
        },
        { 
            key: 'CONFIRMED', 
            label: 'تم التأكيد', 
            sublabel: 'المطعم وافق وبدأ جدول التجهيز', 
            icon: CheckCircle2,
            accentColor: 'from-blue-500 to-indigo-500',
            bgLight: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            activeText: 'تم تأكيد طلبك بنجاح وجارٍ إسناده للمطبخ'
        },
        { 
            key: 'PREPARING', 
            label: 'جاري التحضير', 
            sublabel: 'الشيف يقوم بطهي وتجهيز وجبتك طازجة', 
            icon: Flame,
            accentColor: 'from-orange-500 to-red-500',
            bgLight: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
            activeText: 'وجبتك الآن على النار ويتم إعدادها بعناية'
        },
        { 
            key: 'READY_FOR_PICKUP', 
            label: 'جاهز للاستلام', 
            sublabel: 'الوجبة مغلفة وساخنة بانتظار الطيار', 
            icon: PackageCheck,
            accentColor: 'from-purple-500 to-indigo-600',
            bgLight: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
            activeText: 'تم الانتهاء من التجهيز والوجبة بانتظار استلام الطيار'
        },
        { 
            key: 'OUT_FOR_DELIVERY', 
            label: 'في الطريق إليك', 
            sublabel: 'كابتن التوصيل استلم الطلب ومتجه لعنوانك', 
            icon: Bike,
            accentColor: 'from-teal-500 to-emerald-600',
            bgLight: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
            activeText: 'الكابتن يقود دراجته باتجاه موقعك الآن'
        },
        { 
            key: 'DELIVERED', 
            label: 'تم الاستلام', 
            sublabel: 'ألف هنا وشفاء! نتمنى لك إفطاراً رائعاً', 
            icon: Sparkles,
            accentColor: 'from-emerald-500 to-green-600',
            bgLight: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            activeText: 'تم تسليم الوجبة بنجاح وبالهناء والشفاء'
        },
    ];

    // Status mapping index
    const statusOrderMap: Record<string, number> = {
        PENDING: 0,
        CONFIRMED: 1,
        PREPARING: 2,
        READY_FOR_PICKUP: 3,
        ASSIGNED_TO_DRIVER: 4,
        OUT_FOR_DELIVERY: 4,
        DELIVERED: 5,
    };

    const currentStepIndex = statusOrderMap[order.status] ?? 0;
    const currentStepObj = steps[currentStepIndex] || steps[0];
    const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED' || order.status === 'FAILED';

    const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(order.order_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusBadge = (status: string) => {
        const map: { [key: string]: { label: string; bg: string; text: string; dot: string } } = {
            PENDING: { label: 'قيد الانتظار', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
            CONFIRMED: { label: 'تم التأكيد', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' },
            PREPARING: { label: 'المطعم يجهز الوجبة', bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
            READY_FOR_PICKUP: { label: 'جاهز للاستلام', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', dot: 'bg-purple-500' },
            ASSIGNED_TO_DRIVER: { label: 'تم تعيين الطيار', bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-800 dark:text-indigo-300', dot: 'bg-indigo-500' },
            OUT_FOR_DELIVERY: { label: 'الطيار في الطريق إليك', bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-800 dark:text-teal-300', dot: 'bg-teal-500' },
            DELIVERED: { label: 'تم التوصيل بنجاح', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
            CANCELLED: { label: 'طلب ملغي', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500' },
            REJECTED: { label: 'تم رفض الطلب', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', dot: 'bg-rose-500' },
        };
        const s = map[status] || { label: status, bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-400' };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-xs ${s.bg} ${s.text}`}>
                <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`}></span>
                <span>{s.label}</span>
            </span>
        );
    };

    const renderItemOptionsAndAddons = (item: any) => {
        const optionsList = Array.isArray(item.selected_options) ? item.selected_options : [];
        const addonsList = Array.isArray(item.selected_addons) ? item.selected_addons : [];

        if (optionsList.length === 0 && addonsList.length === 0) return null;

        return (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {optionsList.map((opt: any, i: number) => {
                    const optName = opt.optionName || opt.option_name || 'خيار';
                    const valName = opt.valueName || opt.value_name || (typeof opt === 'string' ? opt : '');
                    const price = Number(opt.price || 0);
                    return (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700">
                            <span>{optName}: {valName}</span>
                            {price > 0 && <span className="text-orange-600 font-bold">+{price} ج.م</span>}
                        </span>
                    );
                })}
                {addonsList.map((addon: any, i: number) => {
                    const name = addon.name || (typeof addon === 'string' ? addon : 'إضافة');
                    const price = Number(addon.price || 0);
                    return (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[11px] font-semibold text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40">
                            <span>+ {name}</span>
                            {price > 0 && <span className="font-bold">({price} ج.م)</span>}
                        </span>
                    );
                })}
            </div>
        );
    };

    const progressPercentage = isCancelled ? 0 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

    return (
        <CustomerLayout title={`تفاصيل الطلب ${order.order_number}`}>
            <Head title={`تفاصيل الطلب ${order.order_number} — فطرنا شكراً`} />

            <div className="space-y-8 max-w-6xl mx-auto">
                
                {/* 1. Header Order Banner Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 text-white p-6 sm:p-8 shadow-xl border border-stone-800">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 text-stone-300 tracking-wider">
                                    طلب رقم
                                </span>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                                        {order.order_number}
                                    </h1>
                                    <button
                                        onClick={handleCopyOrderNumber}
                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition"
                                        title="نسخ رقم الطلب"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                                    <span>{new Date(order.created_at).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}</span>
                                </span>
                                {order.restaurant && (
                                    <span className="flex items-center gap-1.5">
                                        <Store className="w-3.5 h-3.5 text-amber-400" />
                                        <span>مطعم: <strong className="text-stone-200">{order.restaurant.name}</strong></span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Top Action buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                                onClick={handlePrint}
                                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 transition flex items-center gap-1.5"
                            >
                                <Printer className="w-4 h-4" />
                                <span>طباعة الفاتورة</span>
                            </button>
                            <Link
                                href="/customer/orders"
                                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-md shadow-orange-600/30 transition flex items-center gap-1.5"
                            >
                                <span>سجل الطلبات</span>
                                <ArrowRight className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Cancellation Notice if cancelled */}
                {isCancelled && (
                    <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 shadow-sm flex items-start gap-4 animate-fade-in">
                        <div className="p-3 rounded-2xl bg-red-500 text-white shadow-md shadow-red-500/20 shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-sm text-red-900 dark:text-red-200">
                                تم إلغاء هذا الطلب
                            </h3>
                            <p className="text-xs text-red-700 dark:text-red-300">
                                تم إلغاء الطلب من قبل الإدارة أو المطعم. يمكنك تقديم طلب جديد في أي وقت من قائمة المطاعم المتاحة.
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/restaurants"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                                >
                                    <span>تصفح المطاعم واطلب وجبة أخرى</span>
                                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Dynamic Visual Progress & Workflow Tracker (المراحل وخطوات العمل) */}
                {!isCancelled && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
                        
                        {/* Tracker Title & Active Stage Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                                    <span>مراحل تجهيز وتوصيل طلبك المباشرة</span>
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    متابعة حية من لحظة قبول الأوردر حتى وصوله لباب منزلك أو سكنك
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-xs text-stone-500 font-semibold">
                                    نسبة الإنجاز: <strong className="text-orange-600">{progressPercentage}%</strong>
                                </div>
                                <div className="w-24 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700 ease-out rounded-full"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Steps Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                const isPassed = currentStepIndex > idx;
                                const isCurrent = currentStepIndex === idx;
                                const isUpcoming = currentStepIndex < idx;

                                return (
                                    <div
                                        key={step.key}
                                        className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                                            isCurrent
                                                ? 'bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent border-orange-500 dark:border-orange-500/80 shadow-lg shadow-orange-500/10 scale-[1.03] z-10 ring-2 ring-orange-500/20'
                                                : isPassed
                                                ? 'bg-stone-50/70 dark:bg-stone-800/40 border-emerald-500/30 text-stone-700 dark:text-stone-300'
                                                : 'bg-stone-50/40 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/60 opacity-60'
                                        }`}
                                    >
                                        {/* Step indicator tag */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                                                isPassed 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : isCurrent 
                                                    ? 'bg-orange-600 text-white animate-bounce' 
                                                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                                            }`}>
                                                {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                                            </span>

                                            {isCurrent && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-1.5 py-0.5 rounded-md animate-pulse">
                                                    الآن
                                                </span>
                                            )}
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-xs transition-transform ${
                                            isCurrent
                                                ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-110'
                                                : isPassed
                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                                        }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Text content */}
                                        <div className="space-y-1">
                                            <h3 className={`text-xs font-black leading-tight ${
                                                isCurrent 
                                                    ? 'text-orange-600 dark:text-orange-400 text-sm' 
                                                    : isPassed 
                                                    ? 'text-stone-900 dark:text-white' 
                                                    : 'text-stone-500'
                                            }`}>
                                                {step.label}
                                            </h3>
                                            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug line-clamp-2">
                                                {step.sublabel}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current Active Step Highlight Callout */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 dark:from-stone-800/90 dark:via-stone-800/60 dark:to-stone-800/90 border border-orange-200 dark:border-orange-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-orange-600/20">
                                    {React.createElement(currentStepObj.icon, { className: 'w-5 h-5' })}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                                            المرحلة الحالية للطلب:
                                        </span>
                                        <span className="text-xs font-black text-stone-900 dark:text-white">
                                            {currentStepObj.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                                        {currentStepObj.activeText}
                                    </p>
                                </div>
                            </div>

                            {/* Status Histories Toggle */}
                            {order.statusHistories && order.statusHistories.length > 0 && (
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl bg-orange-100/70 dark:bg-orange-950/60 transition"
                                >
                                    <span>سجل الأحداث ({order.statusHistories.length})</span>
                                    {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>

                        {/* Collapsible History Events Timeline */}
                        {showHistory && order.statusHistories && order.statusHistories.length > 0 && (
                            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60 space-y-3 animate-fade-in">
                                <h4 className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>السجل الزمني لتحديثات الطلب:</span>
                                </h4>
                                <div className="space-y-2.5 pt-2">
                                    {order.statusHistories.map((history) => (
                                        <div key={history.id} className="flex items-start gap-3 text-xs">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-stone-800 dark:text-stone-200">
                                                        {history.status}
                                                    </span>
                                                    <span className="text-[11px] text-stone-400">
                                                        {new Date(history.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {history.notes && (
                                                    <p className="text-[11px] text-stone-500 mt-0.5">{history.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Driver Contact Alert Banner (if driver assigned) */}
                {driver && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                                <Bike className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-emerald-200">
                                        كابتن التوصيل المكلف بالطلب:
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-black">
                                        {order.status === 'OUT_FOR_DELIVERY' ? 'في الطريق إليك' : 'تم التعيين'}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-white mt-0.5">
                                    {driver.name}
                                </h3>
                                <p className="text-xs text-emerald-100 mt-0.5 flex items-center gap-1.5">
                                    <span>رقم هاتف الكابتن:</span>
                                    <span className="font-mono font-bold text-white text-sm bg-black/20 px-2 py-0.5 rounded-md">
                                        {driver.phone}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <a
                                href={`tel:${driver.phone || ''}`}
                                className="px-4 py-2.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs shadow-md transition flex items-center gap-2 active:scale-95"
                            >
                                <Phone className="w-4 h-4 text-emerald-600" />
                                <span>اتصال بالكابتن</span>
                            </a>
                            <a
                                href={`https://wa.me/2${(driver.phone || '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-1.5 active:scale-95"
                            >
                                <span>واتساب</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* Live Driver Tracking Map on Customer Screen */}
                {driver && ['ASSIGNED_TO_DRIVER', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                    <CustomerLiveTrackingMap
                        orderNumber={order.order_number}
                        customerLat={order.latitude ? Number(order.latitude) : null}
                        customerLng={order.longitude ? Number(order.longitude) : null}
                        customerAddress={order.address}
                        restaurantLat={order.restaurant?.latitude ? Number(order.restaurant.latitude) : null}
                        restaurantLng={order.restaurant?.longitude ? Number(order.restaurant.longitude) : null}
                        restaurantName={order.restaurant?.name || 'المطعم'}
                        initialDriverLat={driver.current_latitude ? Number(driver.current_latitude) : null}
                        initialDriverLng={driver.current_longitude ? Number(driver.current_longitude) : null}
                        driverName={driver.name}
                        driverPhone={driver.phone}
                        orderStatus={order.status}
                    />
                )}

                {/* 4. Two Columns Layout: Items & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left 2 Columns: Items breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Food Items List */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold">
                                        <UtensilsCrossed className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-stone-900 dark:text-white">
                                            أصناف الوجبات المطلوبة
                                        </h2>
                                        <p className="text-xs text-stone-400">
                                            إجمالي {order.items?.length || 0} أصناف مختلفة
                                        </p>
                                    </div>
                                </div>

                                {order.restaurant && (
                                    <div className="text-left">
                                        <span className="text-[10px] text-stone-400 block">المطعم المصدر</span>
                                        <span className="text-xs font-bold text-orange-600">{order.restaurant.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="py-4.5 flex items-start justify-between gap-4">
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xs shrink-0 border border-orange-200/50 dark:border-orange-900/40">
                                                    {item.quantity}×
                                                </span>
                                                <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                                                    {item.name}
                                                </span>
                                            </div>

                                            {/* Formatted options and addons */}
                                            {renderItemOptionsAndAddons(item)}

                                            {/* Item special notes */}
                                            {item.notes && (
                                                <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg inline-block border border-amber-200/60 dark:border-amber-900/40 mt-1">
                                                    ملاحظة: {item.notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-left shrink-0">
                                            <span className="font-black text-sm text-stone-900 dark:text-white block">
                                                {Number(item.total_price).toFixed(2)} ج.م
                                            </span>
                                            <span className="text-[10px] text-stone-400">
                                                ({Number(item.unit_price).toFixed(2)} للقطعة)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Location & Special Notes Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                <span>وجهة التوصيل والملاحظات</span>
                            </h3>

                            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 space-y-2.5">
                                <div>
                                    <span className="text-[11px] font-bold text-stone-400 block mb-0.5">
                                        عنوان التوصيل المحدد في برج العرب:
                                    </span>
                                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                                        {order.address || 'عنوان العميل الافتراضي'}
                                    </p>
                                </div>

                                {order.customer_notes && (
                                    <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700">
                                        <span className="text-[11px] font-bold text-stone-400 block mb-0.5">
                                            ملاحظات خاصة للكابتن أو المطعم:
                                        </span>
                                        <p className="text-xs italic text-stone-600 dark:text-stone-300">
                                            "{order.customer_notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Captain, Restaurant, Invoice */}
                    <div className="space-y-6">
                        
                        {/* Assigned Driver Card if exists */}
                        {driver ? (
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 shadow-sm space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                                        <Bike className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                            كابتن التوصيل المكلف
                                        </span>
                                        <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">
                                            {driver.name}
                                        </h4>
                                        <span className="text-[10px] text-stone-400">
                                            جاهز لتوصيل طلبك ساخناً
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                                    <span className="text-[10px] font-bold text-stone-400 block">رقم هاتف الكابتن:</span>
                                    <span className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono tracking-wider block">
                                        {driver.phone}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <a
                                        href={`tel:${driver.phone || ''}`}
                                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 active:scale-98"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>اتصال بالكابتن</span>
                                    </a>
                                    <a
                                        href={`https://wa.me/2${(driver.phone || '').replace(/^0/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-black transition flex items-center justify-center gap-1.5"
                                    >
                                        <span>واتساب الكابتن</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-500 flex items-center justify-center">
                                    <Bike className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-stone-900 dark:text-white">كابتن التوصيل</h4>
                                    <p className="text-[11px] text-stone-400">سيتم تعيين أقرب كابتن فور اكتمال التجهيز</p>
                                </div>
                            </div>
                        )}

                        {/* Restaurant Contact Card */}
                        {order.restaurant && (
                            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-stone-900 dark:text-white truncate">
                                            {order.restaurant.name}
                                        </h4>
                                        <p className="text-[10px] text-stone-400 truncate">
                                            {order.restaurant.address || 'برج العرب التكنولوجية'}
                                        </p>
                                    </div>
                                </div>

                                {order.restaurant.phone && (
                                    <a
                                        href={`tel:${order.restaurant.phone}`}
                                        className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                                        <span>الاتصال بالمطعم: {order.restaurant.phone}</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Financial Invoice Breakdown */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5 text-xs">
                            <h3 className="text-base font-black text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                <span>الفاتورة والحساب</span>
                                <CreditCard className="w-4 h-4 text-stone-400" />
                            </h3>

                            <div className="flex items-center justify-between text-stone-500">
                                <span>المجموع الفرعي للأصناف</span>
                                <span className="font-bold text-stone-800 dark:text-stone-200">{Number(order.subtotal).toFixed(2)} ج.م</span>
                            </div>

                            {Number(order.student_discount_amount) > 0 && (
                                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40">
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="w-4 h-4" />
                                        خصم الطلاب (BATU)
                                    </span>
                                    <span>-{Number(order.student_discount_amount).toFixed(2)} ج.م</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-stone-500">
                                <span>رسوم التوصيل</span>
                                <span className="font-bold text-stone-800 dark:text-stone-200">{Number(order.delivery_fee).toFixed(2)} ج.م</span>
                            </div>

                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                <span className="text-sm font-black text-stone-900 dark:text-white">المبلغ المطلوب سداده</span>
                                <div className="text-left">
                                    <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                                        {Number(order.total_amount).toFixed(2)}
                                    </span>
                                    <span className="text-xs font-bold text-stone-500 mr-1">ج.م</span>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>الدفع نقداً للكابتن عند الاستلام (Cash on Delivery)</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </CustomerLayout>
    );
}
