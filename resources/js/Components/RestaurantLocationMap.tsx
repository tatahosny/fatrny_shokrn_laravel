import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2, Store, Check } from "lucide-react";

interface RestaurantLocationMapProps {
    initialLat?: number | string | null;
    initialLng?: number | string | null;
    onLocationChange: (lat: number, lng: number, address: string) => void;
    restaurantName?: string;
}

const DEFAULT_LAT = 30.8752;
const DEFAULT_LNG = 29.5841;

const BORG_LANDMARKS = [
    { name: "جامعة BATU", lat: 30.8752, lng: 29.5841 },
    { name: "E-JUST", lat: 30.8631, lng: 29.5878 },
    { name: "جامعة الإسكندرية الأهلية", lat: 30.8805, lng: 29.5762 },
    { name: "محطة المحطة", lat: 30.8712, lng: 29.5925 },
    { name: "المنطقة الصناعية", lat: 30.8900, lng: 29.6100 },
];

export default function RestaurantLocationMap({
    initialLat,
    initialLng,
    onLocationChange,
    restaurantName = "مطعمك",
}: RestaurantLocationMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const parsedLat = initialLat ? Number(initialLat) : null;
    const parsedLng = initialLng ? Number(initialLng) : null;
    const startLat = parsedLat && !isNaN(parsedLat) ? parsedLat : DEFAULT_LAT;
    const startLng = parsedLng && !isNaN(parsedLng) ? parsedLng : DEFAULT_LNG;

    const [coords, setCoords] = useState({ lat: startLat, lng: startLng });
    const [addressText, setAddressText] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [confirmed, setConfirmed] = useState(!!(parsedLat && parsedLng));

    const reverseGeocode = async (lat: number, lng: number) => {
        setIsGeocoding(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
                { headers: { "User-Agent": "Fatrny-Shokrn-Restaurant" } }
            );
            if (res.ok) {
                const data = await res.json();
                const addr = data.display_name
                    ? data.display_name.split(",").slice(0, 3).join("، ")
                    : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setAddressText(addr);
                onLocationChange(lat, lng, addr);
            } else {
                fallback(lat, lng);
            }
        } catch {
            fallback(lat, lng);
        } finally {
            setIsGeocoding(false);
        }
    };

    const fallback = (lat: number, lng: number) => {
        const addr = `برج العرب (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setAddressText(addr);
        onLocationChange(lat, lng, addr);
    };

    const moveTo = (lat: number, lng: number, addr?: string) => {
        setCoords({ lat, lng });
        setConfirmed(true);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (mapInstanceRef.current) mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
        if (addr) {
            setAddressText(addr);
            onLocationChange(lat, lng, addr);
        } else {
            reverseGeocode(lat, lng);
        }
    };

    const handleGPS = () => {
        if (!navigator.geolocation) { alert("تحديد الموقع غير مدعوم في متصفحك."); return; }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setIsLocating(false); moveTo(pos.coords.latitude, pos.coords.longitude); },
            () => { setIsLocating(false); alert("تعذر تحديد موقعك — تأكد من منح صلاحية الموقع."); },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const restaurantIcon = L.divIcon({
            className: "",
            html: `<div style="position:relative;width:48px;height:56px;">
                <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:10px;background:#ea580c;border-radius:50%;"></div>
                <div style="position:absolute;top:0;left:0;width:48px;height:48px;background:linear-gradient(135deg,#ea580c,#f97316);border:3px solid white;border-radius:14px;box-shadow:0 6px 20px rgba(234,88,12,0.45);display:flex;align-items:center;justify-content:center;color:white;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                        <path d="M2 7h20"/>
                    </svg>
                </div>
            </div>`,
            iconSize: [48, 56],
            iconAnchor: [24, 54],
            popupAnchor: [0, -54],
        });

        const map = L.map(mapContainerRef.current, { center: [startLat, startLng], zoom: 15, zoomControl: false });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        const marker = L.marker([startLat, startLng], { icon: restaurantIcon, draggable: true }).addTo(map);
        marker.bindPopup(`<strong style="font-family:inherit;font-size:12px;">📍 موقع ${restaurantName}<br><span style="font-size:10px;color:#888;">اسحب لضبط الموقع بدقة</span></strong>`).openPopup();

        marker.on("dragend", () => {
            const { lat, lng } = marker.getLatLng();
            setCoords({ lat, lng });
            setConfirmed(true);
            reverseGeocode(lat, lng);
        });

        map.on("click", (e) => {
            marker.setLatLng(e.latlng);
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
            setConfirmed(true);
            reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        if (parsedLat && parsedLng && !isNaN(parsedLat) && !isNaN(parsedLng)) {
            reverseGeocode(parsedLat, parsedLng);
        }

        return () => { map.remove(); mapInstanceRef.current = null; };
    }, []);

    return (
        <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-500/30 shadow-lg">
                <div ref={mapContainerRef} className="w-full z-0" style={{ height: "320px" }} />

                <button
                    type="button"
                    onClick={handleGPS}
                    disabled={isLocating}
                    className="absolute bottom-4 right-4 z-[400] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xl transition disabled:opacity-50 cursor-pointer active:scale-95"
                >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                    <span>{isLocating ? "جاري التحديد..." : "موقعي الحالي GPS"}</span>
                </button>

                {confirmed && (
                    <div className="absolute top-4 left-4 z-[400] flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>موقع المطعم محدد ✓</span>
                    </div>
                )}
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-orange-700 dark:text-orange-400">موقع المطعم على الخريطة:</p>
                    <p className="text-xs font-black text-stone-900 dark:text-white truncate">
                        {isGeocoding ? "جاري قراءة العنوان..." : addressText || "اضغط على الخريطة أو اسحب الدبوس لتحديد موقعك"}
                    </p>
                    <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-[11px] font-bold text-stone-500 mb-1.5">اختر أقرب معلم معروف في برج العرب كنقطة بداية:</p>
                <div className="flex flex-wrap gap-1.5">
                    {BORG_LANDMARKS.map((lm, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => moveTo(lm.lat, lm.lng, lm.name)}
                            className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:text-orange-600 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition border border-stone-200 dark:border-stone-700 cursor-pointer"
                        >
                            {lm.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
