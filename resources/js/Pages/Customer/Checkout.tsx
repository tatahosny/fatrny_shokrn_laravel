import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Customer, CustomerAddress } from '../../Types';
import { useCartStore } from '../../Stores/cartStore';
import { BORG_EL_ARAB_UNIVERSITIES } from '../../constants/universities';
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
    FileText,
    Navigation,
    CheckCircle2,
    Building2,
    Sparkles
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

    const isVerifiedStudent = customer?.student_status === 'APPROVED';

    // If customer is verified student, ensure discount is set
    useEffect(() => {
        if (isVerifiedStudent && restaurant) {
            setStudentDiscount(Number(restaurant.student_discount_percentage) || 0);
        }
    }, [customer, restaurant, isVerifiedStudent]);

    // Address Mode: 'university' | 'saved' | 'custom' | 'gps'
    const [addressMode, setAddressMode] = useState<'university' | 'saved' | 'custom' | 'gps'>(
        isVerifiedStudent ? 'university' : (addresses.length > 0 ? 'saved' : 'university')
    );

    // University state
    const [selectedUniId, setSelectedUniId] = useState('BATU');
    const [selectedLocation, setSelectedLocation] = useState(BORG_EL_ARAB_UNIVERSITIES[0].locations[0]);
    const [roomDetails, setRoomDetails] = useState('');

    // Saved address state
    const defaultAddr = addresses.find(a => a.is_default)?.address || addresses[0]?.address || '';
    const [selectedSavedAddress, setSelectedSavedAddress] = useState(defaultAddr);

    // Custom text address
    const [customAddress, setCustomAddress] = useState('');

    // GPS State
    const [gpsAddress, setGpsAddress] = useState('');
    const [gpsUrl, setGpsUrl] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const subtotal = getSubtotal();
    const studentDiscount = getStudentDiscountAmount();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    const activeUni = BORG_EL_ARAB_UNIVERSITIES.find(u => u.id === selectedUniId) || BORG_EL_ARAB_UNIVERSITIES[0];

    const handleUniChange = (uniId: string) => {
        setSelectedUniId(uniId);
        const uni = BORG_EL_ARAB_UNIVERSITIES.find(u => u.id === uniId);
        if (uni && uni.locations.length > 0) {
            setSelectedLocation(uni.locations[0]);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setErrorMsg('تحديد الموقع عبر GPS غير مدعوم في متصفحك.');
            return;
        }
        setIsLocating(true);
        setErrorMsg('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setGpsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`, {
                        headers: { 'User-Agent': 'Fatrny-App' }
                    });
                    if (res.ok) {
                        const d = await res.json();
                        setGpsAddress(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                    } else {
                        setGpsAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                    }
                } catch {
                    setGpsAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                }
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                setErrorMsg(err.code === 1 ? 'يرجى السماح بالوصول للموقع في المتصفح' : 'تعذر التقاط موقعك الجغرافي');
            },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    const buildFinalAddress = (): string => {
        if (addressMode === 'university') {
            const extra = roomDetails.trim() ? ` — (${roomDetails.trim()})` : '';
            return `${activeUni.name} — ${selectedLocation}${extra}`;
        }
        if (addressMode === 'saved') {
            return selectedSavedAddress;
        }
        if (addressMode === 'gps') {
            return gpsAddress || (gpsUrl ? `موقع GPS: ${gpsUrl}` : '');
        }
        return customAddress;
    };

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!restaurant || items.length === 0) {
            setErrorMsg('سلة الطلبات فارغة!');
            return;
        }

        const finalAddress = buildFinalAddress();
        if (!finalAddress.trim()) {
            setErrorMsg('الرجاء تحديد مكان استلام الوجبة أو إدخال العنوان.');
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
                <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 dark:text-white">لا توجد طلبات لإتمامها</h2>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">الرجاء إضافة أصناف إلى سلتك أولاً من مطاعم برج العرب.</p>
                    <Link href="/restaurants" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition">
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
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mb-2">
                        إتمام وتأكيد الطلب
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        طلب وجبتك من مطعم <strong className="text-orange-600 dark:text-orange-400">{restaurant.name}</strong> وتحديد مكان الاستلام في برج العرب
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold animate-fade-in flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Delivery & Instructions Left 2 Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Address Selection Card */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                                <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                    <span>مكان استلام الطلب في برج العرب</span>
                                </h2>

                                {isVerifiedStudent && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        <span>طالب موثق (الخصم مطبق)</span>
                                    </span>
                                )}
                            </div>

                            {/* Mode Switcher Tabs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl text-xs font-black">
                                <button
                                    type="button"
                                    onClick={() => setAddressMode('university')}
                                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        addressMode === 'university'
                                            ? 'bg-orange-600 text-white shadow-xs'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                                    }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    <span>مقر جامعي 🎓</span>
                                </button>

                                {addresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setAddressMode('saved')}
                                        className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            addressMode === 'saved'
                                                ? 'bg-orange-600 text-white shadow-xs'
                                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Building2 className="w-4 h-4" />
                                        <span>عناوين محفوظة</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setAddressMode('gps')}
                                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        addressMode === 'gps'
                                            ? 'bg-orange-600 text-white shadow-xs'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Navigation className="w-4 h-4" />
                                    <span>تحديد GPS</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAddressMode('custom')}
                                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        addressMode === 'custom'
                                            ? 'bg-orange-600 text-white shadow-xs'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>عنوان مخصص</span>
                                </button>
                            </div>

                            {/* 1. UNIVERSITY SELECTION MODE */}
                            {addressMode === 'university' && (
                                <div className="space-y-4 pt-1 animate-fade-in">
                                    {/* University Cards Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                                            اختر جامعتك في برج العرب:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {BORG_EL_ARAB_UNIVERSITIES.map((uni) => {
                                                const isSelected = selectedUniId === uni.id;
                                                return (
                                                    <button
                                                        key={uni.id}
                                                        type="button"
                                                        onClick={() => handleUniChange(uni.id)}
                                                        className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                                                            isSelected
                                                                ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 ring-2 ring-orange-500/20 shadow-xs'
                                                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                                                isSelected
                                                                    ? 'bg-orange-600 text-white'
                                                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                                                            }`}>
                                                                {uni.badge}
                                                            </span>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                                                        </div>
                                                        <h4 className="font-bold text-xs text-stone-900 dark:text-white leading-snug">
                                                            {uni.name}
                                                        </h4>
                                                        <p className="text-[10px] text-stone-500 mt-1">
                                                            {uni.description}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Location within University */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                                المبنى أو نقطة الاستلام داخل {activeUni.shortName}:
                                            </label>
                                            <select
                                                value={selectedLocation}
                                                onChange={(e) => setSelectedLocation(e.target.value)}
                                                className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                                            >
                                                {activeUni.locations.map((loc, idx) => (
                                                    <option key={idx} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                                تفاصيل إضافية (الدور، القاعة، رقم الغرفة بالسكن):
                                            </label>
                                            <input
                                                type="text"
                                                value={roomDetails}
                                                onChange={(e) => setRoomDetails(e.target.value)}
                                                placeholder="مثال: الدور الثاني - معمل 102 أو غرفة 204..."
                                                className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Address summary preview */}
                                    <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-stone-800/80 border border-orange-200/80 dark:border-stone-700 text-xs flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-bold text-stone-900 dark:text-white block">العنوان المحدد للطيار:</span>
                                            <span className="text-stone-600 dark:text-stone-300 truncate block">
                                                {activeUni.name} — {selectedLocation} {roomDetails ? `(${roomDetails})` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. SAVED ADDRESSES MODE */}
                            {addressMode === 'saved' && addresses.length > 0 && (
                                <div className="space-y-3 animate-fade-in">
                                    {addresses.map((addr) => (
                                        <label
                                            key={addr.id}
                                            className={`flex items-start justify-between p-4 rounded-2xl border text-xs cursor-pointer transition ${
                                                selectedSavedAddress === addr.address
                                                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-stone-900 dark:text-white ring-1 ring-orange-500'
                                                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="address_choice"
                                                    checked={selectedSavedAddress === addr.address}
                                                    onChange={() => setSelectedSavedAddress(addr.address)}
                                                    className="mt-0.5 text-orange-600 focus:ring-orange-500"
                                                />
                                                <div>
                                                    <span className="font-bold block text-stone-900 dark:text-white">{addr.label}</span>
                                                    <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">{addr.address}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* 3. GPS DIRECT LOCATION MODE */}
                            {addressMode === 'gps' && (
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3 animate-fade-in">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-stone-900 dark:text-white">التقاط موقعك الجغرافي عبر القمر الصناعي:</h4>
                                            <p className="text-[11px] text-stone-500">يتيح للطيار الوصول لموقعك بدقة عبر خرائط جوجل</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={isLocating}
                                            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                                        >
                                            <Navigation className="w-3.5 h-3.5" />
                                            <span>{isLocating ? 'جارٍ التحديد...' : (gpsAddress ? 'تحديث الموقع' : 'تحديد موقعي الآن')}</span>
                                        </button>
                                    </div>

                                    {gpsAddress && (
                                        <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs">
                                            <span className="font-bold text-stone-900 dark:text-white block mb-0.5">العنوان المكتشف:</span>
                                            <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-semibold">{gpsAddress}</p>
                                        </div>
                                    )}

                                    {gpsUrl && (
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>تم تثبيت الإحداثيات بدقة ✓</span>
                                            </span>
                                            <a href={gpsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:underline">
                                                معاينة الخريطة ↗
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 4. CUSTOM MANUAL ADDRESS */}
                            {addressMode === 'custom' && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                                        العنوان بالتفصيل (الحي، الشارع، رقم العمارة، معالم قريبة):
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={customAddress}
                                        onChange={(e) => setCustomAddress(e.target.value)}
                                        placeholder="مثال: برج العرب الجديدة، الحي السكني الثاني، عمارة 15، الدور الثالث..."
                                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
                                    />
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
                                ملخص الفاتورة
                            </h2>

                            <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1 divide-y divide-stone-50 dark:divide-stone-800/40">
                                {items.map((item) => (
                                    <div key={item.id} className="pt-2 first:pt-0">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-stone-800 dark:text-stone-200 font-bold">
                                                {item.quantity} × {item.menuItem.name}
                                            </span>
                                            <span className="font-black text-stone-900 dark:text-white">
                                                {item.totalPrice.toFixed(1)} ج.م
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5 text-xs">
                                <div className="flex items-center justify-between text-stone-500">
                                    <span>المجموع الفرعي</span>
                                    <span className="font-bold text-stone-800 dark:text-stone-200">{subtotal.toFixed(2)} ج.م</span>
                                </div>

                                {studentDiscount > 0 && (
                                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/50 dark:border-emerald-800">
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            خصم الطلاب الجامعي
                                        </span>
                                        <span>-{studentDiscount.toFixed(2)} ج.م</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-stone-500">
                                    <span>رسوم التوصيل</span>
                                    <span className="font-bold text-stone-800 dark:text-stone-200">{deliveryFee.toFixed(2)} ج.م</span>
                                </div>

                                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-base font-black text-stone-900 dark:text-white">
                                    <span>المبلغ الإجمالي</span>
                                    <span className="text-2xl text-orange-600 dark:text-orange-400">{total.toFixed(2)} ج.م</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
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
