import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, ShoppingBag, MapPin, Calendar, GraduationCap, CheckCircle, XCircle, Phone, CheckCircle2, AlertCircle, Eye, ZoomIn, X } from 'lucide-react';

interface Customer {
    id: number;
    university_name?: string;
    university_id_number?: string;
    university_id_card_image?: string;
    university_id_card_back_image?: string;
    student_status?: string;
    student_verified_at?: string;
    rejection_reason?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        is_active: boolean;
        created_at: string;
    };
    addresses: Array<{ id: number; label: string; address: string; is_default: boolean }>;
    orders: Array<{
        id: number;
        order_number: string;
        status: string;
        total_amount: number;
        created_at: string;
        restaurant: { name: string };
    }>;
}

interface Props {
    customer: Customer;
    recent_orders?: Array<any>;
}

export default function CustomerShow({ customer, recent_orders = [] }: Props) {
    const orders = customer.orders || recent_orders || [];
    const isApprovedStudent = customer.student_status === 'APPROVED';

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('صورة الكارنيه غير واضحة أو غير مطابقة');
    const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

    const handleVerify = () => {
        if (confirm('هل أنت متأكد من اعتماد هوية الطالب وتفعيل خصومات الطلاب له؟')) {
            router.post(`/admin/customers/${customer.id}/verify-student`);
        }
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/customers/${customer.id}/reject-student`, {
            rejection_reason: rejectionReason,
        }, {
            onSuccess: () => setIsRejectModalOpen(false),
        });
    };

    const formatImg = (path?: string) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    const frontImageSrc = formatImg(customer.university_id_card_image);
    const backImageSrc = formatImg(customer.university_id_card_back_image);

    return (
        <>
            <Head title={`${customer.user?.name || "عميل"} — إدارة العملاء — فطرنا`} />
            <div className="space-y-6" dir="rtl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/customers" className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-stone-900 dark:text-white">{customer.user.name}</h1>
                                {isApprovedStudent && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> طالب موثق
                                    </span>
                                )}
                                {customer.student_status === 'PENDING' && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold animate-pulse">
                                        <GraduationCap className="w-3.5 h-3.5" /> بانتظار مراجعة الكارنيه
                                    </span>
                                )}
                            </div>
                            <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 font-mono">{customer.user.email} | {customer.user.phone || 'بدون هاتف'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {customer.student_status !== 'APPROVED' && (
                            <button
                                onClick={handleVerify}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>قبول وتوثيق هوية الطالب</span>
                            </button>
                        )}
                        {customer.student_status !== 'REJECTED' && (
                            <button
                                onClick={() => setIsRejectModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>رفض الطلب</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Section: Orders & Student Verification Card */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Student ID Card Card */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-orange-500" />
                                    <span>بيانات وتوثيق الكارنيه الجامعي (فحص الوجه والظهر)</span>
                                </h2>
                                {customer.student_verified_at && (
                                    <span className="text-[11px] text-stone-400">
                                        تم التوثيق: {new Date(customer.student_verified_at).toLocaleDateString('ar-EG')}
                                    </span>
                                )}
                            </div>

                            {customer.student_status === 'REJECTED' && customer.rejection_reason && (
                                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 space-y-1">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span>سبب الرفض المسجل للطالب:</span>
                                    </p>
                                    <p className="pr-5 text-xs text-red-700 dark:text-red-300 font-medium">{customer.rejection_reason}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                                    <span className="text-stone-400 block mb-1">الجامعة المسجلة:</span>
                                    <span className="font-bold text-stone-900 dark:text-white text-sm">
                                        {customer.university_name || 'غير محدد'}
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                                    <span className="text-stone-400 block mb-1">رقم الكارنيه / القيد:</span>
                                    <span className="font-bold text-stone-900 dark:text-white text-sm font-mono">
                                        {customer.university_id_number || 'غير مسجل'}
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                                    <span className="text-stone-400 block mb-1">حالة التوثيق:</span>
                                    <span className="font-bold text-stone-900 dark:text-white text-sm">
                                        {customer.student_status === 'APPROVED' ? 'مفعل وموثق ✓' : (customer.student_status === 'PENDING' ? 'قيد المراجعة ⏳' : 'مرفوض ✕')}
                                    </span>
                                </div>
                            </div>

                            {/* Front & Back Images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Front Side Card */}
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                            <span>📷 صورة وجه الكارنيه (الأمام)</span>
                                        </span>
                                        {frontImageSrc && (
                                            <button
                                                onClick={() => setLightboxImage({ src: frontImageSrc, title: 'وجه الكارنيه (الأمام)' })}
                                                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5" />
                                                <span>تكبير وفحص</span>
                                            </button>
                                        )}
                                    </div>
                                    {frontImageSrc ? (
                                        <div 
                                            onClick={() => setLightboxImage({ src: frontImageSrc, title: 'وجه الكارنيه (الأمام)' })}
                                            className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-black/5 dark:bg-black/20 h-52 flex items-center justify-center cursor-pointer hover:opacity-95 transition"
                                        >
                                            <img src={frontImageSrc} alt="وجه الكارنيه" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="h-52 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 text-xs">
                                            لم يتم رفع صورة وجه الكارنيه
                                        </div>
                                    )}
                                </div>

                                {/* Back Side Card */}
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                            <span>📷 صورة ظهر الكارنيه (الخلف)</span>
                                        </span>
                                        {backImageSrc && (
                                            <button
                                                onClick={() => setLightboxImage({ src: backImageSrc, title: 'ظهر الكارنيه (الخلف)' })}
                                                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5" />
                                                <span>تكبير وفحص</span>
                                            </button>
                                        )}
                                    </div>
                                    {backImageSrc ? (
                                        <div 
                                            onClick={() => setLightboxImage({ src: backImageSrc, title: 'ظهر الكارنيه (الخلف)' })}
                                            className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-black/5 dark:bg-black/20 h-52 flex items-center justify-center cursor-pointer hover:opacity-95 transition"
                                        >
                                            <img src={backImageSrc} alt="ظهر الكارنيه" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="h-52 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 text-xs">
                                            لم يتم رفع صورة ظهر الكارنيه
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">
                                سجل أحدث الطلبات ({orders.length})
                            </h2>
                            {orders.length === 0 ? (
                                <p className="text-stone-400 text-xs text-center py-6">لا توجد طلبات سابقة لهذا العميل</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {orders.map((order: any) => (
                                        <Link key={order.id} href={`/admin/orders/${order.id}`}
                                            className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 transition-colors text-xs">
                                            <div>
                                                <p className="font-mono font-bold text-stone-900 dark:text-white">{order.order_number}</p>
                                                <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">{order.restaurant?.name || 'مطعم'}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-orange-600 dark:text-orange-400">{Number(order.total_amount).toFixed(2)} ج.م</p>
                                                <p className="text-stone-400 text-[10px]">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Information */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-black text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">معلومات الحساب</h3>
                            <div className="space-y-3">
                                <InfoRow icon={User} label="الاسم" value={customer.user.name} />
                                <InfoRow icon={Phone} label="الهاتف" value={customer.user.phone ?? '—'} />
                                <InfoRow icon={Calendar} label="تاريخ الانضمام" value={new Date(customer.user.created_at).toLocaleDateString('ar-EG')} />
                            </div>
                        </div>

                        {customer.addresses && customer.addresses.length > 0 && (
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-3">
                                <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                                    <MapPin className="w-4 h-4 text-orange-500" /> العناوين المسجلة
                                </h3>
                                <div className="space-y-2">
                                    {customer.addresses.map(addr => (
                                        <div key={addr.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs border border-stone-200/60 dark:border-stone-700/60">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-stone-900 dark:text-white">{addr.label}</span>
                                                {addr.is_default && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">افتراضي</span>}
                                            </div>
                                            <p className="text-stone-500 text-[11px] mt-1">{addr.address}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reject Reason Modal */}
                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <span>رفض طلب توثيق الكارنيه</span>
                                </h3>
                                <button
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                سيتم إبلاغ الطالب بسبب الرفض ليتمكن من معالجة المشكلة وإعادة رفع الكارنيه:
                            </p>

                            <form onSubmit={handleRejectSubmit} className="space-y-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        'صورة الكارنيه غير واضحة',
                                        'الكارنيه منتهي الصلاحية',
                                        'الاسم غير مطابق لبيانات الحساب',
                                        'مطلوب رفع صورة الظهر أيضاً',
                                        'البيانات غير مكتملة أو غير واضحة',
                                    ].map((preset) => (
                                        <button
                                            type="button"
                                            key={preset}
                                            onClick={() => setRejectionReason(preset)}
                                            className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition cursor-pointer ${
                                                rejectionReason === preset
                                                    ? 'bg-red-600 text-white font-bold'
                                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                        نص سبب الرفض
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="اكتب سبب رفض الكارنيه للطالب..."
                                        className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsRejectModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition cursor-pointer"
                                    >
                                        تأكيد الرفض وإشعار الطالب
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Fullscreen Lightbox Modal */}
                {lightboxImage && (
                    <div 
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out"
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl p-3 cursor-default"
                        >
                            <div className="flex items-center justify-between pb-3 px-3 border-b border-stone-800 text-white">
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <ZoomIn className="w-4 h-4 text-orange-500" />
                                    <span>فحص {lightboxImage.title} — {customer.user.name}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={lightboxImage.src} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-bold text-orange-400"
                                    >
                                        فتح في نافذة جديدة ↗
                                    </a>
                                    <button
                                        onClick={() => setLightboxImage(null)}
                                        className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
                                <img 
                                    src={lightboxImage.src} 
                                    alt={lightboxImage.title} 
                                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
                <p className="text-[11px] text-stone-400 font-medium">{label}</p>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">{value}</p>
            </div>
        </div>
    );
}
