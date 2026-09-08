import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Receipt, 
    CreditCard, 
    Store, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    PieChart
} from 'lucide-react';

interface FinanceOverviewProps {
    summary: {
        total_gmv: number;
        commission_revenue: number;
        subscription_revenue: number;
        total_revenue: number;
        total_expenses: number;
        net_profit: number;
        outstanding_receivables: number;
    };
    restaurant_table: {
        id: number;
        name: string;
        commission_type: string;
        gross_sales: number;
        commission_earned: number;
        subscription_fee: number;
        total_platform_revenue: number;
        amount_collected: number;
        balance_due: number;
    }[];
    monthly_pnl: {
        month: string;
        revenue: number;
        expenses: number;
        net_profit: number;
    }[];
}

export default function Overview({ summary, restaurant_table = [], monthly_pnl = [] }: FinanceOverviewProps) {
    return (
        <AdminLayout title="التقرير المالي والأرباح">
            <Head title="التقرير المالي والأرباح — الإدارة المركزية" />

            <div className="space-y-8">
                {/* Financial KPIs Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>إجمالي المبيعات (GMV)</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                            {(summary.total_gmv || 0).toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">حجم المعاملات الكلي</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>إيرادات المنصة الكلية</span>
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                            {(summary.total_revenue || 0).toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">عمولات + اشتراكات شهرية</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>مصروفات التشغيل</span>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                            {(summary.total_expenses || 0).toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">سيرفرات، تسويق، تشغيل</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>صافي الربح الفعلي</span>
                            <PieChart className="w-4 h-4 text-teal-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
                            {(summary.net_profit || 0).toFixed(1)} ج.م
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">Net Profit بعد كل التكاليف</p>
                    </div>
                </div>

                {/* Restaurant Settlement & Ledger Table */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h2 className="text-base font-black text-stone-900 dark:text-white">
                                كشف حساب المطاعم والعمولات المستحقة
                            </h2>
                            <p className="text-xs text-stone-400 mt-0.5">
                                تفصيل مبيعات كل مطعم وحصة المنصة والمبالغ المحصلة
                            </p>
                        </div>
                        <Link
                            href="/admin/invoices"
                            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition"
                        >
                            إصدار فواتير شهرية
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px] font-bold">
                                    <th className="py-3 px-4">المطعم</th>
                                    <th className="py-3 px-4">نظام التعاقد</th>
                                    <th className="py-3 px-4">إجمالي المبيعات</th>
                                    <th className="py-3 px-4">عمولة المنصة</th>
                                    <th className="py-3 px-4">الاشتراك</th>
                                    <th className="py-3 px-4">إيراد المنصة</th>
                                    <th className="py-3 px-4">المحصل</th>
                                    <th className="py-3 px-4">الرصيد المتبقي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {restaurant_table.map((r) => (
                                    <tr key={r.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                        <td className="py-4 px-4 font-bold text-stone-900 dark:text-white">
                                            {r.name}
                                        </td>
                                        <td className="py-4 px-4 text-stone-600 dark:text-stone-400 font-mono">
                                            {r.commission_type}
                                        </td>
                                        <td className="py-4 px-4 font-black text-stone-800 dark:text-stone-200">
                                            {Number(r.gross_sales || 0).toFixed(1)} ج.م
                                        </td>
                                        <td className="py-4 px-4 text-orange-600 font-bold">
                                            {Number(r.commission_earned || 0).toFixed(1)} ج.م
                                        </td>
                                        <td className="py-4 px-4 text-stone-500">
                                            {Number(r.subscription_fee || 0).toFixed(1)} ج.م
                                        </td>
                                        <td className="py-4 px-4 font-black text-emerald-600">
                                            {Number(r.total_platform_revenue || 0).toFixed(1)} ج.م
                                        </td>
                                        <td className="py-4 px-4 text-stone-600 dark:text-stone-300">
                                            {Number(r.amount_collected || 0).toFixed(1)} ج.م
                                        </td>
                                        <td className="py-4 px-4 font-bold text-amber-600">
                                            {Number(r.balance_due || 0).toFixed(1)} ج.م
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
