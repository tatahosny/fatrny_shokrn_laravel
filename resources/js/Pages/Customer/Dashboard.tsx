import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import { Customer, Order } from '../../Types';
import { 
    ShoppingBag, 
    Clock, 
    ArrowRight, 
    GraduationCap, 
    CheckCircle2, 
    AlertCircle, 
    Store, 
    Bike, 
    MapPin,
    Sparkles
} from 'lucide-react';

interface DashboardProps {
    customer: Customer;
    recent_orders: Order[];
    active_order: Order | null;
}

export default function Dashboard({ customer, recent_orders = [], active_order }: DashboardProps) {
    const isStudentApproved = customer.student_status === 'APPROVED';

    const getStatusBadge = (status: string) => {
        const map: { [key: string]: { label: string; bg: string; text: string } } = {
            PENDING: { label: 'قيد الانتظار', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-300' },
            CONFIRMED: { label: 'تم تأكيد الطلب', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-300' },
            PREPARING: { label: 'المطعم يجهز الوجبة', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-800 dark:text-orange-300' },
            READY_FOR_PICKUP: { label: 'جاهز للاستلام', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-300' },
            ASSIGNED_TO_DRIVER: { label: 'تم تعيين الطيار', bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-800 dark:text-indigo-300' },
            OUT_FOR_DELIVERY: { label: 'الطيار في الطريق إليك', bg: 'bg-teal-100 dark:bg-teal-950', text: 'text-teal-800 dark:text-teal-300' },
            DELIVERED: { label: 'تم التوصيل بنجاح', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-300' },
            CANCELLED: { label: 'ملغي', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-300' },
        };
        const s = map[status] || { label: status, bg: 'bg-stone-100', text: 'text-stone-700' };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    return (
        <CustomerLayout title="لوحة تحكم الطالب والعميل" customer={customer}>
            <Head title="لوحة تحكم الطالب والعميل — فطرنا شكراً" />

            <div className="space-y-8">
                {/* Student Status Banner */}
                {isStudentApproved ? (
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-stone-900 dark:text-white text-base flex items-center gap-2">
                                    <span>كارنيه الطالب مفعل — تمتع بخصومات حصرية</span>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </h3>
                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                                    {customer.university_name || 'جامعة برج العرب التكنولوجية'} — خصومات 10% إلى 20% تطبق على كل سلة طلبات تلقائياً.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/restaurants"
                            className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow transition shrink-0"
                        >
                            اطلب الآن بخصمك
                        </Link>
                    </div>
                ) : (
                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-stone-800/60 border border-amber-300 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">
                                    هل أنت طالب في برج العرب التكنولوجية أو الجامعة اليابانية؟
                                </h3>
                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                                    ارفع صورة كارنيه الجامعة لتحصل فوراً على خصم الطلاب في جميع مطاعم المنصة.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/customer/profile#student-id"
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition shrink-0"
                        >
                            توثيق الكارنيه الآن
                        </Link>
                    </div>
                )}

                {/* Live Active Order Tracking Card (if any) */}
                {active_order && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border-2 border-orange-500 shadow-xl space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold">
                                    <Bike className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">طلبك قيد التوصيل الآن</span>
                                    <h3 className="text-base font-black text-stone-900 dark:text-white">
                                        {active_order.restaurant?.name}
                                    </h3>
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(active_order.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl text-xs">
                            <div>
                                <span className="text-stone-400 block text-[10px]">رقم الطلب</span>
                                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{active_order.order_number}</span>
                            </div>
                            <div>
                                <span className="text-stone-400 block text-[10px]">الإجمالي</span>
                                <span className="font-bold text-orange-600">{active_order.total_amount} ج.م</span>
                            </div>
                            <div>
                                <span className="text-stone-400 block text-[10px]">طريقة الدفع</span>
                                <span className="font-bold text-stone-700 dark:text-stone-300">كاش عند الاستلام</span>
                            </div>
                            <div>
                                <span className="text-stone-400 block text-[10px]">الكابتن</span>
                                <span className="font-bold text-stone-700 dark:text-stone-300">
                                    {active_order.deliveryDriver?.name || 'جارٍ التعيين...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={`/customer/orders/${active_order.order_number}`}
                                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                            >
                                <span>تتبع الطلب بالخريطة</span>
                                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Quick actions row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/restaurants"
                        className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 transition group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-stone-900 dark:text-white">تصفح المطاعم</h4>
                                <p className="text-[10px] text-stone-400">اختر وجبتك المفضلة</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 rotate-180 text-stone-400 group-hover:text-orange-600 transition" />
                    </Link>

                    <Link
                        href="/cart"
                        className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 transition group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-stone-900 dark:text-white">سلة التسوق</h4>
                                <p className="text-[10px] text-stone-400">أكمل طلبك المعلق</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 rotate-180 text-stone-400 group-hover:text-orange-600 transition" />
                    </Link>

                    <Link
                        href="/customer/orders"
                        className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 transition group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-stone-900 dark:text-white">سجل الطلبات</h4>
                                <p className="text-[10px] text-stone-400">إعادة طلب بنقرة واحدة</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 rotate-180 text-stone-400 group-hover:text-orange-600 transition" />
                    </Link>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span>آخر الطلبات</span>
                        </h3>
                        <Link href="/customer/orders" className="text-xs font-bold text-orange-600 hover:underline">
                            عرض السجل بالكامل
                        </Link>
                    </div>

                    {recent_orders.length === 0 ? (
                        <div className="text-center py-10">
                            <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-500 dark:text-stone-400">لم تقم بأي طلبات بعد.</p>
                            <Link href="/restaurants" className="inline-block mt-3 text-xs font-bold text-orange-600 hover:underline">
                                اطلب فطارك الآن
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {recent_orders.map(order => (
                                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                                                {order.restaurant?.name || 'مطعم شريك'}
                                            </h4>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-xs text-stone-400 mt-1 font-mono">
                                            {order.order_number} • {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                        <span className="font-black text-sm text-stone-900 dark:text-white">
                                            {order.total_amount} ج.م
                                        </span>
                                        <Link
                                            href={`/customer/orders/${order.order_number}`}
                                            className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                                        >
                                            التفاصيل
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
