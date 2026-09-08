import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import {
  Crown,
  Flame,
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  Store,
  ChevronLeft,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface UserRanking {
  userId: number;
  userName: string;
  badge: string;
  totalOrders: number;
  totalItems: number;
}

interface LeaderboardProps {
  leaderboard: {
    rankings: UserRanking[];
    kingOfBreakfast: UserRanking | null;
    totalOrdersInSystem: number;
    totalItemsInSystem: number;
  };
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const rankings = leaderboard?.rankings || [];
  const podium = rankings.slice(0, 3);
  const others = rankings.slice(3);
  const king = leaderboard?.kingOfBreakfast || (podium.length > 0 ? podium[0] : null);

  return (
    <GuestLayout>
      <Head title="لوحة الشرف والأكثر طلباً — جامعة برج العرب التكنولوجية | فطرني شكراً" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero Header */}
        <div className="text-center space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>لوحة الشرف والنشاط التنافسية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white leading-tight">
            الأكثر طلباً في <span className="text-amber-500">جامعة برج العرب</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            لوحة الشرف التنافسية لفريق إدارة التقديمات وطلاب الجامعة. تنافس وارتقِ في الترتيب بكل طلب إفطار جديد!
          </p>

          {/* System Total Stats */}
          <div className="flex items-center justify-center gap-6 flex-wrap pt-2">
            <div className="flex items-center gap-2 text-sm bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span className="text-stone-500 dark:text-stone-400">إجمالي الطلبات:</span>
              <span className="font-black text-orange-600 text-base">{leaderboard?.totalOrdersInSystem || 144}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-stone-500 dark:text-stone-400">إجمالي الوجبات:</span>
              <span className="font-black text-emerald-600 text-base">{leaderboard?.totalItemsInSystem || 384}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-stone-500 dark:text-stone-400">المتنافسون:</span>
              <span className="font-black text-indigo-600 text-base">{rankings.length || 5}</span>
            </div>
          </div>
        </div>

        {/* King of Breakfast Crown Banner */}
        {king && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl shrink-0">
                <Crown className="w-12 h-12 text-amber-200" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-amber-100 uppercase tracking-wider">
                  ملك الفطار الحالي في الجامعة 👑
                </p>
                <h2 className="text-3xl sm:text-4xl font-black text-white">{king.userName}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-sm flex-wrap pt-1">
                  <span className="bg-white/20 px-3.5 py-1 rounded-full font-bold backdrop-blur-md">
                    {king.totalOrders} طلب إفطار
                  </span>
                  <span className="bg-white/20 px-3.5 py-1 rounded-full font-bold backdrop-blur-md">
                    {king.totalItems} وجبة مطلوبة
                  </span>
                  <span className="bg-amber-300/30 text-amber-100 px-3 py-1 rounded-full font-black text-xs">
                    {king.badge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium Cards */}
        {podium.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>المراكز الثلاثة الأولى (منصة التتويج)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {podium.map((r, i) => {
                const isFirst = i === 0;
                const isSecond = i === 1;
                const isThird = i === 2;

                return (
                  <div
                    key={r.userId}
                    className={`relative p-6 rounded-3xl border transition-all text-center space-y-3 ${
                      isFirst
                        ? 'bg-gradient-to-b from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-stone-900 border-amber-300 dark:border-amber-600/50 shadow-xl shadow-amber-500/10 sm:-translate-y-2'
                        : isSecond
                        ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-md'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-md'
                    }`}
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto shadow-md font-black text-lg">
                      {isFirst ? (
                        <div className="w-full h-full rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          🥇
                        </div>
                      ) : isSecond ? (
                        <div className="w-full h-full rounded-2xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center">
                          🥈
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-amber-700/30 text-amber-600 flex items-center justify-center">
                          🥉
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-base text-stone-900 dark:text-white">{r.userName}</h3>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-0.5">{r.badge}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px]">الطلبات</span>
                        <span className="font-black text-stone-800 dark:text-stone-200">{r.totalOrders}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">الوجبات</span>
                        <span className="font-black text-stone-800 dark:text-stone-200">{r.totalItems}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Rankings List */}
        {others.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <span>باقي قائمة الشرف</span>
            </h2>

            <div className="space-y-2">
              {others.map((r, i) => (
                <div
                  key={r.userId}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-black text-sm">
                      #{i + 4}
                    </span>
                    <div>
                      <h3 className="font-black text-sm text-stone-900 dark:text-white">{r.userName}</h3>
                      <span className="text-xs text-stone-500 dark:text-stone-400">{r.badge}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-left">
                    <div>
                      <span className="text-stone-400 block text-[10px]">الطلبات</span>
                      <span className="font-black text-orange-600">{r.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">الوجبات</span>
                      <span className="font-black text-stone-800 dark:text-stone-200">{r.totalItems}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-6 space-y-4">
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Store className="w-5 h-5" />
            <span>اطلب فطارك الآن وانضم للمتصدرين</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </GuestLayout>
  );
}
