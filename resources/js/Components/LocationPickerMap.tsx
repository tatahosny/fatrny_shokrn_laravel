import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Loader2, Sparkles, Check, Info } from 'lucide-react';

interface LocationPickerProps {
    initialLat?: number | null;
    initialLng?: number | null;
    initialAddress?: string;
    onLocationSelect: (location: { lat: number; lng: number; address: string; distanceKm?: number }) => void;
    restaurantLat?: number;
    restaurantLng?: number;
    restaurantName?: string;
    autoLocateOnMount?: boolean;
}

// Landmarks in New Borg El Arab City
const BORG_EL_ARAB_LANDMARKS = [
    { name: 'جامعة برج العرب التكنولوجية (BATU)', lat: 30.8756, lng: 29.5842 },
    { name: 'الجامعة المصرية اليابانية (E-JUST)', lat: 30.8648, lng: 29.5741 },
    { name: 'جامعة الإسكندرية الأهلية', lat: 30.8805, lng: 29.5762 },
    { name: 'جامعة سنجور الدولية', lat: 30.8805, lng: 29.5912 },
    { name: 'سكن الطلاب والحي الأول', lat: 30.8710, lng: 29.5890 },
    { name: 'صينية الهوارية وموقف السيارات', lat: 30.8920, lng: 29.6010 },
    { name: 'نادي سموحة - برج العرب', lat: 30.8580, lng: 29.5930 },
];

export default function LocationPickerMap({
    initialLat,
    initialLng,
    initialAddress = '',
    onLocationSelect,
    restaurantLat,
    restaurantLng,
    restaurantName = 'المطعم',
    autoLocateOnMount = true,
}: LocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const customerMarkerRef = useRef<L.Marker | null>(null);
    const initialLocationAttemptedRef = useRef(false);

    // Initial coordinates: if provided, use them; otherwise fallback to central New Borg El Arab
    const defaultLat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : 30.8752;
    const defaultLng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : 29.5841;

    const [coords, setCoords] = useState<{ lat: number; lng: number }>({
        lat: defaultLat,
        lng: defaultLng
    });
    const [addressText, setAddressText] = useState(initialAddress || '');
    const [isLocating, setIsLocating] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [hasDetectedGps, setHasDetectedGps] = useState(false);

    // Haversine distance calculator
    const calcDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    }, []);

    const emitChange = useCallback((lat: number, lng: number, addr: string) => {
        const dist = (restaurantLat && restaurantLng)
            ? calcDistance(restaurantLat, restaurantLng, lat, lng)
            : undefined;
        onLocationSelect({
            lat,
            lng,
            address: addr,
            distanceKm: dist
        });
    }, [restaurantLat, restaurantLng, calcDistance, onLocationSelect]);

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        setIsReverseGeocoding(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
                { headers: { 'User-Agent': 'Fatrny-Shokrn-App' } }
            );
            if (res.ok) {
                const data = await res.json();
                const cleanName = data.display_name
                    ? data.display_name.split(',').slice(0, 3).join('، ')
                    : `برج العرب (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
                setAddressText(cleanName);
                emitChange(lat, lng, cleanName);
            } else {
                fallbackAddress(lat, lng);
            }
        } catch {
            fallbackAddress(lat, lng);
        } finally {
            setIsReverseGeocoding(false);
        }
    }, [emitChange]);

    const fallbackAddress = useCallback((lat: number, lng: number) => {
        const fallback = `موقع محدد في برج العرب (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setAddressText(fallback);
        emitChange(lat, lng, fallback);
    }, [emitChange]);

    // Center map & Move pin
    const updateLocation = useCallback((lat: number, lng: number, name?: string, openPopup = true) => {
        setCoords({ lat, lng });
        if (customerMarkerRef.current) {
            customerMarkerRef.current.setLatLng([lat, lng]);
            if (openPopup) {
                customerMarkerRef.current.openPopup();
            }
        }
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
        }
        if (name) {
            setAddressText(name);
            emitChange(lat, lng, name);
        } else {
            reverseGeocode(lat, lng);
        }
    }, [emitChange, reverseGeocode]);

    // GPS Auto-detect handler
    const handleGPS = useCallback(() => {
        if (!navigator.geolocation) {
            alert('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setHasDetectedGps(true);
                setIsLocating(false);
                updateLocation(latitude, longitude, undefined, true);
            },
            (err) => {
                setIsLocating(false);
                if (err.code === 1) {
                    alert('يرجى السماح بصلاحية الموقع في المتصفح لتحديد مكانك تلقائياً بالدبوس.');
                } else {
                    alert('تعذر قراءة إشارة الـ GPS. يمكنك سحب الدبوس أو النقر على الخريطة يدوياً.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [updateLocation]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        // Custom High-Visibility Draggable Pin (Uber/Talabat Style)
        const customerPinIcon = L.divIcon({
            className: 'uber-interactive-customer-pin',
            html: `
                <div style="position: relative; width: 46px; height: 56px; display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #ea580c, #f97316); border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 6px 18px rgba(234,88,12,0.5); display: flex; align-items: center; justify-content: center; color: white;">
                        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
                        </div>
                    </div>
                    <div style="width: 12px; height: 6px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 4px; filter: blur(1px);"></div>
                </div>
            `,
            iconSize: [46, 56],
            iconAnchor: [23, 52],
            popupAnchor: [0, -50]
        });

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
            center: [defaultLat, defaultLng],
            zoom: 15,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Restaurant Marker if coords available
        if (restaurantLat && restaurantLng) {
            const restaurantIcon = L.divIcon({
                className: 'custom-restaurant-pin',
                html: `
                    <div style="width: 38px; height: 38px; background: #1c1917; border: 3px solid #f97316; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #f97316;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
                    </div>
                `,
                iconSize: [38, 38],
                iconAnchor: [19, 19],
            });

            L.marker([restaurantLat, restaurantLng], { icon: restaurantIcon })
                .addTo(map)
                .bindPopup(`<strong style="font-family: inherit; font-size: 12px; color: #ea580c;">🏪 موقع المطعم (${restaurantName})</strong>`);
        }

        // Customer Draggable Pin
        const customerMarker = L.marker([defaultLat, defaultLng], {
            icon: customerPinIcon,
            draggable: true,
        }).addTo(map);

        customerMarker.bindPopup(`
            <div style="font-family: inherit; text-align: right; direction: rtl; padding: 2px;">
                <p style="font-weight: 900; font-size: 13px; color: #ea580c; margin: 0 0 4px 0;">📍 نقطة استلام طلبك</p>
                <p style="font-size: 11px; color: #555; margin: 0;">اسحب الدبوس أو اضغط على الخريطة لتصحيح موقعك بدقة.</p>
            </div>
        `).openPopup();

        // On dragend -> update coordinates & reverse geocode
        customerMarker.on('dragend', () => {
            const pos = customerMarker.getLatLng();
            setCoords({ lat: pos.lat, lng: pos.lng });
            reverseGeocode(pos.lat, pos.lng);
            customerMarker.openPopup();
        });

        // On map click -> jump pin to that point
        map.on('click', (e) => {
            customerMarker.setLatLng(e.latlng);
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
            reverseGeocode(e.latlng.lat, e.latlng.lng);
            customerMarker.openPopup();
        });

        mapInstanceRef.current = map;
        customerMarkerRef.current = customerMarker;

        // Auto-locate on initial mount if requested
        if (autoLocateOnMount && !initialLocationAttemptedRef.current && !initialLat) {
            initialLocationAttemptedRef.current = true;
            handleGPS();
        }

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    const currentDistance = (restaurantLat && restaurantLng && coords)
        ? calcDistance(restaurantLat, restaurantLng, coords.lat, coords.lng)
        : null;

    return (
        <div className="space-y-3">
            {/* Guide Info Banner */}
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-700 dark:text-orange-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                <div className="leading-relaxed">
                    <span className="font-black">مكان التسليم محدد بدبوس:</span> يمكنك <strong>سحب الدبوس 📍</strong> أو <strong>الضغط مباشرة على الخريطة</strong> لتصحيح أو تغيير مكان استلام وجبتك بدقة.
                </div>
            </div>

            {/* Map Canvas */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-orange-400/40 dark:border-orange-500/30 shadow-md">
                <div
                    ref={mapContainerRef}
                    className="w-full h-80 sm:h-96 z-0"
                    style={{ minHeight: '320px' }}
                />

                {/* GPS Pin Me Floating Button */}
                <button
                    type="button"
                    onClick={handleGPS}
                    disabled={isLocating}
                    className="absolute bottom-4 right-4 z-[400] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                    {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Crosshair className="w-4 h-4" />
                    )}
                    <span>{isLocating ? 'جاري التقاط GPS...' : '📍 التقاط موقعي الحالي GPS'}</span>
                </button>

                {/* Distance Badge floating on top-left */}
                {currentDistance !== null && (
                    <div className="absolute top-4 left-4 z-[400] bg-stone-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl text-xs font-black shadow-lg border border-white/10 flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-orange-400" />
                        <span>المسافة للمطعم: {currentDistance} كم</span>
                    </div>
                )}

                {/* Status Indicator */}
                {hasDetectedGps && (
                    <div className="absolute top-4 right-4 z-[400] bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-black shadow-md flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم التقاط الموقع بنجاح</span>
                    </div>
                )}
            </div>

            {/* Selected Location Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shrink-0 shadow-md">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                            عنوان الاستلام المحدد بالدبوس:
                        </p>
                        <p className="text-xs sm:text-sm font-black text-stone-900 dark:text-white truncate mt-0.5">
                            {isReverseGeocoding ? 'جاري قراءة تفاصيل العنوان...' : addressText || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
                        </p>
                        <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                            GPS: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                        </p>
                    </div>
                </div>

                <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-xl shrink-0 hidden sm:inline">
                    اسحب الدبوس للتعديل 📍
                </span>
            </div>

            {/* Quick Landmark Buttons for Borg El Arab */}
            <div className="space-y-2">
                <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                    أو انقر للانتقال سريعاً إلى معالم وجامعات برج العرب:
                </p>
                <div className="flex flex-wrap gap-2">
                    {BORG_EL_ARAB_LANDMARKS.map((lm, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => updateLocation(lm.lat, lm.lng, lm.name, true)}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-100 dark:hover:bg-orange-950/60 hover:text-orange-600 dark:hover:text-orange-300 text-xs font-bold text-stone-700 dark:text-stone-300 transition-all border border-stone-200 dark:border-stone-700 cursor-pointer"
                        >
                            {lm.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
