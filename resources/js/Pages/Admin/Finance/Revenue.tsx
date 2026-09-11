import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, BarChart2, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface Props {
    period: string;
    revenueByDay: Array<{ date: string; revenue: number; commission: number }>;
    revenueByRestaurant: Array<{ restaurant_name: string; revenue: number; commission: number; orders: number }>;
    totals: { total_revenue: number; total_commission: number; avg_daily: number; growth_pct: number };
}

export default function AdminFinanceRevenue({ period, revenueByDay, revenueByRestaurant, totals }: Props) {
    const fmt = (v: number) => (v / 100).toFixed(2);

    return (
        <>
            <Head title="تفاصيل الإيرادات — فطرنا" />
            <div className="space-y-6" dir="rtl">
                <div className="flex items-center gap-4">
                    <Link href="/admin/finance" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">تفاصيل الإيرادات</h1>
                        <p className="text-stone-400 text-sm mt-1">تحليل الإيرادات والعمولات</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'إجمالي الإيرادات', value: `${fmt(totals.total_revenue)} ج`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'إجمالي العمولات', value: `${fmt(totals.total_commission)} ج`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        { label: 'متوسط يومي', value: `${fmt(totals.avg_daily)} ج`, icon: BarChart2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: 'نسبة النمو', value: `${totals.growth_pct > 0 ? '+' : ''}${totals.growth_pct.toFixed(1)}%`, icon: totals.growth_pct >= 0 ? TrendingUp : TrendingDown, color: totals.growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400', bg: 'bg-emerald-500/10' },
                    ].map((card, i) => (
                        <div key={i} className={`${card.bg} border border-white/10 rounded-2xl p-5`}>
                            <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                            <p className="text-stone-400 text-xs mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">الإيرادات اليومية</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueByDay.map(d => ({ ...d, revenue: d.revenue / 100, commission: d.commission / 100 }))}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="comGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" tick={{ fill: '#78716c', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#78716c', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#fff' }}
                                formatter={(v: any) => [`${v} ج`]} />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#f97316" fill="url(#revGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="commission" name="العمولات" stroke="#818cf8" fill="url(#comGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* By Restaurant */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">الإيرادات حسب المطعم</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-stone-400 border-b border-white/10">
                                    <th className="text-right pb-3 font-medium">المطعم</th>
                                    <th className="text-right pb-3 font-medium">الطلبات</th>
                                    <th className="text-right pb-3 font-medium">الإيرادات</th>
                                    <th className="text-right pb-3 font-medium">العمولة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {revenueByRestaurant.map((r, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 text-white font-medium">{r.restaurant_name}</td>
                                        <td className="py-3 text-stone-300">{r.orders}</td>
                                        <td className="py-3 text-amber-400 font-semibold">{fmt(r.revenue)} ج</td>
                                        <td className="py-3 text-indigo-400 font-semibold">{fmt(r.commission)} ج</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
