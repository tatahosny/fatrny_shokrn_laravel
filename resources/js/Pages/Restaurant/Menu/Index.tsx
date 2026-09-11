import React, { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Restaurant, MenuItem, Category, PaginatedResponse } from '../../../Types';
import { 
    Utensils, 
    Plus, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Search, 
    Upload, 
    Clock, 
    Sparkles, 
    LayoutGrid, 
    Table as TableIcon,
    Camera,
    Flame,
    X
} from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';

interface MenuIndexProps {
    menu_items: PaginatedResponse<MenuItem>;
    categories: Category[];
    restaurant: Restaurant;
}

export default function Index({ menu_items, categories = [], restaurant }: MenuIndexProps) {
    const items = menu_items?.data || [];
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [quickImageItem, setQuickImageItem] = useState<MenuItem | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Create item form
    const createForm = useForm({
        name: '',
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        price: '',
        discount_price: '',
        description: '',
        is_available: true,
        is_featured: false,
        preparation_time: 10,
        image: null as File | null,
    });
    const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
    const createFileInputRef = useRef<HTMLInputElement>(null);

    // Edit item form
    const editForm = useForm({
        name: '',
        category_id: '',
        price: '',
        discount_price: '',
        description: '',
        is_available: true,
        is_featured: false,
        preparation_time: 10,
        image: null as File | null,
    });
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    // Quick Image form
    const quickImageForm = useForm({
        image: null as File | null,
    });
    const [quickImagePreview, setQuickImagePreview] = useState<string | null>(null);
    const quickFileInputRef = useRef<HTMLInputElement>(null);

    const getItemImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return '/images/sandwich-foul.jpg';
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) return imagePath;
        return `/storage/${imagePath}`;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/restaurant/menu', {
            forceFormData: true,
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                setCreateImagePreview(null);
            }
        });
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        editForm.setData({
            name: item.name,
            category_id: String(item.category_id),
            price: String(item.price),
            discount_price: item.discount_price ? String(item.discount_price) : '',
            description: item.description || '',
            is_available: item.is_available,
            is_featured: item.is_featured,
            preparation_time: item.preparation_time || 10,
            image: null,
        });
        setEditImagePreview(getItemImageUrl(item.image));
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        router.post(`/restaurant/menu/${editingItem.id}`, {
            _method: 'PUT',
            ...editForm.data,
        }, {
            forceFormData: true,
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
                setEditImagePreview(null);
            }
        });
    };

    const openQuickImageModal = (item: MenuItem) => {
        setQuickImageItem(item);
        quickImageForm.setData({ image: null });
        setQuickImagePreview(getItemImageUrl(item.image));
    };

    const handleQuickImageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickImageItem || !quickImageForm.data.image) return;

        router.post(`/restaurant/menu/${quickImageItem.id}`, {
            _method: 'PUT',
            name: quickImageItem.name,
            category_id: quickImageItem.category_id,
            price: quickImageItem.price,
            discount_price: quickImageItem.discount_price || '',
            description: quickImageItem.description || '',
            is_available: quickImageItem.is_available,
            is_featured: quickImageItem.is_featured,
            preparation_time: quickImageItem.preparation_time || 10,
            image: quickImageForm.data.image,
        }, {
            forceFormData: true,
            onSuccess: () => {
                setQuickImageItem(null);
                quickImageForm.reset();
                setQuickImagePreview(null);
            }
        });
    };

    const handleToggleAvailable = (id: number) => {
        router.post(`/restaurant/menu/${id}/toggle-availability`);
    };

    const handleDelete = (id: number) => {
        setConfirmDeleteId(id);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = selectedCat === 'ALL' || item.category_id === Number(selectedCat);
        return matchesSearch && matchesCat;
    });

    return (
        <Head title="إدارة المنيو — بوابة المطعم" />

            <div className="space-y-6">
                {/* Header card */}
                <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-orange-100/80 dark:border-stone-800 p-6 shadow-xl shadow-orange-500/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-orange-100/60 dark:border-stone-800">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                                    أصناف وقائمة الطعام
                                </h1>
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                                    {items.length} صنف متاح
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                عدّل صور الوجبات، الأسعار، العروض، وتحكم في توفر الأصناف في مطبخك بنقرة زر
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View Switch */}
                            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                                        viewMode === 'grid' 
                                            ? 'bg-white dark:bg-stone-700 text-orange-600 shadow-xs' 
                                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                                    }`}
                                    title="عرض شبكي (كروت مع صور)"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="hidden sm:inline">كروت</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                                        viewMode === 'table' 
                                            ? 'bg-white dark:bg-stone-700 text-orange-600 shadow-xs' 
                                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                                    }`}
                                    title="عرض جدول مضغوط"
                                >
                                    <TableIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">جدول</span>
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    createForm.reset();
                                    setCreateImagePreview(null);
                                    setShowCreateModal(true);
                                }}
                                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center gap-2 shrink-0 hover:scale-102"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إضافة صنف جديد</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter / Search Bar */}
                    <div className="pt-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-stone-400 absolute right-4 top-3.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث باسم الصنف أو المكونات أو الوصف..."
                                className="w-full pr-11 pl-4 py-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            <button
                                onClick={() => setSelectedCat('ALL')}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border ${
                                    selectedCat === 'ALL'
                                        ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20'
                                        : 'bg-stone-50 dark:bg-stone-800/70 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                                }`}
                            >
                                الكل ({items.length})
                            </button>
                            {categories.map((c) => {
                                const count = items.filter(i => i.category_id === c.id).length;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCat(String(c.id))}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border ${
                                            selectedCat === String(c.id)
                                                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20'
                                                : 'bg-stone-50 dark:bg-stone-800/70 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                                        }`}
                                    >
                                        {c.name} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Items Presentation */}
                {filteredItems.length === 0 ? (
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-orange-100/80 dark:border-stone-800 p-12 text-center shadow-xl shadow-orange-500/5">
                        <div className="w-16 h-16 rounded-3xl bg-orange-100 dark:bg-stone-800 flex items-center justify-center text-orange-500 mx-auto mb-4">
                            <Utensils className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-black text-stone-900 dark:text-white mb-1">لم يتم العثور على أي أصناف</h3>
                        <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
                            جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً، أو أضف وجبات جديدة إلى منيو المطعم.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 rounded-2xl bg-orange-600 text-white font-black text-xs shadow-md hover:bg-orange-700 transition"
                        >
                            إضافة صنف الآن
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Dynamic Grid View with Photos and Controls */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => {
                            const imgSrc = getItemImageUrl(item.image);
                            const basePrice = Number(item.discount_price && item.discount_price > 0 ? item.discount_price : item.price);
                            const hasDiscount = item.discount_price && Number(item.discount_price) < Number(item.price);

                            return (
                                <div 
                                    key={item.id} 
                                    className={`group relative flex flex-col bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 ${
                                        item.is_available 
                                            ? 'border-orange-100/80 dark:border-stone-800' 
                                            : 'border-red-200 dark:border-red-950/60 opacity-80'
                                    }`}
                                >
                                    {/* Image & Badges */}
                                    <div className="relative w-full h-44 overflow-hidden bg-stone-100 dark:bg-stone-950">
                                        <img
                                            src={imgSrc}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                        {/* Category Badge */}
                                        {item.category?.name && (
                                            <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black bg-stone-950/80 text-orange-400 backdrop-blur-md border border-white/10 shadow-md">
                                                {item.category.name}
                                            </span>
                                        )}

                                        {/* Featured Tag */}
                                        {item.is_featured && (
                                            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md flex items-center gap-1">
                                                <Flame className="w-3 h-3" />
                                                مميز
                                            </span>
                                        )}

                                        {/* Change Image Button on Hover */}
                                        <button
                                            onClick={() => openQuickImageModal(item)}
                                            className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 text-[10px] font-black backdrop-blur-md shadow-md hover:bg-orange-600 hover:text-white transition flex items-center gap-1"
                                            title="تغيير صورة الطبق"
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                            <span>تعديل الصورة</span>
                                        </button>

                                        {/* Price overlay */}
                                        <div className="absolute bottom-3 right-3 flex items-baseline gap-1.5 bg-stone-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-white">
                                            <span className="text-sm font-black text-amber-400">{basePrice} ج.م</span>
                                            {hasDiscount && (
                                                <span className="text-[10px] text-stone-400 line-through">{item.price} ج.م</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-base font-black text-stone-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            {item.description ? (
                                                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-stone-400 italic">بدون وصف إضافي</p>
                                            )}

                                            {item.preparation_time && (
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 pt-1">
                                                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                                                    <span>تجهيز: {item.preparation_time} دقيقة</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => handleToggleAvailable(item.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                                    item.is_available
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                                                        : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                <span>{item.is_available ? 'متوفر' : 'غير متوفر'}</span>
                                            </button>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 transition"
                                                    title="تعديل الصنف والسعر"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                                                    title="حذف الصنف"
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
                ) : (
                    /* Table View */
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-orange-100/80 dark:border-stone-800 overflow-hidden shadow-xl shadow-orange-500/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold bg-stone-50/50 dark:bg-stone-800/30">
                                        <th className="py-4 px-6">الصنف والصورة</th>
                                        <th className="py-4 px-4">التصنيف</th>
                                        <th className="py-4 px-4">السعر</th>
                                        <th className="py-4 px-4">الخصم</th>
                                        <th className="py-4 px-4">حالة التوفر</th>
                                        <th className="py-4 px-6 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-bold">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-orange-50/30 dark:hover:bg-stone-800/50 transition">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative group w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                                                        <img 
                                                            src={getItemImageUrl(item.image)} 
                                                            alt={item.name} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
                                                        />
                                                        <button 
                                                            onClick={() => openQuickImageModal(item)}
                                                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                            title="تغيير الصورة"
                                                        >
                                                            <Camera className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-stone-900 dark:text-white text-sm">{item.name}</span>
                                                            {item.is_featured && (
                                                                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">مميز</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-stone-400 truncate max-w-xs font-normal">{item.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-stone-600 dark:text-stone-300">
                                                {item.category?.name || '—'}
                                            </td>
                                            <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                {item.price} ج.م
                                            </td>
                                            <td className="py-4 px-4 text-emerald-600 font-black">
                                                {item.discount_price ? `${item.discount_price} ج.م` : '—'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleToggleAvailable(item.id)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black transition ${
                                                        item.is_available
                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                                    }`}
                                                >
                                                    {item.is_available ? 'متوفر بالمطبخ' : 'غير متاح'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 rounded-xl text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-stone-800 transition"
                                                        title="تعديل الصنف"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-stone-800 transition"
                                                        title="حذف الصنف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Item Modal */}
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
                                    إضافة صنف ووجبة جديدة
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">ارفع صورة مميزة للصنف وحدد السعر والتصنيف</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            {/* Image Dropzone */}
                            <div>
                                <label className="block text-xs font-black mb-1.5">صورة الطبق / الوجبة</label>
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
                                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-orange-500/50 group bg-stone-100 dark:bg-stone-800">
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
                                        <span className="text-xs font-black text-stone-800 dark:text-stone-200">اضغط لرفع صورة الصنف من جهازك</span>
                                        <span className="text-[10px] text-stone-400">PNG, JPG, WEBP بحد أقصى 10MB</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-1.5">اسم الصنف أو الوجبة *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="مثال: ساندوتش فلافل محشية سوبر ميكس"
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black mb-1.5">التصنيف *</label>
                                    <select
                                        value={createForm.data.category_id}
                                        onChange={(e) => createForm.setData('category_id', e.target.value)}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1.5">وقت التجهيز المتوقع (بالدقائق)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={createForm.data.preparation_time}
                                        onChange={(e) => createForm.setData('preparation_time', Number(e.target.value))}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black mb-1.5">السعر الأصلي (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', e.target.value)}
                                        placeholder="مثال: 35"
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1.5">سعر الخصم / العرض (اختياري)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={createForm.data.discount_price}
                                        onChange={(e) => createForm.setData('discount_price', e.target.value)}
                                        placeholder="مثال: 30"
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-1.5">الوصف والمكونات</label>
                                <textarea
                                    rows={2}
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="اكتب تفاصيل ومكونات الوجبة لجذب الزبائن..."
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-6 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_available}
                                        onChange={(e) => createForm.setData('is_available', e.target.checked)}
                                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>متاح للطلب الآن</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_featured}
                                        onChange={(e) => createForm.setData('is_featured', e.target.checked)}
                                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>صنف مميز في واجهة المطعم</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
                                >
                                    {createForm.processing ? 'جاري الحفظ...' : 'حفظ الصنف'}
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

            {/* Edit Item Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setEditingItem(null)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-xl p-6 sm:p-8 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    تعديل بيانات الصنف والصورة
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">{editingItem.name}</p>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Image Dropzone */}
                            <div>
                                <label className="block text-xs font-black mb-1.5">صورة الصنف</label>
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
                                        src={editImagePreview || getItemImageUrl(editingItem.image)} 
                                        alt="Item" 
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
                                <label className="block text-xs font-black mb-1.5">اسم الصنف *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black mb-1.5">التصنيف *</label>
                                    <select
                                        value={editForm.data.category_id}
                                        onChange={(e) => editForm.setData('category_id', e.target.value)}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1.5">وقت التجهيز (دقائق)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editForm.data.preparation_time}
                                        onChange={(e) => editForm.setData('preparation_time', Number(e.target.value))}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black mb-1.5">السعر الأصلي (ج.م) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black mb-1.5">سعر الخصم (ج.م)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={editForm.data.discount_price}
                                        onChange={(e) => editForm.setData('discount_price', e.target.value)}
                                        placeholder="اختياري"
                                        className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-1.5">الوصف والمكونات</label>
                                <textarea
                                    rows={2}
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full p-3 text-xs font-bold rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-6 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_available}
                                        onChange={(e) => editForm.setData('is_available', e.target.checked)}
                                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>متاح للطلب</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_featured}
                                        onChange={(e) => editForm.setData('is_featured', e.target.checked)}
                                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>صنف مميز</span>
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
                                    onClick={() => setEditingItem(null)}
                                    className="py-3.5 px-6 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs font-black hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Image Upload Modal */}
            {quickImageItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setQuickImageItem(null)}
                    />
                    <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 animate-fade-in">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white">
                                    تغيير صورة الصنف
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">{quickImageItem.name}</p>
                            </div>
                            <button onClick={() => setQuickImageItem(null)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleQuickImageSubmit} className="space-y-4">
                            <input
                                type="file"
                                ref={quickFileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        quickImageForm.setData('image', file);
                                        setQuickImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />

                            <div 
                                onClick={() => quickFileInputRef.current?.click()}
                                className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-dashed border-orange-400 hover:border-orange-600 bg-stone-100 dark:bg-stone-800 cursor-pointer group flex items-center justify-center"
                            >
                                <img 
                                    src={quickImagePreview || getItemImageUrl(quickImageItem.image)} 
                                    alt="Item" 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 text-white p-4">
                                    <Upload className="w-6 h-6" />
                                    <span className="text-xs font-black">اضغط لاختيار صورة من جهازك</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={!quickImageForm.data.image || quickImageForm.processing}
                                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition disabled:opacity-40"
                                >
                                    {quickImageForm.processing ? 'جاري رفع الصورة...' : 'حفظ الصورة الجديدة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuickImageItem(null)}
                                    className="py-3.5 px-5 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs font-black hover:bg-stone-100 dark:hover:bg-stone-800 transition"
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
                message="هل أنت متأكد من حذف هذا الصنف من المنيو؟ لن تتمكن من استعادته."
                onConfirm={() => { if (confirmDeleteId) router.delete(`/restaurant/menu/${confirmDeleteId}`); setConfirmDeleteId(null); }}
                onCancel={() => setConfirmDeleteId(null)}
            />
    );
}
