import React, { useState, useEffect } from 'react';
import { MenuItem, MenuItemAddon, Restaurant } from '../Types';
import { useCartStore } from '../Stores/cartStore';
import { Plus, Minus, ShoppingCart, Heart, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface FoodCardProps {
  food: MenuItem;
  restaurant: Restaurant;
  studentDiscountPercent?: number;
}

const QUICK_FOOD_NOTES = [
  'طحينة زيادة',
  'منغير سلطة',
  'بدون شطة',
  'شطة زيادة',
  'ليمون زيادة',
  'العيش محمص',
];

export default function FoodCard({ food, restaurant, studentDiscountPercent = 0 }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ optionName: string; valueName: string; price: number }[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const { addItem } = useCartStore();

  const basePrice = Number(food.effective_price ?? food.discount_price ?? food.price);

  const handleToggleNote = (preset: string) => {
    setNotes((prev) => {
      const parts = prev.split(/[,،]+/).map((s) => s.trim()).filter(Boolean);
      if (parts.includes(preset)) return parts.filter((p) => p !== preset).join('، ');
      return [...parts, preset].join('، ');
    });
    if (!showNotes) setShowNotes(true);
  };

  const handleAdd = () => {
    addItem(food, restaurant, quantity, selectedOptions, selectedAddons, notes);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setNotes('');
      setShowNotes(false);
    }, 1500);
  };

  const imageSrc = food.image || '/images/sandwich-foul.jpg';

  return (
    <div className="group relative flex flex-col bg-white dark:bg-stone-800/90 rounded-3xl overflow-hidden border border-orange-100/80 dark:border-stone-700/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
      {/* Food Image & Badges */}
      <div className="relative w-full h-48 overflow-hidden bg-stone-100 dark:bg-stone-900">
        <img
          src={imageSrc}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Category Badge */}
        {food.category?.name && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-orange-600/90 text-white backdrop-blur-md shadow-md">
            {food.category.name}
          </span>
        )}

        {/* Price Tag */}
        {basePrice > 0 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-black shadow-md">
            {basePrice} ج.م
          </div>
        )}

        {/* Discount Badge */}
        {food.discount_price && food.discount_price < food.price && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-red-500 text-white text-[10px] font-black">
            خصم!
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-5 justify-between gap-3">
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
              {food.name}
            </h3>
            {food.description && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                {food.description}
              </p>
            )}
          </div>

          {/* Price Row */}
          {food.discount_price && food.discount_price < food.price ? (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-base font-black text-orange-600 dark:text-orange-400">{food.effective_price} ج.م</span>
              <span className="text-xs text-stone-400 line-through">{food.price} ج.م</span>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2.5 border-t border-stone-100 dark:border-stone-700/50">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-stone-100 dark:bg-stone-900/60 p-1 rounded-2xl">
            <button
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-sm text-stone-800 dark:text-stone-100 px-3">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Note Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                <span>{notes ? `ملاحظة: ${notes.slice(0, 20)}...` : 'ملاحظة خاصة بالطلب'}</span>
                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {notes && (
                <button type="button" onClick={() => setNotes('')} className="text-[10px] text-stone-400 hover:text-red-500 font-bold">
                  مسح
                </button>
              )}
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1">
              {QUICK_FOOD_NOTES.slice(0, showNotes ? 6 : 3).map((preset) => {
                const isSelected = notes.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleToggleNote(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-stone-100 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{preset}
                  </button>
                );
              })}
            </div>

            {showNotes && (
              <input
                type="text"
                placeholder="مثال: طحينة زيادة، منغير سلطة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-orange-200 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500"
              />
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة بنجاح</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
