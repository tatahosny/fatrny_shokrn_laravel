import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DeliveryLayout from '../../Layouts/DeliveryLayout';
import { Order, PaginatedResponse } from '../../Types';
import { 
    Bike, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    ArrowRight, 
    DollarSign, 
    Calendar, 
    Search, 
    Phone, 
    Store, 
    Navigation, 
    TrendingUp,
    PackageCheck,
    AlertCircle
} from 'lucide-react';

interface OrderHistoryProps {
    orders: PaginatedResponse<Order>;
    today_orders?: Order[];
    active_orders?: Order[];
    today_count?: number;
    today_earnings?: number;
    total_count?: number;
}

export default function OrderHistory({ 
    orders, 
    today_orders = [], 
    active_orders = [], 
    today_count = 0, 
    today_earnings = 0, 
    total_count = 0 
}: OrderHistoryProps) {
    const [activeTab, setActiveTab] = useState<'TODAY' | 'ACTIVE' | 'ALL'>('TODAY');
    const [searchQuery, setSearchQuery] = useState('');

    const handleUpdateStatus = (orderId: number, nextStatus: 'OUT_FOR_DELIVERY' | 'DELIVERED') => {
        router.patch(`/delivery/orders/${orderId}/status`, {
            status: nextStatus
        });
    };

    // Filter orders based on active tab and search query
    const getDisplayedOrders = () => {
        let list: Order[] = [];
        if (activeTab === 'TODAY') {
            list = today_orders;
        } else if (activeTab === 'ACTIVE') {
            list = active_orders;
        } else {
            list = orders?.data || [];
        }

        if (!searchQuery.trim()) return list;

        const q = searchQuery.toLowerCase();
        return list.filter((order) => 
            order.order_number.toLowerCase().includes(q) ||
            order.restaurant?.name?.toLowerCase().includes(q) ||
            order.address.toLowerCase().includes(q) ||
            order.customer?.user?.name?.toLowerCase().includes(q)
        );
    };

    const displayedOrders = getDisplayedOrders();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم التسليم
                    </span>
                );
            case 'OUT_FOR_DELIVERY':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold">
                        <Navigation className="w-3.5 h-3.5" />
                        في الطريق للعميل
                    </span>
                );
            case 'ASSIGNED_TO_DRIVER':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        تم التكليف (جاهز للاستلام)
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ملغي
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold">
                        {status}
                    </span>
                );
        }
    };

    return (
        <DeliveryLayout title="سجل التوصيلات والطلبات">
            <Head title="سجل الطلبات — كابتن فطرنا شكراً" />

            <div className="space-y-6 pb-10" dir="rtl">
                {/* Header Welcome and Quick Info */}
                <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-stone-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold mb-2">
                            <Bike className="w-3.5 h-3.5" />
                            <span>سجل رحلات ومهام الكابتن اليومية</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black">
                            قائمة وسجل الطلبات بالكامل
                        </h1>
                        <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg">
                            هنا تجد كل الطلبات التي استلمتها خلال اليوم وسجل رحلاتك السابقة مع تفاصيل المبالغ المحصلة.
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <span className="text-[11px] font-bold text-stone-400 block mb-1">طلبات تم توصيلها اليوم</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{today_count}</span>
                            <span className="text-xs text-stone-400">طلب</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <span className="text-[11px] font-bold text-stone-400 block mb-1">تحصيل كاش اليوم</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{Number(today_earnings).toLocaleString()}</span>
                            <span className="text-xs text-stone-400">ج.م</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <span className="text-[11px] font-bold text-stone-400 block mb-1">الطلبات الجارية الآن</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{active_orders.length}</span>
                            <span className="text-xs text-stone-400">في يدك</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <span className="text-[11px] font-bold text-stone-400 block mb-1">إجمالي كل التوصيلات</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-stone-900 dark:text-white">{total_count}</span>
                            <span className="text-xs text-stone-400">رحلة ناجحة</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area: Tabs + Search + Order Cards */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-6">
                    {/* Tabs and Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                        {/* Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('TODAY')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeTab === 'TODAY'
                                        ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>طلبات اليوم</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    activeTab === 'TODAY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black' : 'bg-stone-200 dark:bg-stone-700'
                                }`}>
                                    {today_orders.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('ACTIVE')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeTab === 'ACTIVE'
                                        ? 'bg-white dark:bg-stone-900 text-purple-600 dark:text-purple-400 shadow-xs'
                                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>الطلبات الجارية</span>
                                {active_orders.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-black animate-pulse">
                                        {active_orders.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('ALL')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeTab === 'ALL'
                                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>كل السجل</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 dark:bg-stone-700">
                                    {orders?.total || 0}
                                </span>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative min-w-[240px]">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="بحث برقم الطلب، المطعم، أو العنوان..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Orders List */}
                    {displayedOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <Bike className="w-14 h-14 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
                                {activeTab === 'ACTIVE' 
                                    ? 'لا توجد طلبات جارية في يدك الآن.' 
                                    : activeTab === 'TODAY' 
                                    ? 'لم يتم تسجيل طلبات جديدة لك اليوم بعد.' 
                                    : 'لا توجد طلبات في هذا السجل.'}
                            </h3>
                            <p className="text-xs text-stone-400 mt-1">
                                {activeTab === 'ACTIVE' && 'عندما يسند إليك المطعم طلباً جديداً ستجده هنا فوراً.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedOrders.map((order) => {
                                const isDelivered = order.status === 'DELIVERED';
                                const isActive = order.status === 'ASSIGNED_TO_DRIVER' || order.status === 'OUT_FOR_DELIVERY';

                                return (
                                    <div
                                        key={order.id}
                                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                            isActive
                                                ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800/80 shadow-xs'
                                                : isDelivered
                                                ? 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                                    <Bike className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                            {order.order_number}
                                                        </span>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                                                        مطعم: {order.restaurant?.name || 'مطعم فطرنا شكراً'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <div className="text-right sm:text-left">
                                                    <span className="text-[10px] text-stone-400 block font-medium">المبلغ المطلوب تحصيله كاش</span>
                                                    <span className="font-black text-base text-stone-900 dark:text-white">
                                                        {Number(order.total_amount).toLocaleString()} ج.م
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/delivery/orders/${order.id}`}
                                                    className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition flex items-center gap-1"
                                                >
                                                    <span>التفاصيل</span>
                                                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Locations: Restaurant & Customer */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
                                            {/* Pickup location */}
                                            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
                                                <Store className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold block text-stone-700 dark:text-stone-200">الاستلام:</span>
                                                    <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                                                        {order.restaurant?.address || 'عنوان المطعم الرئيسي'}
                                                    </span>
                                                    {order.restaurant?.phone && (
                                                        <a href={`tel:${order.restaurant.phone}`} className="text-orange-600 block text-[11px] font-bold hover:underline mt-0.5">
                                                            هاتف المطعم: {order.restaurant.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delivery location */}
                                            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
                                                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold block text-stone-700 dark:text-stone-200">التسليم للعميل:</span>
                                                    <span className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                                                        {order.address}
                                                    </span>
                                                    {order.customer?.user?.phone && (
                                                        <a href={`tel:${order.customer.user.phone}`} className="text-emerald-600 block text-[11px] font-bold hover:underline mt-0.5">
                                                            هاتف العميل: {order.customer.user.phone} ({order.customer?.user?.name})
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Order Quick Actions */}
                                        {isActive && (
                                            <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    هذا الطلب مكلف به حالياً
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    {order.status === 'ASSIGNED_TO_DRIVER' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                                                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
                                                        >
                                                            استلمت من المطعم وفي الطريق
                                                        </button>
                                                    )}

                                                    {order.status === 'OUT_FOR_DELIVERY' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>تم التسليم وتحصيل الكاش</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Timestamp footer */}
                                        <div className="mt-2 text-[10px] text-stone-400 flex items-center justify-between">
                                            <span>
                                                تاريخ الطلب: {new Date(order.created_at).toLocaleString('ar-EG')}
                                            </span>
                                            {order.items && order.items.length > 0 && (
                                                <span>
                                                    {order.items.length} أصناف في الوجبة
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination for 'ALL' tab */}
                    {activeTab === 'ALL' && orders?.links && orders.links.length > 3 && (
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1">
                            {orders.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : !link.url
                                            ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
                                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DeliveryLayout>
    );
}
