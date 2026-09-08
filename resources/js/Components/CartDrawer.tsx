import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useCartStore } from '../Stores/cartStore';
import { SharedInertiaProps } from '../Types';
import {
    X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CheckCircle2,
    User, Lock, LogIn, Sparkles, Check, GraduationCap
} from 'lucide-react';

const QUICK_NOTES = [
    'طحينة زيادة',
    'بدون شطة',
    'شطة زيادة',
    'ليمون زيادة',
    'كاتشب إضافي',
    'بدون مخلل',
    'العيش محمص',
];

export default function CartDrawer() {
    const { auth } = usePage<SharedInertiaProps>().props;
    const {
        items,
        restaurant,
        isCartOpen,
        closeCart,
        updateQuantity,
        removeItem,
        clearCart,
        getSubtotal,
        getStudentDiscountAmount,
        getDeliveryFee,
        getTotal,
        getItemCount,
        studentDiscountPercentage,
    } = useCartStore();

    if (!isCartOpen) return null;

    const itemCount = getItemCount();
    const subtotal = getSubtotal();
    const studentDiscount = getStudentDiscountAmount();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    const handleCheckoutRedirect = () => {
        closeCart();
        router.visit('/cart');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
            {/* Backdrop with transition */}
            <div
                onClick={closeCart}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            />

            <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
                <div className="w-screen max-w-md bg-white dark:bg-stone-900 shadow-2xl flex flex-col justify-between border-r border-stone-200 dark:border-stone-800 transition-all duration-300">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/60">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    عربة التسوق
                                </h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    إجمالي الأصناف: <span className="font-bold text-orange-600">{itemCount}</span>
                                </p>
                                {restaurant && (
                                    <p className="text-[11px] text-orange-600 dark:text-orange-400 font-black mt-0.5">
                                        🍽 طلب من: {restaurant.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {items.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                    title="تفريغ السلة"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>مسح</span>
                                </button>
                            )}
                            <button
                                onClick={closeCart}
                                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body: Items List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                                <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                                    <ShoppingBag className="w-10 h-10 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                                        عربتك فارغة حالياً
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                                        اختار وجباتك المفضلة من مطاعم الجامعة وأضفها إلى السلة لتأكيد طلبك
                                    </p>
                                </div>
                                <Link
                                    href="/restaurants"
                                    onClick={closeCart}
                                    className="px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all active:scale-95"
                                >
                                    تصفح المطاعم الآن
                                </Link>
                            </div>
                        ) : (
                            items.map((item) => {
                                const { id, menuItem, quantity, unitPrice, totalPrice, notes: itemNote, selectedOptions } = item;
                                const img = menuItem.image || '/images/sandwich-foul.jpg';

                                return (
                                    <div key={id} className="pt-4 first:pt-0 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                                                <img
                                                    src={img}
                                                    alt={menuItem.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">
                                                    {menuItem.name}
                                                </h4>
                                                
                                                {selectedOptions && selectedOptions.length > 0 && (
                                                    <p className="text-[10px] text-stone-400 truncate">
                                                        {selectedOptions.map((o) => `${o.optionName}: ${o.valueName}`).join(' • ')}
                                                    </p>
                                                )}

                                                <div className="text-xs text-orange-600 font-semibold mt-0.5">
                                                    {unitPrice > 0 ? `${unitPrice} ج.م` : 'مجاني'}
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                                                        <button
                                                            onClick={() => updateQuantity(id, quantity - 1)}
                                                            className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="px-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(id, quantity + 1)}
                                                            className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(id)}
                                                        className="text-stone-400 hover:text-red-500 p-1"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="font-black text-sm text-stone-800 dark:text-stone-200 shrink-0">
                                                {totalPrice.toFixed(1)} ج.م
                                            </div>
                                        </div>

                                        {itemNote && (
                                            <div className="text-[11px] bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/50">
                                                <span className="font-bold">ملاحظة:</span> {itemNote}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Checkout Summary */}
                    {items.length > 0 && (
                        <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 space-y-4">
                            
                            {!auth?.user && (
                                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800/90 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <p className="text-xs text-stone-600 dark:text-stone-300">
                                        سجل دخولك لتطبيق خصم الطلاب وتأكيد مكان الاستلام داخل الجامعة.
                                    </p>
                                </div>
                            )}

                            {studentDiscount > 0 && (
                                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                                        <span>خصم الطلاب ({studentDiscountPercentage}%):</span>
                                    </span>
                                    <span className="font-black text-emerald-600">
                                        -{studentDiscount.toFixed(1)} ج.م 🎓
                                    </span>
                                </div>
                            )}

                            <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                                <div className="flex justify-between">
                                    <span>المجموع الفرعي:</span>
                                    <span className="font-bold text-stone-800 dark:text-stone-200">{subtotal.toFixed(1)} ج.م</span>
                                </div>
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span>رسوم التوصيل للجامعة:</span>
                                        <span className="font-bold text-stone-800 dark:text-stone-200">{deliveryFee.toFixed(1)} ج.م</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-stone-800">
                                    <span>الإجمالي المطلوب:</span>
                                    <span className="text-base text-orange-600 dark:text-orange-400">{total.toFixed(1)} ج.م</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <button
                                    onClick={handleCheckoutRedirect}
                                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>متابعة الطلب وتحديد الموقع داخل الجامعة 🚀</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
