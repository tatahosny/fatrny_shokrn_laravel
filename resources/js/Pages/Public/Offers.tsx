import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Offer, PaginatedResponse } from '../../Types';
import { Sparkles, Store, Tag, Clock, ArrowRight, Percent } from 'lucide-react';

interface OffersProps {
    offers: PaginatedResponse<Offer>;
}

export default function Offers({ offers }: OffersProps) {
    const items = offers?.data || [];

    return (
        <GuestLayout>
            <Head title="العروض الحصرية وخصومات الطلاب — فطرنا شكراً" />

            <div className="bg-gradient-to-b from-orange-50 to-white dark:from-stone-900 dark:to-stone-950 py-10 border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-orange-600 dark:text-orange-400 tracking-wider mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>عروض اليوم الخاصة</span>
                    </div>
                    <h1 className="text-3xl font-black text-stone-900 dark:text-white">
                        عروض الإفطار والوجبات السريعة
                    </h1>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                        خصومات حقيقية ومجموعات وجبات متكاملة بأفضل الأسعار لطلاب وسكان برج العرب
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {items.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
                        <Tag className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-1">
                            لا توجد عروض منشورة في الوقت الحالي
                        </h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                            تابعنا دائماً وتصفح المطاعم للاستفادة من خصم كارنيه الطلاب التلقائي!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((offer) => (
                            <div 
                                key={offer.id} 
                                className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between hover:shadow-xl hover:border-orange-500/50 transition-all duration-200 group"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        {offer.restaurant && (
                                            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                                                <Store className="w-3.5 h-3.5 text-orange-500" />
                                                {offer.restaurant.name}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            {offer.is_student_only && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                                                    🎓 حصري للطلاب
                                                </span>
                                            )}
                                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-xs shadow-xs">
                                                خصم {Number(offer.discount_percentage || 0).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-stone-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                                        {offer.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                                        {offer.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between mt-2">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                                                {offer.discount_price} ج.م
                                            </span>
                                            {offer.original_price > offer.discount_price && (
                                                <span className="text-xs text-stone-400 line-through">
                                                    {offer.original_price} ج.م
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {offer.restaurant && (
                                        <Link
                                            href={`/restaurant/${offer.restaurant.slug}`}
                                            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow transition flex items-center gap-1"
                                        >
                                            <span>طلب العرض</span>
                                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
