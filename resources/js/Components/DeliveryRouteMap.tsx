import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { 
    MapPin, 
    Route, 
    Bike, 
    Store, 
    Crosshair, 
    Maximize2, 
    Navigation, 
    Clock, 
    Compass,
    Gauge,
    ArrowUp,
    CheckCircle2,
    Volume2,
    Shield
} from 'lucide-react';

interface DeliveryRouteMapProps {
    customerLat?: number | null;
    customerLng?: number | null;
    customerAddress: string;
    customerName?: string;
    customerPhone?: string;
    restaurantLat?: number | null;
    restaurantLng?: number | null;
    restaurantName?: string;
    restaurantAddress?: string;
    restaurantPhone?: string;
    orderStatus?: string;
    orderId?: number;
}

// Fallback Landmark coordinates in New Borg El Arab
const LANDMARK_COORDS: Record<string, [number, number]> = {
    'BATU': [30.8756, 29.5842],
    'تكنولوجية': [30.8756, 29.5842],
    'EJUST': [30.8648, 29.5741],
    'اليابانية': [30.8648, 29.5741],
    'سنجور': [30.8805, 29.5912],
    'سموحة': [30.8580, 29.5930],
    'الهوارية': [30.8920, 29.6010],
    'الحي الأول': [30.8710, 29.5890],
    'الحي الثاني': [30.8650, 29.5950],
    'مجاورة': [30.8720, 29.5880],
};

function resolveCustomerCoords(lat?: number | null, lng?: number | null, address?: string): [number, number] {
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        return [Number(lat), Number(lng)];
    }
    if (address) {
        for (const [key, coords] of Object.entries(LANDMARK_COORDS)) {
            if (address.includes(key)) {
                return coords;
            }
        }
    }
    return [30.8752, 29.5841];
}

export default function DeliveryRouteMap({
    customerLat,
    customerLng,
    customerAddress,
    customerName = 'العميل',
    customerPhone,
    restaurantLat = 30.8700,
    restaurantLng = 29.5800,
    restaurantName = 'المطعم',
    restaurantAddress,
    restaurantPhone,
    orderStatus = 'ASSIGNED_TO_DRIVER',
    orderId,
}: DeliveryRouteMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    // Markers & Polylines refs
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const customerMarkerRef = useRef<L.Marker | null>(null);
    const restaurantMarkerRef = useRef<L.Marker | null>(null);
    const roadPolylineRef = useRef<L.Polyline | null>(null);
    const lastSyncTimeRef = useRef<number>(0);
    const prevPositionRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

    // Resolved Coordinates
    const rLat = Number(restaurantLat) || 30.8725;
    const rLng = Number(restaurantLng) || 29.5840;
    const [cLat, cLng] = resolveCustomerCoords(customerLat, customerLng, customerAddress);

    // Navigation State
    const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isGpsActive, setIsGpsActive] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [isNavMode, setIsNavMode] = useState(true); // Close-up Turn-by-Turn view
    const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
    const [currentHeading, setCurrentHeading] = useState<number | null>(null);
    const [roadDistanceMeters, setRoadDistanceMeters] = useState<number | null>(null);
    const [roadDurationSecs, setRoadDurationSecs] = useState<number | null>(null);
    const [nextInstruction, setNextInstruction] = useState<string>('ابدأ بالتحرك نحو وجهتك المحددة');

    const isOutForDelivery = orderStatus === 'OUT_FOR_DELIVERY';
    const targetDestinationCoords: [number, number] = isOutForDelivery ? [cLat, cLng] : [rLat, rLng];
    const targetDestinationName = isOutForDelivery ? customerName : restaurantName;

    // Haversine distance calculator
    const calcDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    };

    // Calculate heading (bearing) between two lat/lng points
    const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
        const startLatRad = startLat * Math.PI / 180;
        const startLngRad = startLng * Math.PI / 180;
        const destLatRad = destLat * Math.PI / 180;
        const destLngRad = destLng * Math.PI / 180;

        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
                  Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        return (brng + 360) % 360;
    };

    // Fetch real road routing via OSRM
    const fetchRoadRoute = useCallback(async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                setRoadDistanceMeters(Math.round(route.distance));
                setRoadDurationSecs(Math.round(route.duration));

                // Extract turn instruction
                if (route.legs && route.legs[0]?.steps && route.legs[0].steps.length > 0) {
                    const nextStep = route.legs[0].steps.find((s: any) => s.distance > 20) || route.legs[0].steps[0];
                    if (nextStep) {
                        const maneuver = nextStep.maneuver;
                        const modifier = maneuver.modifier ? ` (${maneuver.modifier})` : '';
                        const name = nextStep.name ? ` على ${nextStep.name}` : '';
                        setNextInstruction(`تابع السير${modifier}${name} لمسافة ${Math.round(nextStep.distance)}م نحو ${targetDestinationName}`);
                    }
                }

                // Draw real road polyline
                const coords = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
                const map = mapInstanceRef.current;
                if (map) {
                    if (!roadPolylineRef.current) {
                        const line = L.polyline(coords, {
                            color: '#10b981',
                            weight: 6,
                            opacity: 0.9,
                            lineCap: 'round',
                            lineJoin: 'round',
                        }).addTo(map);
                        roadPolylineRef.current = line;
                    } else {
                        roadPolylineRef.current.setLatLngs(coords);
                    }
                }
            }
        } catch {
            // Fallback to straight dashed line if OSRM is unreachable
            const map = mapInstanceRef.current;
            if (map) {
                const fallbackCoords = [[fromLat, fromLng], [toLat, toLng]];
                if (!roadPolylineRef.current) {
                    const line = L.polyline(fallbackCoords, {
                        color: '#10b981',
                        weight: 5,
                        opacity: 0.8,
                        dashArray: '8, 8',
                    }).addTo(map);
                    roadPolylineRef.current = line;
                } else {
                    roadPolylineRef.current.setLatLngs(fallbackCoords);
                }
            }
        }
    }, [targetDestinationName]);

    // 1. Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [rLat, rLng],
            zoom: 15,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Restaurant Marker
        const restIcon = L.divIcon({
            className: 'uber-restaurant-marker',
            html: `
                <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 40px; height: 40px; background: #ea580c; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(234,88,12,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
                    </div>
                </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
        });

        const rMarker = L.marker([rLat, rLng], { icon: restIcon })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: inherit; text-align: right; direction: rtl; padding: 4px;">
                    <span style="font-size: 10px; font-weight: 800; color: #ea580c;">نقطة الاستلام</span>
                    <h4 style="font-weight: 900; font-size: 13px; margin: 2px 0;">${restaurantName}</h4>
                    <p style="font-size: 11px; color: #666; margin: 0;">${restaurantAddress || 'برج العرب'}</p>
                </div>
            `);
        restaurantMarkerRef.current = rMarker;

        // Customer Destination Marker
        const custIcon = L.divIcon({
            className: 'uber-customer-marker',
            html: `
                <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                    <div style="position: absolute; inset: 0; background: #10b981; opacity: 0.35; border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                    <div style="width: 40px; height: 40px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
        });

        const cMarker = L.marker([cLat, cLng], { icon: custIcon })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: inherit; text-align: right; direction: rtl; padding: 4px;">
                    <span style="font-size: 10px; font-weight: 800; color: #10b981;">نقطة التسليم للعميل</span>
                    <h4 style="font-weight: 900; font-size: 13px; margin: 2px 0;">${customerName}</h4>
                    <p style="font-size: 11px; color: #444; margin: 0;">${customerAddress}</p>
                </div>
            `);
        customerMarkerRef.current = cMarker;

        // Fit initial bounds
        map.fitBounds([[rLat, rLng], [cLat, cLng]], { padding: [50, 50], maxZoom: 15 });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [rLat, rLng, cLat, cLng, restaurantName, customerName, customerAddress]);

    // 2. Real-time Driver GPS Tracking & Speedometer
    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsError('خاصية GPS غير مدعومة.');
            return;
        }

        let watchId: number | null = null;

        const handleSuccess = (pos: GeolocationPosition) => {
            const { latitude, longitude, speed, heading } = pos.coords;
            const now = Date.now();
            setDriverCoords({ lat: latitude, lng: longitude });
            setIsGpsActive(true);
            setGpsError(null);

            // 1. Speed Calculation (km/h)
            if (speed !== null && !isNaN(speed) && speed >= 0) {
                setCurrentSpeedKmh(Math.round(speed * 3.6));
            } else if (prevPositionRef.current) {
                // Calculate speed based on distance delta over time delta
                const dtSeconds = (now - prevPositionRef.current.time) / 1000;
                if (dtSeconds > 1 && dtSeconds < 30) {
                    const distKm = calcDistanceKm(prevPositionRef.current.lat, prevPositionRef.current.lng, latitude, longitude);
                    const calcKmh = Math.round((distKm / (dtSeconds / 3600)));
                    setCurrentSpeedKmh(Math.min(120, Math.max(0, calcKmh)));
                }
            }

            // 2. Heading Calculation
            if (heading !== null && !isNaN(heading)) {
                setCurrentHeading(Math.round(heading));
            } else if (prevPositionRef.current) {
                const bearing = calculateBearing(prevPositionRef.current.lat, prevPositionRef.current.lng, latitude, longitude);
                setCurrentHeading(Math.round(bearing));
            }

            prevPositionRef.current = { lat: latitude, lng: longitude, time: now };

            // 3. Update or Create Driver Pin with Heading Arrow
            const map = mapInstanceRef.current;
            if (map) {
                const rot = currentHeading || 0;
                const driverIcon = L.divIcon({
                    className: 'uber-driver-active-pin',
                    html: `
                        <div style="position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;">
                            <div style="position: absolute; inset: 0; background: #0284c7; opacity: 0.35; border-radius: 50%; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                            <div style="position: relative; width: 44px; height: 44px; background: #0f172a; border: 3.5px solid #38bdf8; border-radius: 50%; box-shadow: 0 6px 20px rgba(2,132,199,0.7); display: flex; align-items: center; justify-content: center; color: #38bdf8; transform: rotate(${rot}deg); transition: transform 0.4s ease;">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 7 19-7-4-7 4 7-19z"/></svg>
                            </div>
                        </div>
                    `,
                    iconSize: [52, 52],
                    iconAnchor: [26, 26],
                });

                if (!driverMarkerRef.current) {
                    const marker = L.marker([latitude, longitude], { icon: driverIcon, zIndexOffset: 1000 })
                        .addTo(map)
                        .bindPopup(`<strong style="direction:rtl;text-align:right;color:#0284c7;">🛵 موقعك المباشر في الطريق</strong>`);
                    driverMarkerRef.current = marker;
                } else {
                    driverMarkerRef.current.setLatLng([latitude, longitude]);
                    driverMarkerRef.current.setIcon(driverIcon);
                }

                // 4. In Navigation Mode, keep camera centered directly over the driver at close range (Zoom 17)
                if (isNavMode) {
                    map.setView([latitude, longitude], 17, { animate: true, duration: 0.5 });
                }

                // 5. Fetch Road Routing to Next Stop
                fetchRoadRoute(latitude, longitude, targetDestinationCoords[0], targetDestinationCoords[1]);
            }

            // 6. Sync Driver Live Coordinates to Backend every 5 seconds
            if (orderId && (now - lastSyncTimeRef.current > 5000)) {
                lastSyncTimeRef.current = now;
                axios.post(`/delivery/orders/${orderId}/location`, {
                    latitude,
                    longitude,
                    speed: currentSpeedKmh,
                    heading: currentHeading,
                }).catch(() => {});
            }
        };

        const handleError = (err: GeolocationPositionError) => {
            setIsGpsActive(false);
            setGpsError(err.code === 1 ? 'يرجى تفعيل صلاحية الموقع.' : 'جاري البحث عن إشارة GPS...');
        };

        watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 2000,
        });

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [isNavMode, targetDestinationCoords, currentHeading, currentSpeedKmh, orderId, fetchRoadRoute]);

    // Computed ETA
    const displayDistanceKm = roadDistanceMeters 
        ? (roadDistanceMeters / 1000).toFixed(1) 
        : (driverCoords ? calcDistanceKm(driverCoords.lat, driverCoords.lng, targetDestinationCoords[0], targetDestinationCoords[1]) : calcDistanceKm(rLat, rLng, cLat, cLng));

    const displayMinutes = roadDurationSecs 
        ? Math.max(1, Math.round(roadDurationSecs / 60)) 
        : Math.max(2, Math.round(Number(displayDistanceKm) * 3.2));

    const handleFitAll = () => {
        setIsNavMode(false);
        const map = mapInstanceRef.current;
        if (!map) return;
        const pts: [number, number][] = [[rLat, rLng], [cLat, cLng]];
        if (driverCoords) pts.push([driverCoords.lat, driverCoords.lng]);
        map.fitBounds(pts, { padding: [40, 40], maxZoom: 16 });
    };

    const handleToggleNavMode = () => {
        setIsNavMode(prev => !prev);
        if (!isNavMode && driverCoords && mapInstanceRef.current) {
            mapInstanceRef.current.setView([driverCoords.lat, driverCoords.lng], 17, { animate: true });
        }
    };

    return (
        <div className="space-y-3">
            {/* Turn-by-Turn Navigation Header Banner (Uber/Google Maps Style) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 text-white shadow-2xl border border-sky-500/30 space-y-4">
                
                {/* Next Maneuver Card */}
                <div className="flex items-center gap-3.5 bg-sky-950/60 p-3.5 rounded-2xl border border-sky-500/30">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-sky-500/30 shrink-0">
                        <ArrowUp className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide block">
                            {isOutForDelivery ? 'التوجه إلى العميل 🎯' : 'التوجه إلى المطعم للاستلام 🏪'}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                            {nextInstruction}
                        </h3>
                    </div>
                </div>

                {/* Real-time Speedometer & Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    {/* Speedometer Gauge */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 mb-0.5">
                            <Gauge className="w-3.5 h-3.5" />
                            <span>السرعة</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-white font-mono">
                            {currentSpeedKmh}
                        </span>
                        <span className="text-[10px] text-stone-400">كم/س</span>
                    </div>

                    {/* Remaining Road Distance */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-orange-400 mb-0.5">
                            <Route className="w-3.5 h-3.5" />
                            <span>المسافة</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-white font-mono">
                            {displayDistanceKm}
                        </span>
                        <span className="text-[10px] text-stone-400">كم</span>
                    </div>

                    {/* Estimated Arrival Time */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mb-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>الوصول</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                            ~{displayMinutes}
                        </span>
                        <span className="text-[10px] text-stone-400">دقيقة</span>
                    </div>
                </div>

                {/* Live GPS & Mode Status */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-stone-300">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isGpsActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{isGpsActive ? 'إشارة GPS دقيقة ومباشرة 🟢' : gpsError || 'جاري التقاط إشارة GPS...'}</span>
                    </div>
                    <span className="text-sky-300 font-bold">
                        {isNavMode ? '🧭 وضع الملاحة المقرب مفعّل' : '🗺️ وضع العرض الشامل'}
                    </span>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-sky-500/30 shadow-xl">
                <div
                    ref={mapContainerRef}
                    className="w-full h-80 sm:h-96 z-0"
                    style={{ minHeight: '340px' }}
                />

                {/* Floating Navigation Controls */}
                <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                    {/* Navigation Close-up Toggle */}
                    <button
                        type="button"
                        onClick={handleToggleNavMode}
                        className={`p-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all cursor-pointer ${
                            isNavMode 
                                ? 'bg-sky-600 text-white ring-2 ring-sky-400/60 shadow-sky-600/50' 
                                : 'bg-stone-900/90 text-white hover:bg-stone-900'
                        }`}
                        title="وضع الملاحة والقيادة المقربة"
                    >
                        <Navigation className="w-4 h-4" />
                        <span className="hidden sm:inline">وضع القيادة</span>
                    </button>

                    {/* Fit All Button */}
                    <button
                        type="button"
                        onClick={handleFitAll}
                        className="p-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-900 text-white shadow-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="عرض المسار بالكامل"
                    >
                        <Maximize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">كامل المسار</span>
                    </button>
                </div>

                {/* Destination Quick Focus Buttons */}
                <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setIsNavMode(false);
                            mapInstanceRef.current?.setView([rLat, rLng], 17, { animate: true });
                        }}
                        className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <Store className="w-3.5 h-3.5" />
                        <span>المطعم</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsNavMode(false);
                            mapInstanceRef.current?.setView([cLat, cLng], 17, { animate: true });
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>العميل</span>
                    </button>
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 z-[400] bg-stone-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md border border-white/10 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sky-400">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" /> أنت
                    </span>
                    <span className="flex items-center gap-1 text-orange-400">
                        <span className="w-2 h-2 rounded-full bg-orange-400" /> المطعم
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> العميل
                    </span>
                </div>
            </div>
        </div>
    );
}
