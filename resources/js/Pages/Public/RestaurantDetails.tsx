import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Restaurant, Category, MenuItem, MenuItemAddon } from '../../Types';
import { useCartStore } from '../../Stores/cartStore';
import CategoryIcon from '../../Components/CategoryIcon';
import FoodCard from '../../Components/FoodCard';
import {
    MapPin, Phone, GraduationCap, Search, Heart, Sparkles,
    Store, ArrowRight, ShoppingBag, UtensilsCrossed, X, Check,
    AlertTriangle, Plus, Minus, Tag, Info
} from 'lucide-react';

interface RestaurantDetailsProps {
    restaurant: Restaurant;
}

export default function RestaurantDetails({ restaurant }: RestaurantDetailsProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<{ [optionId: number]: { name: string; value: string; price: number } }>({});
    const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
    const [itemNotes, setItemNotes] = useState('');
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingItemToAdd, setPendingItemToAdd] = useState<{
        item: MenuItem;
        quantity: number;
        options: { optionName: string; valueName: string; price: number }[];
        addons: MenuItemAddon[];
        notes: string;
    } | null>(null);

    const { addItem, clearCart, items: cartItems, restaurant: cartRestaurant, getTotal, getItemCount } = useCartStore();

    const categories = restaurant.categories || [];

    const allItems: MenuItem[] = useMemo(() => {
        const items: MenuItem[] = [];
        categories.forEach(cat => {
            if (cat.menu_items) items.push(...cat.menu_items);
        });
        return items;
    }, [categories]);

    const filteredItems = useMemo(() => {
        let items = selectedCategoryId === 'all' ? allItems : allItems.filter(item => item.category_id === selectedCategoryId);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(q) ||
                (item.description && item.description.toLowerCase().includes(q))
            );
        }
        return items;
    }, [allItems, selectedCategoryId, searchQuery]);

    const openItemModal = (item: MenuItem) => {
        setSelectedItem(item);
        setModalQuantity(1);
        setItemNotes('');
        setSelectedAddons([]);
        const initialOpts: { [key: number]: { name: string; value: string; price: number } } = {};
        if (item.options) {
            item.options.forEach(opt => {
                if (opt.values && opt.values.length > 0) {
                    initialOpts[opt.id] = { name: opt.name, value: opt.values[0].name, price: Number(opt.values[0].price || 0) };
                }
            });
        }
        setSelectedOptions(initialOpts);
    };

    const handleAddToCartFromModal = () => {
        if (!selectedItem) return;
        const optionsArray = Object.values(selectedOptions).map(o => ({ optionName: o.name, valueName: o.value, price: o.price }));
        const success = addItem(selectedItem, restaurant, modalQuantity, optionsArray, selectedAddons, itemNotes);
        if (!success) {
            setPendingItemToAdd({ item: selectedItem, quantity: modalQuantity, options: optionsArray, addons: selectedAddons, notes: itemNotes });
            setShowConflictModal(true);
        }
        setSelectedItem(null);
    };

    const confirmClearAndAdd = () => {
        if (pendingItemToAdd) {
            clearCart();
            addItem(pendingItemToAdd.item, restaurant, pendingItemToAdd.quantity, pendingItemToAdd.options, pendingItemToAdd.addons, pendingItemToAdd.notes);
            setPendingItemToAdd(null);
        }
        setShowConflictModal(false);
    };

    const toggleAddon = (addon: MenuItemAddon) => {
        if (selectedAddons.some(a => a.id === addon.id)) {
            setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
        } else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };

    const currentModalUnitPrice = selectedItem
        ? Number(selectedItem.effective_price ?? selectedItem.discount_price ?? selectedItem.price) +
          Object.values(selectedOptions).reduce((s, o) => s + o.price, 0) +
          selectedAddons.reduce((s, a) => s + Number(a.price || 0), 0)
        : 0;

    const cartCount = getItemCount();
    const cartTotal = getTotal();
    const imageSrc = restaurant.cover_image || restaurant.logo || '/images/sandwich-foul.jpg';

    return (
        <GuestLayout>
            <Head title={`${restaurant.name} — قائمة الطعام والطلب أونلاين`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Back Button */}
                <Link
                    href="/restaurants"
                    className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 font-semibold transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                    العودة لقائمة المطاعم
                </Link>

                {/* Restaurant Hero */}
                <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg">
                    {/* Background image */}
                    <div className="relative h-44 sm:h-56">
                        <img
                            src={imageSrc}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 right-4 sm:right-6 text-white">
                            <h1 className="text-2xl sm:text-3xl font-black">{restaurant.name}</h1>
                            {restaurant.description && (
                                <p className="text-sm text-white/80 mt-1 max-w-sm">{restaurant.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Info Bar */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-stone-900">
                        {restaurant.address && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                {restaurant.address}
                            </div>
                        )}
                        {restaurant.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                                <Phone className="w-3.5 h-3.5 text-orange-500" />
                                {restaurant.phone}
                            </div>
                        )}
                        <div className="mr-auto flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                            {allItems.length} صنف متاح
                        </div>

                        {/* Student Discount Banner */}
                        {restaurant.student_discount_percentage > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-black">
                                <GraduationCap className="w-4 h-4 text-orange-500" />
                                <span>خصم خاص للطلاب المعتمدين: {restaurant.student_discount_percentage}% على جميع الأصناف 🎓</span>
                            </div>
                        )}

                        {/* Cart quick access */}
                        {cartCount > 0 && (
                            <Link
                                href="/cart"
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                السلة ({cartCount}) — {cartTotal.toFixed(1)} ج.م
                            </Link>
                        )}
                    </div>
                </div>

                {/* INACTIVE RESTAURANT BANNER */}
                {restaurant.status !== 'ACTIVE' && (
                    <div className="p-5 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3.5">
                        <AlertTriangle className="w-7 h-7 shrink-0 text-red-500" />
                        <div>
                            <h3 className="font-black text-sm">هذا المطعم غير نشط حالياً</h3>
                            <p className="text-xs text-red-500/80 mt-0.5">
                                المطعم متوقف مؤقتاً عن استقبال الطلبات عبر المنصة. يمكنك استعراض الأصناف والأسعار فقط دون إمكانية الطلب.
                            </p>
                        </div>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                        <input
                            type="text"
                            placeholder={`ابحث في منيو ${restaurant.name}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-11 pl-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3 text-xs text-stone-400 hover:text-stone-600">مسح</button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <span className="text-xs font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-xl">
                            {filteredItems.length} صنف
                        </span>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategoryId('all')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
                            selectedCategoryId === 'all'
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        الكل ({allItems.length})
                    </button>
                    {categories.filter(c => c.menu_items && c.menu_items.length > 0).map((cat) => {
                        const count = cat.menu_items?.length || 0;
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
                                    isSelected
                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                                }`}
                            >
                                <CategoryIcon slug={cat.slug} name={cat.name} className="w-4 h-4" />
                                {cat.name}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Foods Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
                        <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                        <p className="font-bold text-stone-700 dark:text-stone-300">لم نجد أصناف تطابق بحثك</p>
                        <button
                            onClick={() => { setSelectedCategoryId('all'); setSearchQuery(''); }}
                            className="mt-3 px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs"
                        >
                            إعادة تعيين الفلاتر
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredItems.map((food) => (
                            food.options && food.options.length > 0 ? (
                                // For items with options, use modal
                                <div
                                    key={food.id}
                                    onClick={() => openItemModal(food)}
                                    className="cursor-pointer"
                                >
                                    <FoodCard food={food} restaurant={restaurant} studentDiscountPercent={restaurant.student_discount_percentage} />
                                </div>
                            ) : (
                                <div key={food.id}>
                                    <FoodCard food={food} restaurant={restaurant} studentDiscountPercent={restaurant.student_discount_percentage} />
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* =========== ITEM OPTIONS MODAL =========== */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="relative max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 my-8 space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h3 className="text-base font-black text-stone-900 dark:text-white">{selectedItem.name}</h3>
                                <p className="text-xs text-stone-500 mt-0.5">اختر المواصفات والإضافات لطلبك</p>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Options */}
                        {selectedItem.options && selectedItem.options.map((opt) => (
                            <div key={opt.id} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                                    <span>{opt.name}</span>
                                    {opt.is_required && <span className="text-red-500 text-[10px]">* مطلوب</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {opt.values.map((val) => {
                                        const isSelected = selectedOptions[opt.id]?.value === val.name;
                                        return (
                                            <button
                                                key={val.id}
                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.id]: { name: opt.name, value: val.name, price: Number(val.price) } }))}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                    isSelected
                                                        ? 'bg-orange-500 text-white border-orange-500'
                                                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-400'
                                                }`}
                                            >
                                                <span>{val.name}</span>
                                                {val.price > 0 && <span className={isSelected ? 'text-white' : 'text-orange-600'}>+{val.price} ج.م</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Addons */}
                        {selectedItem.addons && selectedItem.addons.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">الإضافات (اختياري):</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedItem.addons.map((addon) => {
                                        const isSelected = selectedAddons.some(a => a.id === addon.id);
                                        return (
                                            <button
                                                key={addon.id}
                                                onClick={() => toggleAddon(addon)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                    isSelected
                                                        ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500'
                                                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-300'
                                                }`}
                                            >
                                                <span>{addon.name}</span>
                                                <span className="text-orange-600 dark:text-orange-400">+{addon.price} ج.م</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                ملاحظة خاصة (اختياري):
                            </label>
                            <input
                                type="text"
                                placeholder="مثال: طحينة زيادة، بدون شطة..."
                                value={itemNotes}
                                onChange={(e) => setItemNotes(e.target.value)}
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl gap-2">
                                <button
                                    onClick={() => setModalQuantity(q => (q > 1 ? q - 1 : 1))}
                                    className="w-8 h-8 rounded-xl bg-white dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-orange-600"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 font-black text-stone-800 dark:text-white">{modalQuantity}</span>
                                <button
                                    onClick={() => setModalQuantity(q => q + 1)}
                                    className="w-8 h-8 rounded-xl bg-white dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-orange-600"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                                {(currentModalUnitPrice * modalQuantity).toFixed(2)} ج.م
                            </span>
                        </div>

                        {/* Confirm Button */}
                        {restaurant.status === 'ACTIVE' ? (
                            <button
                                onClick={handleAddToCartFromModal}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all active:scale-98"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>أضف للسلة — {(currentModalUnitPrice * modalQuantity).toFixed(2)} ج.م</span>
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full py-3.5 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                                <span>المطعم غير نشط حالياً ولا يستقبل طلبات</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* =========== CONFLICT MODAL =========== */}
            {showConflictModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-sm w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-base font-black text-stone-900 dark:text-white">تعارض في السلة</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                السلة تحتوي على طلب من مطعم آخر ({cartRestaurant?.name}). هل تريد مسح السلة والبدء بطلب جديد من {restaurant.name}؟
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setShowConflictModal(false); setPendingItemToAdd(null); }}
                                className="flex-1 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmClearAndAdd}
                                className="flex-[2] py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                نعم، مسح البدء من جديد
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
