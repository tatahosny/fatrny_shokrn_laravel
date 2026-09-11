import React from 'react';
import { Head } from '@inertiajs/react';
import { BarChart2, TrendingUp, ShoppingBag, Users, Store, Clock, Star } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Props {
    ordersByHour: Array<{ hour: number; count: number }>;
    ordersByDay: Array<{ day: string; count: number; revenue: number }>;
    topRestaurants: Array<{ name: string; orders: number; revenue: number }>;
    topMenuItems: Array<{ name: string; restaurant: string; count: number }>;
    customerRetention: { new_customers: number; returning_customers: number };
    avgDeliveryTime: number;
    summaryStats: {
        total_orders_30d: number;
        revenue_30d: number;
        new_customers_30d: number;
        avg_rating: number;
    };
}

const COLORS = ['#f97316', '#818cf8', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export default function AdminAnalytics({ ordersByHour, ordersByDay, topRestaurants, topMenuItems, customerRetention, avgDeliveryTime, summaryStats }: Props) {
    const fmt = (v: number) => (v / 100).toFixed(2);

    return (
        <Head title="التحليلات" />

            <div className="space-y-6" dir="rtl">
                <div>
                    <h1 className="text-2xl font-bold text-white">التحليلات والإحصاءات</h1>
                    <p className="text-stone-400 text-sm mt-1">أداء المنصة خلال آخر 30 يوماً</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'الطلبات (30 يوم)', value: summaryStats.total_orders_30d, icon: ShoppingBag, color: 'text-orange-400' },
                        { label: 'الإيرادات (30 يوم)', value: `${fmt(summaryStats.revenue_30d)} ج`, icon: TrendingUp, color: 'text-amber-400' },
                        { label: 'عملاء جدد', value: summaryStats.new_customers_30d, icon: Users, color: 'text-indigo-400' },
                        { label: 'متوسط التوصيل', value: `${avgDeliveryTime} د`, icon: Clock, color: 'text-purple-400' },
                    ].map((kpi, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <kpi.icon className={`w-5 h-5 ${kpi.color} mb-3`} />
                            <p className="text-2xl font-bold text-white">{kpi.value}</p>
                            <p className="text-xs text-stone-400 mt-1">{kpi.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Orders by Day */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">الطلبات اليومية</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={ordersByDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="day" tick={{ fill: '#78716c', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#78716c', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="count" name="الطلبات" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Orders by Hour */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">الطلبات حسب الساعة</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={ordersByHour}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="hour" tickFormatter={(v) => `${v}:00`} tick={{ fill: '#78716c', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#78716c', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#fff' }}
                                    labelFormatter={(v) => `${v}:00`} />
                                <Line type="monotone" dataKey="count" name="الطلبات" stroke="#818cf8" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Customer Retention Pie */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">العملاء الجدد مقابل العائدين</h2>
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={200} height={200}>
                                <PieChart>
                                    <Pie data={[
                                        { name: 'جدد', value: customerRetention.new_customers },
                                        { name: 'عائدون', value: customerRetention.returning_customers },
                                    ]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                                        <Cell fill="#f97316" />
                                        <Cell fill="#818cf8" />
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <div>
                                        <p className="text-white font-semibold">{customerRetention.new_customers}</p>
                                        <p className="text-stone-400 text-xs">عملاء جدد</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <div>
                                        <p className="text-white font-semibold">{customerRetention.returning_customers}</p>
                                        <p className="text-stone-400 text-xs">عملاء عائدون</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Restaurants */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-orange-400" />
                            أفضل المطاعم
                        </h2>
                        <div className="space-y-3">
                            {topRestaurants.map((r, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-stone-500 text-sm w-5">{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-white text-sm font-medium">{r.name}</p>
                                            <p className="text-stone-300 text-xs">{r.orders} طلب</p>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, (r.orders / (topRestaurants[0]?.orders || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Items */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        أكثر الأطباق طلباً
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-stone-400 border-b border-white/10">
                                    <th className="text-right pb-3 font-medium">#</th>
                                    <th className="text-right pb-3 font-medium">الطبق</th>
                                    <th className="text-right pb-3 font-medium">المطعم</th>
                                    <th className="text-right pb-3 font-medium">عدد الطلبات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topMenuItems.map((item, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 text-stone-500">{i + 1}</td>
                                        <td className="py-3 text-white font-medium">{item.name}</td>
                                        <td className="py-3 text-stone-400">{item.restaurant}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">{item.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
}
