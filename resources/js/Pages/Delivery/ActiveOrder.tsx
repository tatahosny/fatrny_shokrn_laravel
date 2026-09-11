import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DeliveryLayout from '../../Layouts/DeliveryLayout';
import { DeliveryDriver, Order } from '../../Types';
import DeliveryRouteMap from '../../Components/DeliveryRouteMap';
import { 
    Bike, 
    Phone, 
    MapPin, 
    Store, 
    CheckCircle2, 
    ArrowRight
} from 'lucide-react';

interface ActiveOrderProps {
    order: Order;
    driver: DeliveryDriver;
}

export default function ActiveOrder({ order, driver }: ActiveOrderProps) {
    const handleUpdateStatus = (nextStatus: 'OUT_FOR_DELIVERY' | 'DELIVERED') => {
        router.patch(`/delivery/orders/${order.id}/status`, {
            status: nextStatus
        });
    };


    return (
        <DeliveryLayout title={`تفاصيل توصيل طلب ${order.order_number}`}>
            <Head title={`مهمة التوصيل ${order.order_number} — كابتن فطرنا شكراً`} />

            <div className="space-y-6">
                {/* Header card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-mono font-bold text-emerald-600 block">
                            {order.order_number}
                        </span>
                        <h1 className="text-lg font-black text-stone-900 dark:text-white mt-0.5">
                            مهمة توصيل نشطة
                        </h1>
                    </div>
                    <Link
                        href="/delivery/dashboard"
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1"
                    >
                        <span>الرجوع للرئيسية</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Status Advancement Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-bold text-emerald-100 tracking-wider">
                            الحالة الحالية للطلب
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-sm">
                            {order.status === 'OUT_FOR_DELIVERY' ? 'في الطريق إلى العميل' : 'مكلف بالاستلام من المطعم'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {order.status === 'ASSIGNED_TO_DRIVER' && (
                            <button
                                onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                                className="flex-1 py-3 px-4 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs shadow transition flex items-center justify-center gap-2"
                            >
                                <Bike className="w-4 h-4" />
                                <span>استلمت الوجبات وبدأت التحرك للعنوان</span>
                            </button>
                        )}

                        {order.status === 'OUT_FOR_DELIVERY' && (
                            <button
                                onClick={() => handleUpdateStatus('DELIVERED')}
                                className="flex-1 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5 text-stone-950" />
                                <span>تأكيد تسليم الطلب وتحصيل {order.total_amount} ج.م كاش</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Locations: Restaurant and Customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Restaurant Location */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Store className="w-4 h-4 text-orange-500" />
                                <span>المطعم: {order.restaurant?.name}</span>
                            </h2>
                            {order.restaurant?.phone && (
                                <a 
                                    href={`tel:${order.restaurant.phone}`} 
                                    className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 text-xs font-bold flex items-center gap-1"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>اتصال بالمطعم</span>
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                            {order.restaurant?.address || 'برج العرب الجديدة'}
                        </p>
                    </div>

                    {/* Customer Location */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>العميل: {order.customer?.user?.name}</span>
                            </h2>
                            {order.customer?.user?.phone && (
                                <a 
                                    href={`tel:${order.customer.user.phone}`} 
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>اتصال بالعميل</span>
                                </a>
                            )}
                        </div>
                        <p className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                            {order.address}
                        </p>
                        {order.customer_notes && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                                ملاحظة العميل: {order.customer_notes}
                            </p>
                        )}
                    </div>
                </div>

                {/* Route Map */}
                <DeliveryRouteMap
                    restaurantLat={Number(order.restaurant?.latitude) || 30.8700}
                    restaurantLng={Number(order.restaurant?.longitude) || 29.5800}
                    restaurantName={order.restaurant?.name || 'المطعم'}
                    restaurantAddress={order.restaurant?.address}
                    restaurantPhone={order.restaurant?.phone}
                    customerLat={order.latitude ? Number(order.latitude) : undefined}
                    customerLng={order.longitude ? Number(order.longitude) : undefined}
                    customerAddress={order.address}
                    customerName={order.customer?.user?.name || 'العميل'}
                    customerPhone={order.customer?.user?.phone}
                    orderStatus={order.status}
                    orderId={order.id}
                />

                {/* Items Checklist */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                    <h2 className="text-base font-black text-stone-900 dark:text-white">
                        قائمة الوجبات للاستلام والمطابقة
                    </h2>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                        {order.items?.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                                        {item.quantity}
                                    </span>
                                    <span className="font-bold text-stone-900 dark:text-white">
                                        {item.name}
                                    </span>
                                </div>
                                <span className="font-bold text-stone-600 dark:text-stone-300">
                                    {item.total_price} ج.م
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cash settlement box */}
                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-stone-800/80 border border-amber-300 dark:border-stone-700 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block">
                            المطلوب تحصيله نقداً (شامل التوصيل)
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">سلم الوجبة واستلم المبلغ بالكامل</p>
                    </div>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {order.total_amount} ج.م
                    </span>
                </div>
            </div>
        </DeliveryLayout>
    );
}
