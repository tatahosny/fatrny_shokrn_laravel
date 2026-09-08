import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import RestaurantLayout from '../../../Layouts/RestaurantLayout';
import { Restaurant, Order, PaginatedResponse, DeliveryDriver } from '../../../Types';
import { 
    ShoppingBag, 
    Eye, 
    CheckCircle2, 
    Clock, 
    Filter, 
    Search, 
    Phone, 
    Bike, 
    Flame, 
    PackageCheck, 
    Navigation, 
    AlertTriangle, 
    User, 
    MapPin, 
    DollarSign, 
    LayoutGrid, 
    Table as TableIcon, 
    ArrowRight,
    X,
    UserCheck,
    Utensils,
    RefreshCw,
    Sparkles
} from 'lucide-react';

interface OrdersIndexProps {
    orders: PaginatedResponse<Order>;
    restaurant: Restaurant;
    filters: { status?: string; search?: string };
    counts: {
        all: number;
        pending: number;
        confirmed: number;
        preparing: number;
        ready_for_pickup: number;
        out_for_delivery: number;
        delivered: number;
        cancelled: number;
        today_orders: number;
        today_revenue: number;
    };
    available_drivers: { id: number; name: string; phone: string }[];
}

export default function Index({ orders, restaurant, filters, counts, available_drivers = [] }: OrdersIndexProps) {
    const items = orders?.data || [];
    const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [assigningOrderId, setAssigningOrderId] = useState<number | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<number | string>('');

    const handleFilterStatus = (status: string) => {
        router.get('/restaurant/orders', { 
            status: status === 'ALL' ? '' : status,
            search: searchTerm || undefined 
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/restaurant/orders', { 
            status: filters.status || undefined,
            search: searchTerm || undefined 
        }, { preserveState: true });
    };

    const handleAdvanceStatus = (orderId: number, status: string) => {
        router.patch(`/restaurant/orders/${orderId}/status`, { status }, { preserveScroll: true });
    };

    const handleAssignDriver = (orderId: number) => {
        if (!selectedDriverId) return;
        router.post(`/restaurant/orders/${orderId}/assign-driver`, {
            driver_id: selectedDriverId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setAssigningOrderId(null);
                setSelectedDriverId('');
            }
        });
    };

    const statuses = [
        { key: 'ALL', label: 'جميع الطلبات', count: counts?.all || 0 },
        { key: 'PENDING', label: 'بانتظار الموافقة', count: counts?.pending || 0, badgeColor: 'bg-amber-500' },
        { key: 'CONFIRMED', label: 'مؤكد', count: counts?.confirmed || 0, badgeColor: 'bg-blue-500' },
        { key: 'PREPARING', label: 'قيد التجهيز بالمطبخ', count: counts?.preparing || 0, badgeColor: 'bg-orange-500' },
        { key: 'READY_FOR_PICKUP', label: 'جاهز للاستلام', count: counts?.ready_for_pickup || 0, badgeColor: 'bg-purple-500' },
        { key: 'OUT_FOR_DELIVERY', label: 'مع الطيار بالشارع', count: counts?.out_for_delivery || 0, badgeColor: 'bg-teal-500' },
        { key: 'DELIVERED', label: 'تم التسليم بنجاح', count: counts?.delivered || 0, badgeColor: 'bg-emerald-500' },
        { key: 'CANCELLED', label: 'ملغي أو مرفوض', count: counts?.cancelled || 0, badgeColor: 'bg-red-500' },
    ];

    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'بانتظار قبول المطعم',
                    bg: 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
                    dot: 'bg-amber-500',
                    icon: Clock
                };
            case 'CONFIRMED':
                return {
                    label: 'تم التأكيد',
                    bg: 'bg-blue-100 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300',
                    dot: 'bg-blue-500',
                    icon: CheckCircle2
                };
            case 'PREPARING':
                return {
                    label: 'قيد الطهي والتجهيز',
                    bg: 'bg-orange-100 dark:bg-orange-950/70 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300',
                    dot: 'bg-orange-500',
                    icon: Flame
                };
            case 'READY_FOR_PICKUP':
                return {
                    label: 'جاهز بانتظار الطيار',
                    bg: 'bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300',
                    dot: 'bg-purple-500',
                    icon: PackageCheck
                };
            case 'OUT_FOR_DELIVERY':
                return {
                    label: 'في الطريق للعميل',
                    bg: 'bg-teal-100 dark:bg-teal-950/70 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300',
                    dot: 'bg-teal-500',
                    icon: Navigation
                };
            case 'DELIVERED':
                return {
                    label: 'تم التسليم بنجاح',
                    bg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
                    dot: 'bg-emerald-500',
                    icon: CheckCircle2
                };
            case 'CANCELLED':
            case 'REJECTED':
                return {
                    label: 'طلب ملغي',
                    bg: 'bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-900 text-red-800 dark:text-red-300',
                    dot: 'bg-red-500',
                    icon: AlertTriangle
                };
            default:
                return {
                    label: status,
                    bg: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
                    dot: 'bg-stone-400',
                    icon: Clock
                };
        }
    };

    return (
        <RestaurantLayout title="إدارة الطلبات الواردة" restaurantName={restaurant.name}>
            <Head title="إدارة الطلبات الواردة — بوابة المطعم" />

            <div className="space-y-6 pb-12" dir="rtl">
                
                {/* Header Banner */}
                <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
                                <span>لوحة إدارة حركة الطلبات الحية</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black">
                                إدارة ومتابعة الطلبات الواردة
                            </h1>
                            <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
                                متابعة فورية لطلبات الزبائن، مراحل التحضير في المطبخ، وتعيين كباتن التوصيل لفرع {restaurant.name}.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.reload({ preserveScroll: true })}
                                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-1.5 shadow-xs"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>تحديث الطلبات</span>
                            </button>
                            <Link
                                href="/restaurant/driver-stats"
                                className="px-4 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs shadow-md transition flex items-center gap-1.5"
                            >
                                <Bike className="w-4 h-4" />
                                <span>إحصائيات الكباتن</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pending orders alert card */}
                    <div className={`p-5 rounded-3xl border transition shadow-xs ${
                        (counts?.pending || 0) > 0 
                            ? 'bg-amber-500/10 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20' 
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}>
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span className="text-amber-700 dark:text-amber-400">بانتظار الموافقة الآن</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                                {counts?.pending || 0}
                            </span>
                            <span className="text-xs text-stone-400">طلب جديد</span>
                        </div>
                        {(counts?.pending || 0) > 0 && (
                            <p className="text-[11px] text-amber-600 font-bold mt-1 animate-pulse">
                                يوجد طلبات جديدة تحتاج موافقتك فوراً!
                            </p>
                        )}
                    </div>

                    {/* Preparing in Kitchen */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>قيد الطهي والتجهيز</span>
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                <Flame className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                                {counts?.preparing || 0}
                            </span>
                            <span className="text-xs text-stone-400">وجبة على النار</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">يتم تحضيرها في المطبخ</p>
                    </div>

                    {/* Ready for Pickup */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>جاهز بانتظار الطيار</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                <PackageCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                                {counts?.ready_for_pickup || 0}
                            </span>
                            <span className="text-xs text-stone-400">طلب مغلف</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">جاهزة ومغلفة للاستلام</p>
                    </div>

                    {/* Today Performance */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-2">
                            <span>مبيعات اليوم المحصلة</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {Number(counts?.today_revenue || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-stone-400 mr-1">ج.م</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                            من إجمالي {counts?.today_orders || 0} طلب اليوم
                        </p>
                    </div>
                </div>

                {/* Filters, Tabs & Search Controls */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
                    
                    {/* Top Row: Search & View Mode Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                        {/* Search form */}
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="بحث برقم الطلب، اسم العميل، الهاتف، أو العنوان..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-24 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                                type="submit"
                                className="absolute left-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition"
                            >
                                بحث
                            </button>
                        </form>

                        {/* View Mode Switcher */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setViewMode('CARDS')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'CARDS'
                                        ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-xs'
                                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span>عرض البطاقات</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('TABLE')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'TABLE'
                                        ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-xs'
                                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <TableIcon className="w-4 h-4" />
                                <span>عرض الجدول</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Tabs Bar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                        {statuses.map(st => {
                            const isActive = (filters.status === st.key) || (!filters.status && st.key === 'ALL');
                            return (
                                <button
                                    key={st.key}
                                    onClick={() => handleFilterStatus(st.key)}
                                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-orange-600 text-white shadow-sm'
                                            : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                                    }`}
                                >
                                    <span>{st.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                        isActive 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                                    }`}>
                                        {st.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Orders Content Area */}
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
                        <ShoppingBag className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
                            لا توجد طلبات في هذا القسم
                        </h3>
                        <p className="text-xs text-stone-400">
                            {searchTerm ? 'جرب البحث بكلمة أخرى أو مسح شريط البحث.' : 'أي طلب جديد يدخل من الزبائن سيظهر هنا مباشرة.'}
                        </p>
                    </div>
                ) : viewMode === 'CARDS' ? (
                    /* Cards Grid View (Rich Details & Quick Processing) */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {items.map((order) => {
                            const status = getStatusDetails(order.status);
                            const StatusIcon = status.icon;
                            const customerUser = order.customer?.user;
                            const driver = order.delivery_driver || order.deliveryDriver;

                            return (
                                <div 
                                    key={order.id}
                                    className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                                >
                                    <div>
                                        {/* Top Order Card Header */}
                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-xl border border-orange-200/60 dark:border-orange-900/40">
                                                    {order.order_number}
                                                </span>
                                                <span className="text-[11px] text-stone-400">
                                                    منذ {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${status.bg}`}>
                                                <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`}></span>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                <span>{status.label}</span>
                                            </span>
                                        </div>

                                        {/* Customer and Delivery Info Box */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-xs">
                                            {/* Customer */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                                                    <User className="w-3.5 h-3.5 text-stone-400" />
                                                    <span>العميل: {customerUser?.name || 'مستخدم بدون اسم'}</span>
                                                </div>
                                                {customerUser?.phone && (
                                                    <a href={`tel:${customerUser.phone}`} className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 text-[11px]">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{customerUser.phone}</span>
                                                    </a>
                                                )}
                                                <p className="text-[11px] text-stone-500 flex items-start gap-1">
                                                    <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{order.address}</span>
                                                </p>
                                            </div>

                                            {/* Delivery Driver */}
                                            <div className="space-y-1 border-t sm:border-t-0 sm:border-r border-stone-200 dark:border-stone-700 pt-2 sm:pt-0 sm:pr-3">
                                                <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                                                    <Bike className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span>كابتن التوصيل:</span>
                                                </div>
                                                {driver ? (
                                                    <div className="space-y-0.5">
                                                        <span className="font-extrabold text-stone-900 dark:text-white block">
                                                            {driver.name}
                                                        </span>
                                                        {driver.phone && (
                                                            <a href={`tel:${driver.phone}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{driver.phone}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="pt-0.5">
                                                        <span className="text-[11px] text-stone-400 block mb-1">
                                                            لم يُعين كابتن بعد
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssigningOrderId(order.id)}
                                                            className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-bold transition flex items-center gap-1"
                                                        >
                                                            <UserCheck className="w-3 h-3" />
                                                            <span>تعيين كابتن الآن</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inline Driver Assignment Box if open */}
                                        {assigningOrderId === order.id && (
                                            <div className="p-3 mb-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2 animate-fade-in">
                                                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                                                    <span>اختر كابتن التوصيل للطلب {order.order_number}:</span>
                                                    <button onClick={() => setAssigningOrderId(null)} className="text-stone-400 hover:text-stone-600">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={selectedDriverId}
                                                        onChange={(e) => setSelectedDriverId(e.target.value)}
                                                        className="flex-1 py-1.5 px-3 rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-bold"
                                                    >
                                                        <option value="">-- اختر من الكباتن المتاحين --</option>
                                                        {available_drivers.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAssignDriver(order.id)}
                                                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                                                    >
                                                        تأكيد التعيين
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Items Breakdown */}
                                        <div className="space-y-1.5 mb-2">
                                            <span className="text-[11px] font-bold text-stone-400 block">
                                                الأصناف المطلوبة ({order.items?.length || 0}):
                                            </span>
                                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-50 dark:border-stone-800/60 last:border-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-600 font-black text-[10px] flex items-center justify-center">
                                                                {item.quantity}×
                                                            </span>
                                                            <span className="font-bold text-stone-800 dark:text-stone-200">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-stone-600 dark:text-stone-400">
                                                            {Number(item.total_price).toLocaleString()} ج.م
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Customer Notes if any */}
                                        {order.customer_notes && (
                                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 mb-2">
                                                <span className="font-bold block text-[10px]">ملاحظات خاصة من العميل:</span>
                                                <p className="italic">{order.customer_notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Footer & Workflow Actions */}
                                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] text-stone-400 block">المبلغ المطلوب</span>
                                            <span className="text-lg font-black text-stone-900 dark:text-white">
                                                {Number(order.total_amount).toLocaleString()} ج.م
                                            </span>
                                        </div>

                                        {/* Fast Advancement Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, 'CONFIRMED')}
                                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>قبول وتأكيد</span>
                                                </button>
                                            )}

                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                                                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                                                >
                                                    <Flame className="w-3.5 h-3.5" />
                                                    <span>بدء التجهيز بالمطبخ</span>
                                                </button>
                                            )}

                                            {order.status === 'PREPARING' && (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_PICKUP')}
                                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                                                >
                                                    <PackageCheck className="w-3.5 h-3.5" />
                                                    <span>الوجبة جاهزة</span>
                                                </button>
                                            )}

                                            <Link
                                                href={`/restaurant/orders/${order.id}`}
                                                className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition flex items-center gap-1"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>تفاصيل</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Table View */
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold">
                                        <th className="py-3 px-4">رقم الطلب</th>
                                        <th className="py-3 px-4">العميل والهاتف</th>
                                        <th className="py-3 px-4">العنوان</th>
                                        <th className="py-3 px-4">الأصناف</th>
                                        <th className="py-3 px-4">كابتن التوصيل</th>
                                        <th className="py-3 px-4">الإجمالي</th>
                                        <th className="py-3 px-4">الحالة</th>
                                        <th className="py-3 px-4">الوقت</th>
                                        <th className="py-3 px-4 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {items.map((order) => {
                                        const status = getStatusDetails(order.status);
                                        const customerUser = order.customer?.user;
                                        const driver = order.delivery_driver || order.deliveryDriver;

                                        return (
                                            <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition">
                                                <td className="py-4 px-4 font-mono font-black text-orange-600">
                                                    {order.order_number}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="font-bold text-stone-900 dark:text-white block">
                                                        {customerUser?.name || 'عميل'}
                                                    </span>
                                                    {customerUser?.phone && (
                                                        <a href={`tel:${customerUser.phone}`} className="text-[11px] text-stone-400 hover:text-orange-600 font-mono">
                                                            {customerUser.phone}
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-stone-500 max-w-xs truncate">
                                                    {order.address}
                                                </td>
                                                <td className="py-4 px-4 font-medium text-stone-700 dark:text-stone-300">
                                                    {order.items?.length || 0} أصناف
                                                </td>
                                                <td className="py-4 px-4">
                                                    {driver ? (
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                                                            {driver.name}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setAssigningOrderId(order.id)}
                                                            className="text-purple-600 text-[11px] font-bold hover:underline"
                                                        >
                                                            + تعيين كابتن
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 font-black text-stone-900 dark:text-white">
                                                    {Number(order.total_amount).toLocaleString()} ج.م
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${status.bg}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-stone-400 font-mono text-[11px]">
                                                    {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {order.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleAdvanceStatus(order.id, 'CONFIRMED')}
                                                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]"
                                                            >
                                                                تأكيد
                                                            </button>
                                                        )}
                                                        {order.status === 'CONFIRMED' && (
                                                            <button
                                                                onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                                                                className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px]"
                                                            >
                                                                طهي
                                                            </button>
                                                        )}
                                                        {order.status === 'PREPARING' && (
                                                            <button
                                                                onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_PICKUP')}
                                                                className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px]"
                                                            >
                                                                جاهز
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/restaurant/orders/${order.id}`}
                                                            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-orange-600"
                                                            title="عرض التفاصيل"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {orders?.links && orders.links.length > 3 && (
                    <div className="pt-6 flex items-center justify-center gap-1.5">
                        {orders.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-orange-600 text-white shadow-xs'
                                        : !link.url
                                        ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
                                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </RestaurantLayout>
    );
}
