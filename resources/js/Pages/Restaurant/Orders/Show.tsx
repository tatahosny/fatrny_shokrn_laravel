import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Order, DeliveryDriver } from '../../../Types';
import DeliveryFeeConfirmModal from '../../../Components/DeliveryFeeConfirmModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Bike,
    User,
    MapPin,
    Phone,
    Navigation,
    ArrowRight,
    Store,
    Maximize2,
    RefreshCw,
    Lock,
    CheckCircle2,
} from 'lucide-react';

interface OrderShowProps {
    order: Order;
    available_drivers: DeliveryDriver[];
}

// ─── Landmark Fallback Coords (Borg El Arab) ───────────────────────────────
const LANDMARK_COORDS: Record<string, [number, number]> = {
    'BATU': [30.8756, 29.5842], 'تكنولوجية': [30.8756, 29.5842],
    'EJUST': [30.8648, 29.5741], 'اليابانية': [30.8648, 29.5741],
    'سنجور': [30.8805, 29.5912], 'سموحة': [30.8580, 29.5930],
    'الهوارية': [30.8920, 29.6010], 'الحي الأول': [30.8710, 29.5890],
};

function resolveCoords(lat?: number | null, lng?: number | null, address?: string): [number, number] {
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) return [Number(lat), Number(lng)];
    if (address) {
        for (const [key, coords] of Object.entries(LANDMARK_COORDS)) {
            if (address.includes(key)) return coords;
        }
    }
    return [30.8752, 29.5841];
}

function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// ─── Restaurant Order Map ────────────────────────────────────────────────────
// Read-only view for restaurant staff:
//  • Restaurant pin (orange)
//  • Customer delivery pin (emerald pulse)
//  • OSRM route polyline
//  • Driver live position (sky) — polled every 6s from backend
// ────────────────────────────────────────────────────────────────────────────
function RestaurantOrderMap({
    order,
    driver,
}: {
    order: Order;
    driver?: DeliveryDriver | null;
}) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef  = useRef<L.Map | null>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const routeLineRef    = useRef<L.Polyline | null>(null);

    const [driverPos, setDriverPos] = useState<{ lat: number; lng: number; heading: number } | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distKm: number; durationMin: number } | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [mapError, setMapError] = useState(false);

    const restaurant = order.restaurant;
    const rLat = restaurant?.latitude ? Number(restaurant.latitude) : 30.8700;
    const rLng = restaurant?.longitude ? Number(restaurant.longitude) : 29.5800;
    const [cLat, cLng] = resolveCoords(order.latitude, order.longitude, order.address);
    const straightDistKm = calcDistanceKm(rLat, rLng, cLat, cLng);

    // Fetch road route via OSRM
    const fetchRoute = useCallback(async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
        setIsLoadingRoute(true);
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (data.routes?.length > 0) {
                const route = data.routes[0];
                setRouteInfo({
                    distKm: Math.round(route.distance / 100) / 10,
                    durationMin: Math.max(1, Math.round(route.duration / 60)),
                });
                const coords = route.geometry.coordinates.map(
                    (pt: [number, number]) => [pt[1], pt[0]] as L.LatLngTuple
                );
                const map = mapInstanceRef.current;
                if (map) {
                    if (!routeLineRef.current) {
                        routeLineRef.current = L.polyline(coords, {
                            color: '#f97316', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round',
                        }).addTo(map);
                    } else {
                        routeLineRef.current.setLatLngs(coords);
                    }
                }
            }
        } catch {
            const map = mapInstanceRef.current;
            if (map) {
                const fallback: L.LatLngTuple[] = [[fromLat, fromLng], [toLat, toLng]];
                if (!routeLineRef.current) {
                    routeLineRef.current = L.polyline(fallback, {
                        color: '#f97316', weight: 4, dashArray: '8,6', opacity: 0.7,
                    }).addTo(map);
                } else {
                    routeLineRef.current.setLatLngs(fallback);
                }
            }
        } finally {
            setIsLoadingRoute(false);
        }
    }, []);

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number };
        if (container._leaflet_id) delete container._leaflet_id;
        if (mapInstanceRef.current) {
            try { mapInstanceRef.current.remove(); } catch { /* ignore */ }
            mapInstanceRef.current = null;
        }

        let map: L.Map;
        try {
            map = L.map(container, { center: [rLat, rLng], zoom: 14, zoomControl: false });
        } catch {
            setMapError(true);
            return;
        }

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors', maxZoom: 19,
        }).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Restaurant marker (orange)
        const restIcon = L.divIcon({
            className: '',
            html: `<div style="width:44px;height:44px;background:#ea580c;border:3px solid #fff;border-radius:50%;box-shadow:0 4px 14px rgba(234,88,12,.5);display:flex;align-items:center;justify-content:center;color:#fff;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                    <path d="M2 7h20"/>
                </svg>
            </div>`,
            iconSize: [44, 44], iconAnchor: [22, 22],
        });
        L.marker([rLat, rLng], { icon: restIcon })
            .addTo(map)
            .bindPopup(`<div dir="rtl" style="font-family:inherit;padding:4px;"><span style="font-size:10px;font-weight:800;color:#ea580c;">🏪 مطعمك — نقطة الانطلاق</span><br/><strong>${restaurant?.name || 'المطعم'}</strong></div>`);

        // Customer marker (emerald pulse)
        const custIcon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;inset:0;background:#10b981;opacity:.3;border-radius:50%;animation:ping 1.8s cubic-bezier(0,0,.2,1) infinite;"></div>
                <div style="width:40px;height:40px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 4px 14px rgba(16,185,129,.5);display:flex;align-items:center;justify-content:center;color:#fff;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
            </div>`,
            iconSize: [48, 48], iconAnchor: [24, 24],
        });
        const customerName = order.customer?.user?.name || 'العميل';
        L.marker([cLat, cLng], { icon: custIcon })
            .addTo(map)
            .bindPopup(
                `<div dir="rtl" style="font-family:inherit;padding:4px;">
                    <span style="font-size:10px;font-weight:800;color:#10b981;">📍 موقع الاستلام — العميل</span>
                    <br/><strong>${customerName}</strong>
                    <br/><span style="font-size:11px;color:#555;">${order.address}</span>
                </div>`
            )
            .openPopup();

        map.fitBounds([[rLat, rLng], [cLat, cLng]], { padding: [50, 50], maxZoom: 15 });
        mapInstanceRef.current = map;

        // Fetch route (restaurant → customer)
        fetchRoute(rLat, rLng, cLat, cLng);

        const t1 = setTimeout(() => map.invalidateSize(), 150);
        const t2 = setTimeout(() => map.invalidateSize(), 450);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            try { map.remove(); } catch { /* ignore */ }
            mapInstanceRef.current = null;
        };
    }, [rLat, rLng, cLat, cLng]);

    // Poll driver live position from backend every 6s (only when OUT_FOR_DELIVERY)
    useEffect(() => {
        if (order.status !== 'OUT_FOR_DELIVERY' || !order.id) return;
        let active = true;

        const poll = async () => {
            try {
                const res = await fetch(`/restaurant/orders/${order.id}/driver-location`);
                if (!res.ok || !active) return;
                const data = await res.json();
                if (data.latitude && data.longitude) {
                    const dLat = Number(data.latitude);
                    const dLng = Number(data.longitude);
                    const heading = Number(data.heading ?? 0);
                    setDriverPos({ lat: dLat, lng: dLng, heading });

                    const map = mapInstanceRef.current;
                    if (map) {
                        const driverIcon = L.divIcon({
                            className: '',
                            html: `<div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
                                <div style="position:absolute;inset:0;background:#0284c7;opacity:.3;border-radius:50%;animation:ping 1.2s cubic-bezier(0,0,.2,1) infinite;"></div>
                                <div style="width:44px;height:44px;background:#0f172a;border:3.5px solid #38bdf8;border-radius:50%;box-shadow:0 6px 20px rgba(2,132,199,.7);display:flex;align-items:center;justify-content:center;color:#38bdf8;transform:rotate(${heading}deg);">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="m12 2 7 19-7-4-7 4 7-19z"/>
                                    </svg>
                                </div>
                            </div>`,
                            iconSize: [52, 52], iconAnchor: [26, 26],
                        });
                        if (!driverMarkerRef.current) {
                            driverMarkerRef.current = L.marker([dLat, dLng], { icon: driverIcon, zIndexOffset: 1000 })
                                .addTo(map)
                                .bindPopup(`<div dir="rtl" style="font-family:inherit;padding:4px;color:#0284c7;font-weight:800;">🛵 الطيار — ${driver?.name || 'كابتن التوصيل'}</div>`);
                        } else {
                            driverMarkerRef.current.setLatLng([dLat, dLng]);
                            driverMarkerRef.current.setIcon(driverIcon);
                        }
                        // Update route from driver → customer
                        fetchRoute(dLat, dLng, cLat, cLng);
                    }
                }
            } catch { /* silent */ }
        };

        poll();
        const interval = setInterval(poll, 6000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [order.status, order.id, cLat, cLng, driver, fetchRoute]);

    const handleFitAll = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const pts: L.LatLngTuple[] = [[rLat, rLng], [cLat, cLng]];
        if (driverPos) pts.push([driverPos.lat, driverPos.lng]);
        map.fitBounds(pts, { padding: [40, 40], maxZoom: 16 });
    };

    const driverDistToCustomer = driverPos
        ? calcDistanceKm(driverPos.lat, driverPos.lng, cLat, cLng)
        : null;

    return (
        <div className="space-y-3">
            {/* Info bar: straight dist / road dist / ETA */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-center space-y-0.5">
                    <p className="text-[10px] font-bold text-orange-500 uppercase">المسافة (بالهواء)</p>
                    <p className="font-black text-stone-900 dark:text-white text-base">{straightDistKm} كم</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-0.5">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">مسافة الطريق</p>
                    <p className="font-black text-stone-900 dark:text-white text-base">
                        {isLoadingRoute ? '...' : routeInfo ? `${routeInfo.distKm} كم` : `~${straightDistKm} كم`}
                    </p>
                </div>
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center space-y-0.5 col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-bold text-sky-500 uppercase">وقت التوصيل المتوقع</p>
                    <p className="font-black text-stone-900 dark:text-white text-base">
                        {isLoadingRoute ? '...' : routeInfo ? `~${routeInfo.durationMin} دقيقة` : `~${Math.max(2, Math.round(straightDistKm * 3.5))} دقيقة`}
                    </p>
                </div>
            </div>

            {/* Driver live position badge */}
            {order.status === 'OUT_FOR_DELIVERY' && (
                <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    driverPos
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                }`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${driverPos ? 'bg-sky-500 animate-pulse' : 'bg-amber-400'}`} />
                    {driverPos
                        ? `🛵 الطيار في الطريق — يبعد عن العميل ~${driverDistToCustomer} كم`
                        : 'جاري تحديد موقع الطيار... يتم التحديث كل 6 ثوانٍ'
                    }
                </div>
            )}

            {/* Map Canvas */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-orange-400/30 dark:border-orange-500/20 shadow-lg bg-stone-100 dark:bg-stone-800">
                <div
                    ref={mapContainerRef}
                    className="w-full z-0"
                    style={{ height: '380px', minHeight: '320px' }}
                />

                {/* Fallback if Leaflet init fails */}
                {mapError && (
                    <div className="absolute inset-0 z-[400] flex items-center justify-center bg-stone-100 dark:bg-stone-800 p-6 text-center">
                        <div className="space-y-2">
                            <MapPin className="mx-auto w-8 h-8 text-orange-500" />
                            <p className="text-xs font-black text-stone-700 dark:text-white">تعذر تحميل الخريطة</p>
                            <p className="text-[11px] text-stone-500">الإحداثيات: {cLat.toFixed(5)}, {cLng.toFixed(5)}</p>
                        </div>
                    </div>
                )}

                {/* Floating Map Controls */}
                <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={handleFitAll}
                        className="p-2 rounded-xl bg-stone-900/85 hover:bg-stone-900 text-white shadow-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="عرض المسار كاملاً"
                    >
                        <Maximize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">كامل المسار</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => mapInstanceRef.current?.setView([cLat, cLng], 17, { animate: true })}
                        className="p-2 rounded-xl bg-emerald-700/85 hover:bg-emerald-700 text-white shadow-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="موقع العميل"
                    >
                        <MapPin className="w-4 h-4" />
                        <span className="hidden sm:inline">العميل</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => mapInstanceRef.current?.setView([rLat, rLng], 17, { animate: true })}
                        className="p-2 rounded-xl bg-orange-700/85 hover:bg-orange-700 text-white shadow-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="موقع المطعم"
                    >
                        <Store className="w-4 h-4" />
                        <span className="hidden sm:inline">المطعم</span>
                    </button>
                    {driverPos && (
                        <button
                            type="button"
                            onClick={() => mapInstanceRef.current?.setView([driverPos.lat, driverPos.lng], 17, { animate: true })}
                            className="p-2 rounded-xl bg-sky-700/85 hover:bg-sky-700 text-white shadow-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                            title="موقع الطيار الآن"
                        >
                            <Navigation className="w-4 h-4" />
                            <span className="hidden sm:inline">الطيار</span>
                        </button>
                    )}
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-3 right-3 z-[400] bg-stone-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow border border-white/10 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-400" /> المطعم</span>
                    <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> العميل</span>
                    {driverPos && <span className="flex items-center gap-1 text-sky-400"><span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" /> الطيار</span>}
                </div>

                {/* Route loading spinner */}
                {isLoadingRoute && (
                    <div className="absolute top-3 right-3 z-[400] bg-stone-900/85 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        جاري حساب المسار...
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Item Selections Helper ──────────────────────────────────────────────────
function ItemSelections({ item }: { item: NonNullable<Order['items']>[number] }) {
    const options = Array.isArray(item.selected_options) ? item.selected_options : [];
    const addons  = Array.isArray(item.selected_addons)  ? item.selected_addons  : [];
    if (options.length === 0 && addons.length === 0) return null;
    return (
        <div className="mt-1 space-y-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            {options.map((o, i) => <p key={i}>{o.option_name}: {o.value_name}</p>)}
            {addons.map((a, i)  => <p key={i}>إضافة: {a.name}</p>)}
        </div>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function Show({ order, available_drivers = [] }: OrderShowProps) {
    const driver = order.delivery_driver || order.deliveryDriver;
    const [selectedDriverId, setSelectedDriverId] = useState<string | number>(order.assigned_delivery_id || '');
    const [feeModalOpen, setFeeModalOpen] = useState(false);

    const handleAdvanceStatus = (status: string) =>
        router.patch(`/restaurant/orders/${order.id}/status`, { status });

    const confirmWithDeliveryFee = (delivery_fee: number) => {
        router.patch(`/restaurant/orders/${order.id}/status`, { status: 'CONFIRMED', delivery_fee });
        setFeeModalOpen(false);
    };

    const handleAssignDriver = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDriverId) return;
        router.post(`/restaurant/orders/${order.id}/assign-driver`, { driver_id: Number(selectedDriverId) });
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; bg: string }> = {
            PENDING:           { label: 'بانتظار قبول المطعم',    bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
            CONFIRMED:         { label: 'تم التأكيد',              bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
            PREPARING:         { label: 'قيد الطهي والتجهيز',     bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
            READY_FOR_PICKUP:  { label: 'جاهز بانتظار الطيار',    bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
            OUT_FOR_DELIVERY:  { label: 'في الطريق للعميل 🚴',    bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
            DELIVERED:         { label: 'تم التسليم بنجاح ✅',    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
            CANCELLED:         { label: 'طلب ملغي',               bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
        };
        const s = map[status] || { label: status, bg: 'bg-stone-100 text-stone-700' };
        return <span className={`px-3 py-1 rounded-full text-xs font-black ${s.bg}`}>{s.label}</span>;
    };

    return (
        <>
            <Head title={`تفاصيل طلب ${order.order_number} — بوابة المطعم — فطرنا`} />
            <div className="space-y-6" dir="rtl">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-mono font-black text-orange-600">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-stone-400 mt-1">تاريخ الاستلام: {new Date(order.created_at).toLocaleString('ar-EG')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {order.status === 'PENDING' && (
                            <button onClick={() => setFeeModalOpen(true)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">تأكيد الطلب</button>
                        )}
                        {order.status === 'CONFIRMED' && (
                            <button onClick={() => handleAdvanceStatus('PREPARING')} className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs">بدء التجهيز بالمطبخ</button>
                        )}
                        {order.status === 'PREPARING' && (
                            <button onClick={() => handleAdvanceStatus('READY_FOR_PICKUP')} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">تم التجهيز — جاهز للاستلام</button>
                        )}
                        <Link href="/restaurant/orders" className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 mr-4">
                            <span>رجوع للطلبات</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left 2/3: Items + Customer Map ─────────────── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Kitchen Items */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                                محتويات الطلب للمطبخ
                            </h2>
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold">{item.quantity}</span>
                                            <div>
                                                <h3 className="font-bold text-stone-900 dark:text-white text-sm">{item.name}</h3>
                                                <ItemSelections item={item} />
                                                {item.notes && <p className="text-[11px] text-amber-600 font-bold">ملاحظة: {item.notes}</p>}
                                            </div>
                                        </div>
                                        <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">{item.total_price} ج.م</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info + Delivery Map Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                موقع العميل وخريطة التوصيل
                            </h2>

                            {/* Customer Text Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5">
                                    <p className="font-bold text-[10px] text-stone-400 uppercase">بيانات العميل</p>
                                    <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                        {order.customer?.user?.name || 'عميل'}
                                    </p>
                                    {order.customer?.user?.phone && (
                                        <a href={`tel:${order.customer.user.phone}`} className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-orange-600 font-mono">
                                            <Phone className="w-3.5 h-3.5 shrink-0" />
                                            {order.customer.user.phone}
                                        </a>
                                    )}
                                </div>
                                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                                    <p className="font-bold text-[10px] text-emerald-500 uppercase">عنوان الاستلام الكامل</p>
                                    <p className="text-stone-700 dark:text-stone-200 leading-relaxed">{order.address}</p>
                                    {order.latitude && order.longitude && (
                                        <p className="font-mono text-[10px] text-stone-400">
                                            📡 {Number(order.latitude).toFixed(5)}, {Number(order.longitude).toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {order.customer_notes && (
                                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 font-bold">
                                    💬 ملاحظة العميل: {order.customer_notes}
                                </div>
                            )}

                            {/* Embedded Delivery Map */}
                            <RestaurantOrderMap order={order} driver={driver} />
                        </div>
                    </div>

                    {/* ── Right 1/3: Driver + Financials ─────────────── */}
                    <div className="space-y-6">

                        {/* Driver Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                            <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <Bike className="w-4 h-4 text-emerald-600" />
                                كابتن التوصيل
                            </h2>
                            {driver ? (
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-stone-800 border border-emerald-200 dark:border-stone-700 text-xs space-y-2">
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">الطيار المعين</p>
                                    <p className="font-bold text-sm text-stone-900 dark:text-white">{driver.name}</p>
                                    <p className="font-mono text-stone-500 font-bold">{driver.phone}</p>
                                    {driver.phone && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <a href={`tel:${driver.phone}`} className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center">اتصال بالطيار</a>
                                            <a href={`https://wa.me/2${driver.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="py-1.5 px-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">واتساب</a>
                                        </div>
                                    )}
                                </div>
                            ) : order.status === 'READY_FOR_PICKUP' ? (
                                <form onSubmit={handleAssignDriver} className="space-y-3">
                                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                                        <span>الطلب جاهز الآن بالمطبخ — يمكنك اختيار وتكليف الطيار</span>
                                    </div>
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400">إسناد الطلب لطيار متاح</label>
                                    <select
                                        value={selectedDriverId}
                                        onChange={(e) => setSelectedDriverId(e.target.value)}
                                        className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- اختر كابتن متاح --</option>
                                        {available_drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                                        ))}
                                    </select>
                                    <button type="submit" disabled={!selectedDriverId} className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow disabled:opacity-50 transition cursor-pointer">
                                        إسناد وتكليف الطيار
                                    </button>
                                </form>
                            ) : ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) ? (
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                                        <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                                        <span>خانة اختيار الطيار مغلقة حالياً</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                                        يجب أولاً الانتهاء من تجهيز الطلب وتحويله إلى <strong className="text-purple-600 dark:text-purple-400">"تم التجهيز — جاهز للاستلام"</strong> لتفتح خانة اختيار وإسناد كابتن التوصيل.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 text-center">
                                    لا يمكن إسناد طيار في الحالة الحالية للطلب.
                                </div>
                            )}
                        </div>

                        {/* Financials */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 text-xs">
                            <h2 className="text-base font-black text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">الحساب المالي للطلب</h2>
                            <div className="flex items-center justify-between text-stone-500">
                                <span>قيمة المنيو (المطبخ)</span>
                                <span className="font-bold text-stone-900 dark:text-white">{order.subtotal} ج.م</span>
                            </div>
                            <div className="flex items-center justify-between text-stone-500">
                                <span>رسوم التوصيل</span>
                                <span className="font-bold text-stone-900 dark:text-white">{order.delivery_fee} ج.م</span>
                            </div>
                            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-sm font-black text-stone-900 dark:text-white">
                                <span>إجمالي الطلب الكلي</span>
                                <span className="text-xl text-orange-600">{order.total_amount} ج.م</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeliveryFeeConfirmModal
                isOpen={feeModalOpen}
                orderNumber={order.order_number}
                onClose={() => setFeeModalOpen(false)}
                onConfirm={confirmWithDeliveryFee}
            />
        </>
    );
}
