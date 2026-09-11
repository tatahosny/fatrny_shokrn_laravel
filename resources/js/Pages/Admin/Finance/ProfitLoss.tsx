import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlyPL {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
}

interface Props {
    monthlyData: MonthlyPL[];
    summary: {
        total_revenue: number;
        total_expenses: number;
        net_profit: number;
        profit_margin: number;
    };
}

export default function AdminFinanceProfitLoss({ monthlyData, summary }: Props) {
    const fmt = (v: number) => (v / 100).toFixed(2);
    const isProfit = summary.net_profit >= 0;

    return (
        <>
            <Head title="الربح والخسارة — فطرنا" />
            <div className="space-y-6" dir="rtl">
                <div className="flex items-center gap-4">
                    <Link href="/admin/finance" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">بيان الربح والخسارة</h1>
                        <p className="text-stone-400 text-sm mt-1">الأداء المالي الكلي للمنصة</p>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                        <DollarSign className="w-6 h-6 text-amber-400 mb-3" />
                        <p className="text-2xl font-bold text-white">{fmt(summary.total_revenue)} ج</p>
                        <p className="text-stone-400 text-xs mt-1">إجمالي الإيرادات</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                        <TrendingDown className="w-6 h-6 text-red-400 mb-3" />
                        <p className="text-2xl font-bold text-white">{fmt(summary.total_expenses)} ج</p>
                        <p className="text-stone-400 text-xs mt-1">إجمالي المصروفات</p>
                    </div>
                    <div className={`${isProfit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-2xl p-5`}>
                        {isProfit ? <TrendingUp className="w-6 h-6 text-emerald-400 mb-3" /> : <TrendingDown className="w-6 h-6 text-red-400 mb-3" />}
                        <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(summary.net_profit)} ج</p>
                        <p className="text-stone-400 text-xs mt-1">صافي الربح</p>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                        <BarChart2 className="w-6 h-6 text-indigo-400 mb-3" />
                        <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>{summary.profit_margin.toFixed(1)}%</p>
                        <p className="text-stone-400 text-xs mt-1">هامش الربح</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">الأداء الشهري</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={monthlyData.map(d => ({
                            month: d.month,
                            revenue: d.revenue / 100,
                            expenses: d.expenses / 100,
                            profit: d.profit / 100,
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#78716c', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#fff' }}
                                formatter={(v: any) => [`${v} ج`]} />
                            <Legend />
                            <Bar dataKey="revenue" name="الإيرادات" fill="#f97316" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="profit" name="صافي الربح" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">التفاصيل الشهرية</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-stone-400 border-b border-white/10">
                                    <th className="text-right pb-3 font-medium">الشهر</th>
                                    <th className="text-right pb-3 font-medium">الإيرادات</th>
                                    <th className="text-right pb-3 font-medium">المصروفات</th>
                                    <th className="text-right pb-3 font-medium">صافي الربح</th>
                                    <th className="text-right pb-3 font-medium">الهامش</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {monthlyData.map((row, i) => {
                                    const margin = row.revenue > 0 ? (row.profit / row.revenue * 100) : 0;
                                    const pos = row.profit >= 0;
                                    return (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 text-white font-medium">{row.month}</td>
                                            <td className="py-3 text-amber-400">{fmt(row.revenue)} ج</td>
                                            <td className="py-3 text-red-400">{fmt(row.expenses)} ج</td>
                                            <td className={`py-3 font-bold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(row.profit)} ج</td>
                                            <td className={`py-3 ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{margin.toFixed(1)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
