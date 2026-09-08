import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Customer, CustomerAddress } from '../../Types';
import { useCartStore } from '../../Stores/cartStore';
import { 
    MapPin, 
    Bike, 
    CreditCard, 
    ShieldCheck, 
    Plus, 
    ArrowRight, 
    GraduationCap, 
    AlertCircle, 
    Store, 
    Clock, 
    FileText 
} from 'lucide-react';

interface CheckoutProps {
    customer: Customer;
    addresses: CustomerAddress[];
}

export default function Checkout({ customer, addresses = [] }: CheckoutProps) {
    const { 
        items, 
        restaurant, 
        getSubtotal, 
        getStudentDiscountAmount, 
        getDeliveryFee, 
        getTotal, 
        clearCart,
        setStudentDiscount
    } = useCartStore();

    // If customer is verified student, ensure discount is set
    useEffect(() => {
        if (customer.student_status === 'APPROVED' && restaurant) {
            setStudentDiscount(Number(restaurant.student_discount_percentage) || 0);
        }
    }, [customer, restaurant]);

    const defaultAddr = addresses.find(a => a.is_default)?.address || addresses[0]?.address || '';
    const [selectedAddress, setSelectedAddress] = useState(defaultAddr);
    const [customAddress, setCustomAddress] = useState('');
    const [useCustomAddress, setUseCustomAddress] = useState(addresses.length === 0);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const subtotal = getSubtotal();
    const studentDiscount = getStudentDiscountAmount();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!restaurant || items.length === 0) {
            setErrorMsg('سلة الطلبات فارغة!');
            return;
        }

        const finalAddress = useCustomAddress ? customAddress : selectedAddress;
        if (!finalAddress.trim()) {
            setErrorMsg('الرجاء إدخال أو تحديد عنوان التوصيل في برج العرب.');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            restaurant_id: restaurant.id,
            items: items.map(item => ({
                menu_item_id: item.menuItem.id,
                quantity: item.quantity,
                options: item.selectedOptions,
                addons: item.selectedAddons,
                notes: item.notes || null,
            })),
            address: finalAddress,
            latitude: null,
            longitude: null,
            payment_method: 'CASH_ON_DELIVERY',
            customer_notes: notes || null,
        };

        router.post('/checkout', payload as any, {
            onSuccess: () => {
                clearCart();
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const first = Object.values(errs)[0];
                setErrorMsg(first ? String(first) : 'حدث خطأ أثناء تنفيذ الطلب.');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    if (items.length === 0 || !restaurant) {
        return (
            <GuestLayout>
                <div className="max-w-xl mx-auto px-4 py-20 text-center">
                    <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">لا توجد طلبات لإتمامها</h2>
                    <p className="text-sm text-stone-500 mb-6">الرجاء إضافة أصناف إلى سلتك أولاً.</p>
                    <Link href="/restaurants" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm">
                        تصفح المطاعم
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="إتمام الطلب والدفع — فطرنا شكراً" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mb-2">
                    إتمام الطلب
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-8">
                    مراجعة تفاصيل العنوان وتأكيد طلبك من مطعم {restaurant.name}
                </p>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500 text-red-600 text-xs font-bold animate-fade-in flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Delivery & Instructions Left 2 Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Address Selection */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                <span>عنوان التوصيل في برج العرب</span>
                            </h2>

                            {/* Saved Addresses options if any */}
                            {addresses.length > 0 && !useCustomAddress && (
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <label
                                            key={addr.id}
                                            className={`flex items-start justify-between p-4 rounded-2xl border text-xs cursor-pointer transition ${
                                                selectedAddress === addr.address
                                                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-stone-900 dark:text-white'
                                                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="address_choice"
                                                    checked={selectedAddress === addr.address}
                                                    onChange={() => setSelectedAddress(addr.address)}
                                                    className="mt-0.5 text-orange-600 focus:ring-orange-500"
                                                />
                                                <div>
                                                    <span className="font-bold block text-stone-900 dark:text-white">{addr.label}</span>
                                                    <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">{addr.address}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setUseCustomAddress(true)}
                                        className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>تحديد عنوان مختلف لهذا الطلب</span>
                                    </button>
                                </div>
                            )}

                            {/* Custom Address Input */}
                            {(useCustomAddress || addresses.length === 0) && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                            العنوان بالتفصيل (الحي، رقم العمارة، سكن الطلاب، معالم مميزة)
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={customAddress}
                                            onChange={(e) => setCustomAddress(e.target.value)}
                                            placeholder="مثال: سكن طلاب جامعة برج العرب التكنولوجية، عمارة 14، الدور الثالث، شقة 5..."
                                            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    {addresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setUseCustomAddress(false)}
                                            className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-white underline"
                                        >
                                            الرجوع للعناوين المحفوظة
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Special Instructions */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-500" />
                                <span>ملاحظات خاصة لكابتن التوصيل أو المطعم (اختياري)</span>
                            </h2>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="مثال: رن الجرس مرة واحدة، أو اتصل بي هاتفياً عند الوصول أمام البوابة..."
                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        {/* Payment Method Choice */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-orange-500" />
                                <span>طريقة الدفع</span>
                            </h2>

                            <div className="p-4 rounded-2xl border-2 border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                        كاش
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xs text-stone-900 dark:text-white">الدفع نقداً عند الاستلام (COD)</h3>
                                        <p className="text-[11px] text-stone-500">ادفع المبلغ للكابتن يد بيد عند استلام الوجبة ساخنة</p>
                                    </div>
                                </div>
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Submit Right Column */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
                                تفاصيل الفاتورة
                            </h2>

                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-50 dark:border-stone-800/40">
                                        <span className="text-stone-700 dark:text-stone-300">
                                            {item.quantity} × {item.menuItem.name}
                                        </span>
                                        <span className="font-bold text-stone-900 dark:text-white">
                                            {item.totalPrice.toFixed(1)} ج.م
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5 text-xs">
                                <div className="flex items-center justify-between text-stone-500">
                                    <span>المجموع الفرعي</span>
                                    <span className="font-bold text-stone-800 dark:text-stone-200">{subtotal.toFixed(2)} ج.م</span>
                                </div>

                                {studentDiscount > 0 && (
                                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            خصم الطلاب
                                        </span>
                                        <span>-{studentDiscount.toFixed(2)} ج.م</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-stone-500">
                                    <span>رسوم التوصيل</span>
                                    <span className="font-bold text-stone-800 dark:text-stone-200">{deliveryFee.toFixed(2)} ج.م</span>
                                </div>

                                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-base font-black text-stone-900 dark:text-white">
                                    <span>المبلغ المطلوب</span>
                                    <span className="text-2xl text-orange-600 dark:text-orange-400">{total.toFixed(2)} ج.م</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
                            >
                                <span>{isSubmitting ? 'جارٍ إرسال الطلب...' : 'تأكيد وإرسال الطلب الآن'}</span>
                                <ArrowRight className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
