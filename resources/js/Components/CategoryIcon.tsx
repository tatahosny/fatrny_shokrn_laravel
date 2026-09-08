import React from 'react';
import {
  Utensils,
  UtensilsCrossed,
  Pizza,
  Coffee,
  Fish,
  Flame,
  Sparkles,
  ChefHat,
  SunMedium,
  Sandwich,
  Cake,
  Package,
  Drumstick,
  Soup,
  PlusCircle,
  Scale,
  Salad,
} from 'lucide-react';

interface CategoryIconProps {
  slug?: string;
  name?: string;
  className?: string;
}

export default function CategoryIcon({ slug, name, className = 'w-5 h-5' }: CategoryIconProps) {
  const identifier = (slug || name || '').toLowerCase();

  if (identifier.includes('box') || identifier.includes('بوكس')) return <Package className={className} />;
  if (identifier.includes('kilo') || identifier.includes('كيلو') || identifier.includes('وزن')) return <Scale className={className} />;
  if (identifier.includes('salad') || identifier.includes('سلط') || identifier.includes('مخلل')) return <Salad className={className} />;
  if (identifier.includes('helw') || identifier.includes('حلو') || identifier.includes('cake')) return <Cake className={className} />;
  if (identifier.includes('sandwich') || identifier.includes('سندوتش')) return <Sandwich className={className} />;
  if (identifier.includes('strip') || identifier.includes('استربس')) return <Drumstick className={className} />;
  if (identifier.includes('cheese') || identifier.includes('جبنة') || identifier.includes('soup') || identifier.includes('شوربة')) return <Soup className={className} />;
  if (identifier.includes('fries') || identifier.includes('بطاطس')) return <Flame className={className} />;
  if (identifier.includes('meal') || identifier.includes('وجبات') || identifier.includes('وجبة')) return <Utensils className={className} />;
  if (identifier.includes('addition') || identifier.includes('إضافات') || identifier.includes('اضافات')) return <PlusCircle className={className} />;
  if (identifier.includes('foul') || identifier.includes('falafel') || identifier.includes('فول') || identifier.includes('فلافل')) return <Utensils className={className} />;
  if (identifier.includes('pizza') || identifier.includes('بيتزا')) return <Pizza className={className} />;
  if (identifier.includes('crepe') || identifier.includes('كريب')) return <ChefHat className={className} />;
  if (identifier.includes('feteer') || identifier.includes('فطير')) return <SunMedium className={className} />;
  if (identifier.includes('shawarma') || identifier.includes('شاورما')) return <UtensilsCrossed className={className} />;
  if (identifier.includes('fish') || identifier.includes('فسيخ') || identifier.includes('رنجة')) return <Fish className={className} />;
  if (identifier.includes('drink') || identifier.includes('مشروب') || identifier.includes('شاي') || identifier.includes('قهوة')) return <Coffee className={className} />;

  return <Sparkles className={className} />;
}
