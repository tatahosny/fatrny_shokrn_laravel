import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Bike, MapPin, Store, Route, Clock, Navigation, Phone, RefreshCw } from 'lucide-react';

interface CustomerLiveTrackingMapProps {
    orderNumber: string;
    customerLat?: number | null;
    customerLng?: number | null;
    customerAddress: string;
    restaurantLat?: number | null;
    restaurantLng?: number | null;
    restaurantName?: string;
    initialDriverLat?: number | null;
    initialDriverLng?: number | null;
    driverName?: string;
    driverPhone?: string;
    orderStatus: string;
}

export default function CustomerLiveTrackingMap({
    orderNumber,
    customerLat,
    customerLng,
    customerAddress,
    restaurantLat = 30.8725,
    restaurantLng = 29.5840,
    restaurantName = 'المطعم',
    initialDriverLat,
    initialDriverLng,
    driverName = 'كابتن التوصيل',
    driverPhone,
    orderStatus,
}: CustomerLiveTrackingMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const routeLineRef = useRef<L.Polyline | null>(null);

    // Never invent a Borg El Arab location: a missing pin must be fixed by the user.
    const hasCustomerPin = customerLat !== null && customerLat !== undefined && customerLng !== null && customerLng !== undefined && Number.isFinite(Number(customerLat)) && Number.isFinite(Number(customerLng));
    const hasRestaurantPin = restaurantLat !== null && restaurantLat !== undefined && restaurantLng !== null && restaurantLng !== undefined && Number.isFinite(Number(restaurantLat)) && Number.isFinite(Number(restaurantLng));
    const cLat = hasCustomerPin ? Number(customerLat) : 0;
    const cLng = hasCustomerPin ? Number(customerLng) : 0;
    const rLat = hasRestaurantPin ? Number(restaurantLat) : 0;
    const rLng = hasRestaurantPin ? Number(restaurantLng) : 0;

    // Driver Coordinates state
    const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(
        initialDriverLat && initialDriverLng 
            ? { lat: Number(initialDriverLat), lng: Number(initialDriverLng) } 
            : null
    );
    const [isPolling, setIsPolling] = useState(false);
    const [distanceKm, setDistanceKm] = useState<number | null>(null);

    // Distance calculation
    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    };

    // 1. Initialize Map
    useEffect(() => {
        if (!hasCustomerPin || !hasRestaurantPin) return;
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [cLat, cLng],
            zoom: 14,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        // 1. Restaurant Pin (Orange)
        const restIcon = L.divIcon({
            className: 'cust-track-restaurant',
            html: `
                <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 36px; height: 36px; background: #ea580c; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(234,88,12,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
                    </div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });

        L.marker([rLat, rLng], { icon: restIcon })
            .addTo(map)
            .bindPopup(`<div style="direction: rtl; text-align: right; font-family: inherit;"><strong>🏪 ${restaurantName}</strong><p style="margin:0;font-size:11px;color:#666;">نقطة تحضير الوجبة</p></div>`);

        // 2. Customer Pin (Green)
        const custIcon = L.divIcon({
            className: 'cust-track-destination',
            html: `
                <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
                    <div style="position: absolute; inset: 0; background: #10b981; opacity: 0.35; border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                    <div style="position: relative; width: 38px; height: 38px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
        });

        L.marker([cLat, cLng], { icon: custIcon })
            .addTo(map)
            .bindPopup(`<div style="direction: rtl; text-align: right; font-family: inherit;"><strong style="color:#10b981;">📍 مكان استلامك للطلب</strong><p style="margin:2px 0 0 0;font-size:11px;color:#333;">${customerAddress}</p></div>`)
            .openPopup();

        // 3. Initial bounds
        const bounds = L.latLngBounds([[rLat, rLng], [cLat, cLng]]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [cLat, cLng, rLat, rLng, restaurantName, customerAddress, hasCustomerPin, hasRestaurantPin]);

    // 2. Poll Driver Location every 4 seconds
    useEffect(() => {
        let isMounted = true;

        const fetchDriverLocation = async () => {
            try {
                const res = await axios.get(`/orders/${orderNumber}/driver-location`);
                if (!isMounted) return;

                const data = res.data;
                if (data.driver && data.driver.latitude && data.driver.longitude) {
                    const dLat = Number(data.driver.latitude);
                    const dLng = Number(data.driver.longitude);
                    setDriverCoords({ lat: dLat, lng: dLng });

                    const dist = calcDistance(dLat, dLng, cLat, cLng);
                    setDistanceKm(dist);

                    const map = mapInstanceRef.current;
                    if (!map) return;

                    // Create or update driver marker
                    if (!driverMarkerRef.current) {
                        const driverIcon = L.divIcon({
                            className: 'cust-live-driver-pin',
                            html: `
                                <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                                    <div style="position: absolute; inset: 0; background: #0284c7; opacity: 0.35; border-radius: 50%; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                                    <div style="position: relative; width: 42px; height: 42px; background: #0f172a; border: 3px solid #38bdf8; border-radius: 50%; box-shadow: 0 6px 16px rgba(2,132,199,0.5); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                                    </div>
                                </div>
                            `,
                            iconSize: [50, 50],
                            iconAnchor: [25, 25],
                        });

                        const marker = L.marker([dLat, dLng], { icon: driverIcon, zIndexOffset: 1000 })
                            .addTo(map)
                            .bindPopup(`<div style="direction: rtl; text-align: right; font-family: inherit;"><strong style="color:#0284c7;">🛵 ${driverName}</strong><p style="margin:2px 0 0 0;font-size:11px;color:#555;">في الطريق إليك الآن</p></div>`);

                        driverMarkerRef.current = marker;
                    } else {
                        driverMarkerRef.current.setLatLng([dLat, dLng]);
                    }

                    // Draw the road geometry. A straight line would make the driver look like flying.
                    const route = await axios.get(`https://router.project-osrm.org/route/v1/driving/${dLng},${dLat};${cLng},${cLat}`, { params: { overview: 'full', geometries: 'geojson' } });
                    const coordinates = route.data?.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng]);
                    if (coordinates?.length) {
                        if (!routeLineRef.current) {
                            routeLineRef.current = L.polyline(coordinates, { color: '#0284c7', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(map);
                        } else routeLineRef.current.setLatLngs(coordinates);
                    }
                }
            } catch {
                // Silently handle poll error
            }
        };

        fetchDriverLocation();
        const intervalId = setInterval(fetchDriverLocation, 4000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [orderNumber, cLat, cLng, driverName, hasCustomerPin, hasRestaurantPin]);

    // Estimated arrival minutes (~3.2 mins/km)
    const estimatedMinutes = distanceKm !== null ? Math.max(2, Math.round(distanceKm * 3.2)) : null;

    const handleFocusDriver = () => {
        const map = mapInstanceRef.current;
        if (map && driverCoords) {
            map.setView([driverCoords.lat, driverCoords.lng], 16, { animate: true });
        }
    };

    const handleFitAll = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const points: [number, number][] = [
            [rLat, rLng],
            [cLat, cLng],
        ];
        if (driverCoords) {
            points.push([driverCoords.lat, driverCoords.lng]);
        }
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    };

    if (!hasCustomerPin || !hasRestaurantPin) {
        return <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-800">لا يمكن عرض التتبع بدقة لأن موقع العميل أو المطعم غير محدد. افتح الطلب وحدد الدبوس الصحيح.</div>;
    }

    return (
        <div className="space-y-3 animate-fade-in">
            {/* Live Tracking HUD Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-stone-900 to-sky-950 text-white shadow-xl border border-sky-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
                            <Bike className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-sky-300">
                                    تتبع مسار التوصيل المباشر 🛰️
                                </span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                                {orderStatus === 'OUT_FOR_DELIVERY' 
                                    ? `الكابتن (${driverName}) يقود باتجاه موقعك الآن 🛵` 
                                    : `الكابتن (${driverName}) في طريقه للمطعم لاستلام وجبتك`}
                            </h3>
                        </div>
                    </div>

                    {/* Live Metrics */}
                    <div className="flex items-center gap-2 text-xs">
                        {distanceKm !== null ? (
                            <>
                                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-1.5">
                                    <Route className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="font-bold">على بعد {distanceKm} كم</span>
                                </div>
                                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-bold">يصل خلال ~{estimatedMinutes} دقيقة</span>
                                </div>
                            </>
                        ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-1.5 text-[11px] text-stone-300">
                                <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                                <span>جاري استلام إشارة كابتن التوصيل...</span>
                            </div>
                        )}
                    </div>
                </div>

                {driverPhone && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-stone-400">للتواصل مع الكابتن:</span>
                        <a 
                            href={`tel:${driverPhone}`}
                            className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 transition text-xs"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            <span>اتصال بالكابتن ({driverPhone})</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Map Canvas */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-sky-500/20 shadow-lg">
                <div
                    ref={mapContainerRef}
                    className="w-full h-80 sm:h-96 z-0"
                    style={{ minHeight: '320px' }}
                />

                {/* Floating Map Actions */}
                <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                    {driverCoords && (
                        <button
                            type="button"
                            onClick={handleFocusDriver}
                            className="p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white shadow-lg backdrop-blur-md font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                            title="مكان الكابتن"
                        >
                            <Bike className="w-4 h-4" />
                            <span className="hidden sm:inline">مكان الكابتن</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleFitAll}
                        className="p-2.5 rounded-2xl bg-stone-900/80 hover:bg-stone-900 text-white shadow-lg backdrop-blur-md font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="كامل المسار"
                    >
                        <Navigation className="w-4 h-4" />
                        <span className="hidden sm:inline">كامل المسار</span>
                    </button>
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 z-[400] bg-stone-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md border border-white/10 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sky-400">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" /> الكابتن
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> موقعك
                    </span>
                    <span className="flex items-center gap-1 text-orange-400">
                        <span className="w-2 h-2 rounded-full bg-orange-400" /> المطعم
                    </span>
                </div>
            </div>
        </div>
    );
}
