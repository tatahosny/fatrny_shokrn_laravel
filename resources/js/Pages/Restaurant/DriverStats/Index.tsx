import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Bike, 
    TrendingUp, 
    DollarSign, 
    ShoppingBag, 
    Award, 
    Phone, 
    CheckCircle2, 
    Clock, 
    Flame, 
    BarChart2, 
    Search,
    UserCheck,
    AlertCircle,
    Activity
} from 'lucide-react';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DriverStat {
    id: number;
    name: string;
    phone: string;
    is_active: boolean;
    availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    total_orders: number;
    today_orders: number;
    active_orders: number;
    today_earnings: number;
    total_earnings: number;
    last_order_at: string | null;
    daily: {
        date: string;
        orders: number;
    }[];
}

interface DriverStatsProps {
    driver_stats: DriverStat[];
    summary: {
        total_drivers: number;
        available_drivers: number;
        busy_drivers: number;
        today_delivered_orders: number;
        today_total_amount: number;
        total_delivered_orders: number;
        top_driver: DriverStat | null;
    };
    comparison_chart: {
        name: string;
        total_orders: number;
        today_orders: number;
        earnings: number;
    }[];
    timeline_chart: {
        date: string;
        day: string;
        orders: number;
    }[];
    restaurant: {
        id: number;
        name: string;
    };
}

export default function DriverStatsIndex({
    driver_stats = [],
    summary,
    comparison_chart = [],
    timeline_chart = [],
    restaurant,
}: DriverStatsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'>('ALL');

    const filteredDrivers = driver_stats.filter((d) => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || d.availability_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const maxOrders = Math.max(...driver_stats.map((d) => d.total_orders), 1);

    return (
        <>
            <Head title="إحصائيات الكباتن — إدارة المطعم — فطرنا" />
            <div className="space-y-6 pb-12" dir="rtl">
                {/* Header Banner */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
                                <Activity className="w-3.5 h-3.5 text-amber-200" />
                                <span>تقرير حركة وأداء مناديب الفرع</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black">
                                سجل وإحصائيات كباتن التوصيل
                            </h1>
                            <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
                                متابعة دقيقة لجميع الطلبات التي أخذها كل كابتن، المبالغ المحصلة كاش، ومَن هو الأكثر تفاعلاً وإنجازاً اليوم وخلال الشهر.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/restaurant/delivery-drivers"
                                className="px-4 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs shadow-md transition flex items-center gap-2"
                            >
                                <Bike className="w-4 h-4" />
                                <span>إدارة الكباتن</span>
                            </Link>
                            <Link
                                href="/restaurant/orders"
                                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>الطلبات الواردة</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Today Deliveries */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>توصيلات اليوم المكتملة</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {summary?.today_delivered_orders || 0}
                            <span className="text-xs font-normal text-stone-400 mr-1.5">طلب</span>
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            تحصيل اليوم: {Number(summary?.today_total_amount || 0).toLocaleString()} ج.م
                        </p>
                    </div>

                    {/* All-time Deliveries */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>إجمالي كل التوصيلات</span>
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">
                            {summary?.total_delivered_orders || 0}
                            <span className="text-xs font-normal text-stone-400 mr-1.5">رحلة ناجحة</span>
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                            عبر جميع كباتن الفرع
                        </p>
                    </div>

                    {/* Driver Availability */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>الكباتن الجاهزين الآن</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Bike className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-stone-900 dark:text-white">
                                {summary?.available_drivers || 0}
                            </p>
                            <span className="text-xs text-stone-400">من إجمالي {summary?.total_drivers || 0}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                            {summary?.busy_drivers || 0} كابتن في طريق التوصيل حالياً
                        </p>
                    </div>

                    {/* Top Performer */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 border border-amber-300 dark:border-amber-800/60 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-2">
                            <span className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                الكابتن الأكثر تفاعلاً
                            </span>
                            <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-lg font-black text-stone-900 dark:text-white truncate">
                            {summary?.top_driver?.name || 'لا يوجد بعد'}
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold mt-1">
                            {summary?.top_driver?.total_orders || 0} طلب مكتمل ({summary?.top_driver?.today_orders || 0} اليوم)
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart: Driver Comparison (Who is most active) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-orange-500" />
                                    <span>مقارنة إنجاز الكباتن (الأكثر طلباً)</span>
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    إجمالي الطلبات المكتملة وطلبات اليوم لكل كابتن
                                </p>
                            </div>
                        </div>

                        {comparison_chart.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs">
                                <Bike className="w-10 h-10 mb-2 stroke-1" />
                                <span>لا توجد بيانات كافية للكباتن حتى الآن</span>
                            </div>
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparison_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip 
                                            formatter={(value: any, name: any) => [
                                                value, 
                                                name === 'total_orders' ? 'إجمالي الطلبات' : 'طلبات اليوم'
                                            ]}
                                            contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                        />
                                        <Legend 
                                            formatter={(value) => value === 'total_orders' ? 'إجمالي الطلبات' : 'طلبات اليوم'}
                                            wrapperStyle={{ fontSize: '12px' }}
                                        />
                                        <Bar dataKey="total_orders" fill="#ea580c" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="today_orders" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Timeline Chart: Daily Deliveries (Last 14 days) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span>حركة التوصيل اليومية (آخر 14 يوماً)</span>
                                </h2>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    معدل الطلبات المسلمة يومياً من المطعم
                                </p>
                            </div>
                        </div>

                        {timeline_chart.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs">
                                <TrendingUp className="w-10 h-10 mb-2 stroke-1" />
                                <span>لا توجد بيانات كافية خلال الفترة</span>
                            </div>
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timeline_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="deliveryGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip 
                                            formatter={(value: any) => [`${value} طلب`, 'تم توصيله']}
                                            labelFormatter={(label, items) => {
                                                const day = items[0]?.payload?.day;
                                                return `${day ? day + ' ' : ''}(${label})`;
                                            }}
                                            contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#deliveryGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Driver Table & Records */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Bike className="w-5 h-5 text-orange-600" />
                                <span>جدول كباتن التوصيل وأرقام الأداء</span>
                            </h2>
                            <p className="text-xs text-stone-400 mt-0.5">
                                عرض تفصيلي لعدد الطلبات التي أخذها كل كابتن ومبالغ التحصيل
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم أو الهاتف..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-9 pl-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e: any) => setStatusFilter(e.target.value)}
                                className="py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-bold"
                            >
                                <option value="ALL">كل الحالات</option>
                                <option value="AVAILABLE">متاح وجاهز</option>
                                <option value="BUSY">مشغول بتوصيل</option>
                                <option value="OFFLINE">غير متصل</option>
                            </select>
                        </div>
                    </div>

                    {filteredDrivers.length === 0 ? (
                        <div className="text-center py-12">
                            <Bike className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                            <p className="text-xs text-stone-400">لا يوجد كباتن مطابقين للبحث حالياً.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 font-bold">
                                        <th className="py-3 px-4">الكابتن</th>
                                        <th className="py-3 px-3">الحالة الحالية</th>
                                        <th className="py-3 px-3">طلبات اليوم</th>
                                        <th className="py-3 px-3">الطلبات الجارية الآن</th>
                                        <th className="py-3 px-3">إجمالي الطلبات</th>
                                        <th className="py-3 px-3">كاش محصل اليوم</th>
                                        <th className="py-3 px-3">إجمالي الكاش</th>
                                        <th className="py-3 px-3">آخر توصيل</th>
                                        <th className="py-3 px-4">مؤشر النشاط</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {filteredDrivers.map((driver, index) => {
                                        const percentOfTop = Math.round((driver.total_orders / maxOrders) * 100);
                                        return (
                                            <tr key={driver.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                                                {/* Captain Name & Phone */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">
                                                            {index === 0 && driver.total_orders > 0 ? (
                                                                <Award className="w-5 h-5 text-amber-500" />
                                                            ) : (
                                                                driver.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-black text-stone-900 dark:text-white">
                                                                    {driver.name}
                                                                </span>
                                                                {index === 0 && driver.total_orders > 0 && (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                                                                        الأول
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <a 
                                                                href={`tel:${driver.phone}`} 
                                                                className="text-[11px] text-stone-400 hover:text-orange-600 flex items-center gap-1 mt-0.5"
                                                            >
                                                                <Phone className="w-3 h-3" />
                                                                <span>{driver.phone}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Availability Status */}
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        driver.availability_status === 'AVAILABLE'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                            : driver.availability_status === 'BUSY'
                                                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            driver.availability_status === 'AVAILABLE'
                                                                ? 'bg-emerald-500'
                                                                : driver.availability_status === 'BUSY'
                                                                ? 'bg-amber-500'
                                                                : 'bg-stone-400'
                                                        }`}></span>
                                                        {driver.availability_status === 'AVAILABLE'
                                                            ? 'جاهز للاستلام'
                                                            : driver.availability_status === 'BUSY'
                                                            ? 'في الطريق'
                                                            : 'غير متصل'}
                                                    </span>
                                                </td>

                                                {/* Today orders */}
                                                <td className="py-3 px-3">
                                                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                                        {driver.today_orders}
                                                    </span>
                                                    <span className="text-[10px] text-stone-400 mr-1">طلب</span>
                                                </td>

                                                {/* Active orders */}
                                                <td className="py-3 px-3">
                                                    {driver.active_orders > 0 ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                                                            {driver.active_orders} جاري الآن
                                                        </span>
                                                    ) : (
                                                        <span className="text-stone-400 text-[11px]">-</span>
                                                    )}
                                                </td>

                                                {/* Total orders */}
                                                <td className="py-3 px-3 font-black text-stone-900 dark:text-white">
                                                    {driver.total_orders}
                                                </td>

                                                {/* Today Earnings */}
                                                <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                    {Number(driver.today_earnings).toLocaleString()} ج.م
                                                </td>

                                                {/* Total Earnings */}
                                                <td className="py-3 px-3 font-bold text-stone-700 dark:text-stone-300">
                                                    {Number(driver.total_earnings).toLocaleString()} ج.م
                                                </td>

                                                {/* Last delivery */}
                                                <td className="py-3 px-3 text-stone-400 text-[11px]">
                                                    {driver.last_order_at || 'لم يوصل بعد'}
                                                </td>

                                                {/* Activity Progress Bar */}
                                                <td className="py-3 px-4 min-w-[140px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                                                            <div 
                                                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" 
                                                                style={{ width: `${percentOfTop}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-stone-400 w-8 text-left">
                                                            {percentOfTop}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
