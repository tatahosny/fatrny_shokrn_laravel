import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Restaurant, PaginatedResponse } from '../../Types';
import {
  Search,
  Store,
  Clock,
  GraduationCap,
  MapPin,
  Phone,
  UtensilsCrossed,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

interface RestaurantsProps {
  restaurants: PaginatedResponse<Restaurant> | Restaurant[];
}

export default function Restaurants({ restaurants }: RestaurantsProps) {
  const [search, setSearch] = useState('');

  const items = Array.isArray(restaurants)
    ? restaurants
    : (restaurants?.data || []);

  const filtered = items.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
      (r.address && r.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <GuestLayout>
      <Head title="المطاعم الشريكة في جامعة برج العرب — فطرني شكراً" />

      {/* Header */}
      <div className="bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-transparent dark:from-stone-900/80 dark:via-stone-950/40 dark:to-transparent py-12 border-b border-orange-100/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black">
              <Store className="w-4 h-4" />
              <span>المطاعم الشريكة — جامعة برج العرب</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
              اختار مطعمك المفضل 🍴
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
              اضغط على أي مطعم لاستعراض أصناف الإفطار، الأسعار والخصومات الطلابية، والطلب مباشرة!
            </p>

            {/* Search Input */}
            <div className="max-w-md mx-auto pt-4 relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو الصنف أو المنطقة..."
                className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl pr-11 pl-4 py-3 text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4">
            <Store className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-xl font-black text-stone-800 dark:text-stone-200">
              لا توجد مطاعم مطابقة لبحثك
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              جرب البحث باسم مطعم آخر أو تصفح كل المطاعم المتوفرة في المنصة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((restaurant) => {
              const discount = Number(restaurant.student_discount_percentage || 20);

              return (
                <div
                  key={restaurant.id}
                  className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-500/50 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative w-full h-48 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <img
                        src={restaurant.cover_image || restaurant.logo || '/images/sandwich-falafel.jpg'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Discount badge */}
                      {discount > 0 && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex items-center gap-1.5 border border-white/20">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>خصم للطلاب %{discount}</span>
                        </span>
                      )}

                      {/* Name in banner */}
                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <h3 className="text-xl font-black leading-tight drop-shadow-md">
                          {restaurant.name}
                        </h3>
                        {restaurant.address && (
                          <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span className="line-clamp-1">{restaurant.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-5 space-y-3">
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {restaurant.description || 'أفضل الوجبات والسندوتشات الطازجة يومياً بأعلى جودة لطلاب الجامعة.'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                        {restaurant.phone && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span dir="ltr">{restaurant.phone}</span>
                          </div>
                        )}
                        {restaurant.status === 'ACTIVE' ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            متاح للطلب الآن
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-red-600 dark:text-red-400 flex items-center gap-1 mr-auto bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            غير نشط
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Button */}
                  <div className="p-5 pt-0">
                    {restaurant.status === 'ACTIVE' ? (
                      <Link
                        href={`/restaurants/${restaurant.slug}`}
                        className="w-full py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>تصفح منيو المطعم واطلب الآن</span>
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700"
                      >
                        <span>المطعم غير نشط حالياً</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
