import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { useCartStore } from '../../Stores/cartStore';
import { SharedInertiaProps } from '../../Types';
import {
    ShoppingBag, Trash2, Plus, Minus, GraduationCap,
    CheckCircle2, MapPin, Navigation, X, AlertCircle, Sparkles, Lock, LogIn, User, Building2
} from 'lucide-react';
import { BORG_EL_ARAB_UNIVERSITIES } from '../../constants/universities';

const QUICK_NOTES = ['طحينة زيادة','بدون شطة','شطة زيادة','ليمون زيادة','كاتشب إضافي','بدون مخلل','العيش محمص'];

export default function Cart() {
    const { auth } = usePage<SharedInertiaProps>().props;
    const { items, restaurant, removeItem, updateQuantity, clearCart, getSubtotal, getStudentDiscountAmount, getDeliveryFee, getTotal, studentDiscountApplied, studentDiscountPercentage } = useCartStore();
    const subtotal = getSubtotal();
    const studentDiscount = getStudentDiscountAmount();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    const [notes, setNotes] = useState('');
    const [address, setAddress] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [locationMode, setLocationMode] = useState<'university' | 'auto' | 'manual'>('university');
    
    // University state
    const [selectedUniId, setSelectedUniId] = useState('BATU');
    const [selectedLocation, setSelectedLocation] = useState(BORG_EL_ARAB_UNIVERSITIES[0].locations[0]);
    const [roomDetails, setRoomDetails] = useState('');

    const [isLocating, setIsLocating] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [modalError, setModalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeUni = BORG_EL_ARAB_UNIVERSITIES.find(u => u.id === selectedUniId) || BORG_EL_ARAB_UNIVERSITIES[0];

    const handleUniChange = (uniId: string) => {
        setSelectedUniId(uniId);
        const uni = BORG_EL_ARAB_UNIVERSITIES.find(u => u.id === uniId);
        if (uni && uni.locations.length > 0) {
            setSelectedLocation(uni.locations[0]);
        }
    };

    const toggleNote = (preset: string) => {
        setNotes((prev) => {
            const parts = prev.split(/[,،]+/).map((s) => s.trim()).filter(Boolean);
            if (parts.includes(preset)) return parts.filter((p) => p !== preset).join('، ');
            return [...parts, preset].join('، ');
        });
    };

    const handleGetLocation = async () => {
        if (!navigator.geolocation) { setModalError('تحديد الموقع غير مدعوم في جهازك'); return; }
        setIsLocating(true);
        setModalError('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setLocationUrl(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`, { headers: { 'User-Agent': 'Fatrny-App' } });
                    if (res.ok) { const d = await res.json(); setAddress(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`); }
                    else setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                } catch { setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); }
                setIsLocating(false);
            },
            (err) => { setIsLocating(false); setModalError(err.code === 1 ? 'يرجى السماح بصلاحية الموقع' : 'تعذر تحديد الموقع'); },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    const handleOpenModal = () => { if (!auth?.user) { router.visit('/login'); return; } setModalError(''); setIsLocationModalOpen(true); };

    const handleConfirmOrder = () => {
        setModalError('');
        let finalAddress = '';
        if (locationMode === 'university') {
            const extra = roomDetails.trim() ? ` — (${roomDetails.trim()})` : '';
            finalAddress = `${activeUni.name} — ${selectedLocation}${extra}`;
        } else if (locationMode === 'auto') {
            finalAddress = address.trim() || (locationUrl ? `الموقع: ${locationUrl}` : '');
        } else {
            finalAddress = address.trim();
        }

        if (!finalAddress) { setModalError('يرجى تحديد موقع الاستلام أو إدخال العنوان'); return; }
        setIsSubmitting(true);
        router.post('/orders', {
            restaurant_id: restaurant?.id,
            customer_notes: notes,
            notes,
            address: finalAddress,
            delivery_address: finalAddress,
            payment_method: 'CASH_ON_DELIVERY',
            items: items.map(item => ({
                menu_item_id: item.menuItem.id,
                quantity: item.quantity,
                notes: item.notes || '',
                options: item.selectedOptions,
                addons: item.selectedAddons.map(a => a.id)
            }))
        }, {
            onSuccess: () => { clearCart(); setIsLocationModalOpen(false); },
            onError: (errors) => setModalError(Object.values(errors).join(' — ') || 'حدث خطأ'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (items.length === 0 || !restaurant) {
        return (
            <GuestLayout>
                <Head title="سلة التسوق — فطرنا شكراً" />
                <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
                    <div className="w-24 h-24 rounded-3xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center mx-auto shadow-inner">
                        <ShoppingBag className="w-12 h-12 text-orange-500" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">عربة التسوق فارغة حالياً</h1>
                    <p className="text-sm text-stone-500 max-w-md mx-auto">لم تقم بإضافة أي وجبة. تصفح مطاعم جامعة برج العرب واختر وجبتك!</p>
                    <Link href="/restaurants" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95">
                        <span>استعراض المطاعم</span>
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="سلة التسوق — فطرنا شكراً" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
                            <span>عربة التسوق</span>
                            <span className="text-sm px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 font-bold">{items.reduce((acc, i) => acc + i.quantity, 0)} أصناف</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1">طلبك من {restaurant.name}</p>
                    </div>
                    <button onClick={clearCart} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 className="w-4 h-4" /><span>تفريغ السلة</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                        <div className="p-4 bg-stone-50 text-xs font-black text-stone-600 dark:text-stone-300 grid grid-cols-12 gap-2">
                            <span className="col-span-6">المنتج</span>
                            <span className="col-span-3 text-center">الكمية</span>
                            <span className="col-span-3 text-left">الإجمالي</span>
                        </div>
                        {items.map((item) => (
                            <div key={item.id} className="p-4 space-y-2">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                                            <img src={item.menuItem.image || '/images/sandwich-foul.jpg'} alt={item.menuItem.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">{item.menuItem.name}</h3>
                                            <span className="text-[11px] text-orange-600 font-semibold">{item.unitPrice > 0 ? `${item.unitPrice} ج.م` : 'مجاني'}</span>
                                            {item.selectedOptions.length > 0 && <div className="text-[10px] text-stone-400 mt-0.5">{item.selectedOptions.map(o => o.valueName).join('، ')}</div>}
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-orange-600"><Minus className="w-3 h-3" /></button>
                                        <span className="px-1 text-xs font-black text-stone-800 dark:text-stone-100">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-orange-600"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end gap-2 text-left">
                                        <span className="font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">{item.unitPrice > 0 ? `${item.totalPrice} ج.م` : '—'}</span>
                                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                {item.notes && <div className="text-[10px] text-stone-500 bg-orange-50/50 dark:bg-stone-800/50 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-stone-700"><Sparkles className="w-3 h-3 inline text-orange-400 ml-1" />{item.notes}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
                        <h2 className="text-lg font-black text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">تأكيد وبيانات الطلب</h2>

                        {!auth?.user ? (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-orange-950/30 border border-orange-200 space-y-3 text-center">
                                <div className="w-11 h-11 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto"><Lock className="w-5 h-5" /></div>
                                <p className="text-sm font-black text-stone-900 dark:text-white">يلزم تسجيل الدخول لتأكيد الطلب</p>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <Link href="/login" className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5"><LogIn className="w-3.5 h-3.5" /><span>تسجيل الدخول</span></Link>
                                    <Link href="/register" className="py-2.5 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1"><User className="w-3.5 h-3.5" /><span>إنشاء حساب</span></Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm">{auth.user.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-stone-900 dark:text-white truncate">{auth.user.name}</div>
                                    <div className="text-[11px] text-stone-500">{auth.user.phone || auth.user.email}</div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">حساب مسجل ✓</span>
                            </div>
                        )}

                        <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
                            <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-orange-500" /><span>ملاحظات (اختياري):</span></label>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_NOTES.map((preset) => {
                                    const isSelected = notes.includes(preset);
                                    return <button key={preset} type="button" onClick={() => toggleNote(preset)} className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'}`}>{isSelected ? '✓ ' : '+ '}{preset}</button>;
                                })}
                            </div>
                            <textarea rows={2} placeholder="ملاحظات إضافية..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none" />
                        </div>

                        {studentDiscountApplied && (
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-emerald-600" /><span>خصم الطلاب الجامعي:</span></span>
                                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">مفعّل تلقائياً 🎓</span>
                            </div>
                        )}

                        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                            <div className="flex justify-between text-stone-500"><span>المجموع الفرعي:</span><span className="font-bold text-stone-800 dark:text-stone-200">{subtotal.toFixed(2)} ج.م</span></div>
                            {studentDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>خصم الطلاب ({studentDiscountPercentage}%):</span><span className="font-bold">-{studentDiscount.toFixed(2)} ج.م</span></div>}
                            <div className="flex justify-between text-stone-500"><span>رسوم التوصيل:</span><span className="font-bold text-emerald-600">{deliveryFee > 0 ? `${deliveryFee} ج.م` : 'مجاناً'}</span></div>
                            <div className="flex justify-between text-base font-black text-stone-900 dark:text-white pt-2 border-t border-stone-100 dark:border-stone-800"><span>الإجمالي الكلي:</span><span className="text-orange-600 dark:text-orange-400">{total.toFixed(2)} ج.م</span></div>
                        </div>

                        {!auth?.user ? (
                            <Link href="/login" className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all">
                                <Lock className="w-5 h-5" /><span>سجل دخولك لتأكيد الطلب</span>
                            </Link>
                        ) : (
                            <Link href="/checkout" className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98">
                                <CheckCircle2 className="w-5 h-5" /><span>المتابعة لتحديد الموقع بالخريطة وإتمام الطلب 🚀</span>
                            </Link>
                        )}
                        <p className="text-[11px] text-center text-stone-400">تحديد دقيق لموقع الاستلام بالـ GPS أو المقر الجامعي مع حساب رسوم التوصيل بالكيلومتر</p>
                    </div>
                </div>
            </div>

            {isLocationModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="relative max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 my-8 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                                <div><h3 className="text-base font-black text-stone-900 dark:text-white">تأكيد مكان استلام الطلب 📍</h3><p className="text-[11px] text-stone-500">حدد مكان تواجدك داخل جامعة برج العرب</p></div>
                            </div>
                            <button onClick={() => setIsLocationModalOpen(false)} className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
                        </div>

                        {modalError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-red-500" /><span>{modalError}</span></div>}

                        <div className="grid grid-cols-3 gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs font-black">
                            <button
                                type="button"
                                onClick={() => setLocationMode('university')}
                                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    locationMode === 'university' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
                                }`}
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>مقر جامعي 🎓</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocationMode('auto')}
                                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    locationMode === 'auto' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
                                }`}
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>تحديد GPS</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocationMode('manual')}
                                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    locationMode === 'manual' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
                                }`}
                            >
                                <span>✏️ كتابة يدوية</span>
                            </button>
                        </div>

                        {/* 1. University Selection Mode */}
                        {locationMode === 'university' && (
                            <div className="space-y-3.5 p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 animate-fade-in text-xs">
                                <div>
                                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                                        اختر جامعتك في برج العرب:
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {BORG_EL_ARAB_UNIVERSITIES.map((uni) => (
                                            <button
                                                key={uni.id}
                                                type="button"
                                                onClick={() => handleUniChange(uni.id)}
                                                className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between cursor-pointer ${
                                                    selectedUniId === uni.id
                                                        ? 'border-orange-500 bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 font-black ring-1 ring-orange-500 shadow-xs'
                                                        : 'border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                                                }`}
                                            >
                                                <span>{uni.name}</span>
                                                {selectedUniId === uni.id && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                                        المبنى أو نقطة الاستلام داخل {activeUni.shortName}:
                                    </label>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-medium outline-none focus:border-orange-500"
                                    >
                                        {activeUni.locations.map((loc, idx) => (
                                            <option key={idx} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                                        تفاصيل إضافية (الدور / القاعة / رقم الغرفة بالسكن):
                                    </label>
                                    <input
                                        type="text"
                                        value={roomDetails}
                                        onChange={(e) => setRoomDetails(e.target.value)}
                                        placeholder="مثال: الدور الثاني، قاعة 102 أو غرفة 204 بالسكن..."
                                        className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>العنوان المحدد:</strong> {activeUni.name} — {selectedLocation} {roomDetails ? `(${roomDetails})` : ''}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 2. GPS Direct Mode */}
                        {locationMode === 'auto' && (
                            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-3 animate-fade-in">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">التقاط الموقع تلقائياً:</span>
                                    <button type="button" onClick={handleGetLocation} disabled={isLocating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer">
                                        {isLocating ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>جاري...</span></> : <><Navigation className="w-3.5 h-3.5" /><span>{address ? 'تحديث' : 'التقاط موقعي'}</span></>}
                                    </button>
                                </div>
                                {address && <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 text-xs"><span className="font-black text-stone-900 dark:text-white block">العنوان:</span><p className="text-stone-600 leading-relaxed font-bold">{address}</p></div>}
                                {locationUrl && <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"><span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>تم التقاط الموقع ✓</span></span><a href={locationUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-orange-600 hover:underline">معاينة ↗</a></div>}
                            </div>
                        )}

                        {/* 3. Manual Mode */}
                        {locationMode === 'manual' && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="block text-xs font-black text-stone-700 dark:text-stone-300">تفاصيل العنوان:</label>
                                <textarea rows={3} required placeholder="مثال: مبنى كلية تكنولوجيا الصناعة، الدور الثاني، قاعة 204..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full text-xs p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">ملاحظات إضافية (اختياري):</label>
                            <input type="text" placeholder="مثال: اتصل بيا لما توصل..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none" />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
                            <span className="text-stone-500 font-bold">المبلغ المطلوب عند الاستلام:</span>
                            <span className="font-black text-base text-orange-600 dark:text-orange-400">{total.toFixed(2)} ج.م</span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button type="button" onClick={() => setIsLocationModalOpen(false)} className="flex-1 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors">إلغاء</button>
                            <button type="button" onClick={handleConfirmOrder} disabled={isSubmitting} className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50">
                                {isSubmitting ? <span>جاري تأكيد الطلب...</span> : <><CheckCircle2 className="w-4 h-4" /><span>تأكيد الطلب والموقع الآن 🚀</span></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
