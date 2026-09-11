import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Restaurant, Offer, PaginatedResponse } from '../../../Types';
import { 
    Tag, 
    Plus, 
    Trash2, 
    Edit2, 
    Percent, 
    GraduationCap, 
    Clock, 
    Upload, 
    Sparkles, 
    Calendar,
    Flame,
    X,
    Check,
    Image as ImageIcon
} from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface OffersProps {
    offers: PaginatedResponse<Offer>;
    restaurant: Restaurant;
}

export default function Index({ offers, restaurant }: OffersProps) {
    const items = offers?.data || [];
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Create form
    const createForm = useForm({
        title: '',
        description: '',
        original_price: '',
        discount_price: '',
        is_active: true,
        is_student_only: false,
        start_date: '',
        end_date: '',
        image: null as File | null,
    });
    const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
    const createFileInputRef = useRef<HTMLInputElement>(null);

    // Edit form
    const editForm = useForm({
        title: '',
        description: '',
        original_price: '',
        discount_price: '',
        is_active: true,
        is_student_only: false,
        start_date: '',
        end_date: '',
        image: null as File | null,
    });
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const getOfferImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return '/images/sandwich-foul.jpg';
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) return imagePath;
        return `/storage/${imagePath}`;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/restaurant/offers', {
            forceFormData: true,
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                setCreateImagePreview(null);
            }
        });
    };

    const openEditModal = (offer: Offer) => {
        setEditingOffer(offer);
        editForm.setData({
            title: offer.title,
            description: offer.description || '',
            original_price: String(offer.original_price),
            discount_price: String(offer.discount_price),
            is_active: offer.is_active,
            is_student_only: offer.is_student_only || false,
            start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
            end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
            image: null,
        });
        setEditImagePreview(getOfferImageUrl(offer.image));
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOffer) return;

        router.post(`/restaurant/offers/${editingOffer.id}`, {
            _method: 'PUT',
            ...editForm.data,
        }, {
            forceFormData: true,
            onSuccess: () => {
                setEditingOffer(null);
                editForm.reset();
                setEditImagePreview(null);
            }
        });
    };

    const handleToggle = (id: number) => {
        router.post(`/restaurant/offers/${id}/toggle`);
    };

    const handleDelete = (id: number) => {
        setConfirmDeleteId(id);
    };

    const calcDiscount = (orig: string | number, disc: string | number) => {
        const o = Number(orig);
        const d = Number(disc);
        if (o > 0 && d > 0 && o > d) {
            return Math.round(((o - d) / o) * 100);
        }
        return 0;
    };

    return (
        <>
            <Head title="العروض والخصومات — بوابة المطعم — فطرنا" />
            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-orange-100/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl shadow-orange-500/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                                    عروض وخصومات المطعم
                                </h1>
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
                                    {items.length} عرض متاح
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                                أضف عروضاً ترويجية حصرية وصوراً جذابة مع إمكانية تخصيص عروض لطلاب الجامعات المعتمدين 🎓
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                createForm.reset();
                                setCreateImagePreview(null);
                                setShowCreateModal(true);
                            }}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition flex items-center gap-2 shrink-0 hover:scale-102"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إنشاء عرض جديد</span>
                        </button>
                    </div>
                </div>

                {/* Offers Grid */}
                {items.length === 0 ? (
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-orange-100/80 dark:border-stone-800 p-12 text-center shadow-xl shadow-orange-500/5">
                        <div className="w-16 h-16 rounded-3xl bg-orange-100 dark:bg-stone-800 flex items-center justify-center text-orange-500 mx-auto mb-4">
                            <Tag className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-black text-stone-900 dark:text-white mb-1">لا توجد عروض ترويجية بعد</h3>
                        <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
                            العروض والخصومات تزيد من مبيعات مطعمك وتظهر لآلاف الطلاب والزبائن على الصفحة الرئيسية.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 rounded-2xl bg-orange-600 text-white font-black text-xs shadow-md hover:bg-orange-700 transition"
                        >
                            إنشاء أول عرض الآن
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((offer) => {
                            const discountPct = offer.discount_percentage ? Number(offer.discount_percentage).toFixed(0) : calcDiscount(offer.original_price, offer.discount_price);
                            const imgSrc = getOfferImageUrl(offer.image);

                            return (
                                <div 
                                    key={offer.id} 
                                    className={`group relative flex flex-col bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 ${
                                        offer.is_active 
                                            ? 'border-orange-100/80 dark:border-stone-800' 
                                            : 'border-stone-200 dark:border-stone-800 opacity-75'
                                    }`}
                                >
                                    {/* Image Banner */}
                                    <div className="relative w-full h-48 overflow-hidden bg-stone-100 dark:bg-stone-950">
                                        <img
                                            src={imgSrc}
                                            alt={offer.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                                        {/* Discount Badge */}
                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-1">
                                            <Percent className="w-3.5 h-3.5" />
                                            <span>خصم {discountPct}%</span>
                                        </div>

                                        {/* Student-Only Badge */}
                                        {offer.is_student_only && (
                                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-2xl bg-blue-600/90 backdrop-blur-md text-white font-black text-[10px] shadow-lg flex items-center gap-1 border border-blue-400/30">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                <span>حصري للطلاب 🎓</span>
                                            </div>
                                        )}

                                        {/* Price overlay */}
                                        <div className="absolute bottom-3 right-3 flex items-baseline gap-2 bg-stone-950/85 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/10 text-white">
                                            <span className="text-base font-black text-amber-400">{offer.discount_price} ج.م</span>
                                            <span className="text-xs text-stone-400 line-through">{offer.original_price} ج.م</span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-base font-black text-stone-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {offer.title}
                                            </h3>
                                            {offer.description && (
                                                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                                                    {offer.description}
                                                </p>
                                            )}

                                            {offer.start_date && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 pt-1">
                                                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                                                    <span>
                                                        صالح حتى: {offer.end_date ? new Date(offer.end_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => handleToggle(offer.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                                    offer.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                                                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${offer.is_active ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                                                <span>{offer.is_active ? 'العرض نشط' : 'متوقف'}</span>
                                            </button>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(offer)}
                                                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 transition"
                                                    title="تعديل العرض والصورة"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(offer.id)}
                                                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                                                    title="حذف العرض"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Offer Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-xl p-6 sm:p-8 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    إنشاء عرض ترويجي جديد
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">ارفع صورة مميزة وحدد السعر قبل وبعد الخصم</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            {/* Offer Image Dropzone */}
                            <div>
                                <label className="block text-xs font-black mb-1.5">صورة العرض الترويجي (بانر جذاب)</label>
                                <input
                                    type="file"
                                    ref={createFileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            createForm.setData('image', file);
                                            setCreateImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />

                                {createImagePreview ? (
                                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-orange-500/50 group bg-stone-100 dark:bg-stone-800">
                                        <img src={createImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => createFileInputRef.current?.click()}
                                                className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-black"
                                            >
                                                تغيير الصورة
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    createForm.setData('image', null);
                                                    setCreateImagePreview(null);
                                                }}
                                                className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black"
                                            >
                                                إزالة
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => createFileInputRef.current?.click()}
                                        className="w-full h-36 rounded-2xl border-2 border-dashed border-orange-300 dark:border-stone-700 hover:border-orange-500 bg-orange-50/30 dark:bg-stone-800/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition p-4 text-center"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-stone-700 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-black text-stone-800 dark:text-stone-200">اضغط لرفع صورة العرض الترويجي</span>
                                        <span className="text-[10px] text-stone-400">PNG, JPG, WEBP بحد أقصى 10MB</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-1.5">عنوان العرض *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="مثال: عرض الغداء الجامعي — 3 ساندوتشات + كانز هدية"
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black mb-1.5">السعر الأصلي (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={createForm.data.original_price}
                                        onChange={(e) => createForm.setData('original_price', e.target.value)}
                                        placeholder="مثال: 60"
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1.5">سعر العرض بعد الخصم (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={createForm.data.discount_price}
                                        onChange={(e) => createForm.setData('discount_price', e.target.value)}
                                        placeholder="مثال: 45"
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Discount preview */}
                            {createForm.data.original_price && createForm.data.discount_price && (
                                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-200">
                                    <span>نسبة التخفيض للزبون:</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-black">
                                        خصم {calcDiscount(createForm.data.original_price, createForm.data.discount_price)}% (توفير {(Number(createForm.data.original_price) - Number(createForm.data.discount_price)).toFixed(1)} ج.م)
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black mb-1.5">الوصف التفصيلي للعرض</label>
                                <textarea
                                    rows={2}
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="اكتب تفاصيل العرض وما يشمله لجذب العملاء..."
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500 resize-none"
                                />
                            </div>

                            {/* Student-Only Option */}
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_student_only}
                                        onChange={(e) => createForm.setData('is_student_only', e.target.checked)}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                                            <GraduationCap className="w-4 h-4 text-blue-600" />
                                            عرض مخصص للطلاب فقط (كارنيه جامعي معتمد)
                                        </span>
                                        <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                                            لن يظهر هذا الخصم إلا للطلاب الذين تم رفع بطاقتهم واعتمادها من الإدارة.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
                                >
                                    {createForm.processing ? 'جاري النشر...' : 'نشر العرض'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="py-3.5 px-6 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs font-black hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Offer Modal */}
            {editingOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setEditingOffer(null)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-xl p-6 sm:p-8 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    تعديل العرض والصورة
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">{editingOffer.title}</p>
                            </div>
                            <button onClick={() => setEditingOffer(null)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Offer Image Dropzone */}
                            <div>
                                <label className="block text-xs font-black mb-1.5">صورة العرض الترويجي</label>
                                <input
                                    type="file"
                                    ref={editFileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            editForm.setData('image', file);
                                            setEditImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />

                                <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-orange-500/40 group bg-stone-100 dark:bg-stone-800">
                                    <img 
                                        src={editImagePreview || getOfferImageUrl(editingOffer.image)} 
                                        alt="Offer" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => editFileInputRef.current?.click()}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>اختيار صورة جديدة</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-1.5">عنوان العرض *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black mb-1.5">السعر الأصلي (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={editForm.data.original_price}
                                        onChange={(e) => editForm.setData('original_price', e.target.value)}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1.5">سعر العرض بعد الخصم (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={editForm.data.discount_price}
                                        onChange={(e) => editForm.setData('discount_price', e.target.value)}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-1.5">الوصف التفصيلي للعرض</label>
                                <textarea
                                    rows={2}
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500 resize-none"
                                />
                            </div>

                            {/* Student-Only Option */}
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_student_only}
                                        onChange={(e) => editForm.setData('is_student_only', e.target.checked)}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                                            <GraduationCap className="w-4 h-4 text-blue-600" />
                                            عرض مخصص للطلاب فقط (كارنيه جامعي معتمد)
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
                                >
                                    {editForm.processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingOffer(null)}
                                    className="py-3.5 px-6 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs font-black hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={confirmDeleteId !== null}
                message="هل أنت متأكد من حذف هذا العرض الترويجي؟ لن تتمكن من استعادته."
                onConfirm={() => { if (confirmDeleteId) router.delete(`/restaurant/offers/${confirmDeleteId}`); setConfirmDeleteId(null); }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </>
    );
}
