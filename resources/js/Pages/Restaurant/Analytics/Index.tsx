import React from 'react';
import { Head } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Award } from 'lucide-react';

interface AnalyticsProps {
    daily_sales: {
        date: string;
        revenue: number;
        orders: number;
    }[];
    top_items: {
        name: string;
        qty: number;
        revenue: number;
    }[];
    avg_order_value: number;
    cancellation_rate: number;
}

export default function Index({ daily_sales = [], top_items = [], avg_order_value, cancellation_rate }: AnalyticsProps) {
    const total30DaysRevenue = daily_sales.reduce((sum, d) => sum + d.revenue, 0);
    const total30DaysOrders = daily_sales.reduce((sum, d) => sum + d.orders, 0);

    return (
        <RestaurantLayout title="تقارير المبيعات والأداء">
            <Head title="تقارير المبيعات — بوابة المطعم" />

            <div className="space-y-6">
                {/* Metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>مبيعات آخر 30 يوم</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {total30DaysRevenue.toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">إجمالي الإيراد الصافي</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>عدد الطلبات المكتملة</span>
                            <ShoppingBag className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {total30DaysOrders}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">خلال الشهر الأخير</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>متوسط قيمة الطلب (AOV)</span>
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {avg_order_value ? avg_order_value.toFixed(1) : 0} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">لكل فاتورة مستلمة</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>نسبة الإلغاء</span>
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {cancellation_rate}%
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">طلبات تم إلغاؤها</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Sales breakdown */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">
                            حركة المبيعات اليومية (آخر 15 يوماً)
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar text-xs">
                            {daily_sales.slice(-15).reverse().map((day) => (
                                <div key={day.date} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-stone-800 dark:text-stone-200 block">{day.date}</span>
                                        <span className="text-[11px] text-stone-400">{day.orders} طلبات مكتملة</span>
                                    </div>
                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                        {day.revenue.toFixed(1)} ج.م
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top items ranking */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <h2 className="text-base font-black text-stone-900 dark:text-white mb-4">
                            الأصناف الأكثر مساهمة في الأرباح
                        </h2>
                        {top_items.length === 0 ? (
                            <p className="text-xs text-stone-400 py-10 text-center">لا توجد بيانات كافية بعد.</p>
                        ) : (
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                                {top_items.map((item, idx) => (
                                    <div key={idx} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-stone-900 dark:text-white">{item.name}</h3>
                                                <p className="text-[11px] text-stone-400">{item.qty} قطعة مباعة</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-stone-900 dark:text-white">
                                            {item.revenue} ج.م
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RestaurantLayout>
    );
}
