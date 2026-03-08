import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Locate, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Leaflet CDN URLs ──────────────────────────────────────────
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// ─── Guwahati default center ───────────────────────────────────
const DEFAULT_LAT = 26.1445;
const DEFAULT_LNG = 91.7362;
const DEFAULT_ZOOM = 13;

// ─── Nominatim reverse geocode ────────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "FreshFoldApp/1.0" },
    });
    if (!res.ok) throw new Error("Geocode request failed");
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// ─── Leaflet loader (injects CDN once) ────────────────────────
let leafletLoadPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    // JS
    if ((window as Window & typeof globalThis & { L?: unknown }).L) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return leafletLoadPromise;
}

// ─── Types ────────────────────────────────────────────────────
interface MapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (address: string) => void;
}

// ─── Component ────────────────────────────────────────────────
export function MapPickerDialog({
  open,
  onOpenChange,
  onConfirm,
}: MapPickerDialogProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // ── Load Leaflet when dialog opens ──────────────────────────
  useEffect(() => {
    if (!open) return;
    loadLeaflet()
      .then(() => setLeafletReady(true))
      .catch(() => setLoadError(true));
  }, [open]);

  // ── Place/move marker + geocode ──────────────────────────────
  const placeMarker = useCallback(
    async (lat: number, lng: number, map: unknown) => {
      // biome-ignore lint/suspicious/noExplicitAny: Leaflet loaded from CDN
      const L = (window as any).L;
      if (!L) return;

      setCoords({ lat, lng });

      if (markerRef.current) {
        // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker
        (markerRef.current as any).setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          html: `<div style="
            width:32px;height:44px;position:relative;
          ">
            <svg viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
              <path d="M16 0C7.16 0 0 7.16 0 16c0 5.85 3.3 10.95 8.15 13.65L16 44l7.85-14.35C28.7 26.95 32 21.85 32 16 32 7.16 24.84 0 16 0z" fill="oklch(0.21 0.055 255)"/>
              <circle cx="16" cy="16" r="6" fill="oklch(0.65 0.19 160)"/>
            </svg>
          </div>`,
          className: "",
          iconSize: [32, 44],
          iconAnchor: [16, 44],
        });
        markerRef.current = L.marker([lat, lng], {
          icon,
          draggable: true,
        }).addTo(map);

        // biome-ignore lint/suspicious/noExplicitAny: Leaflet event
        (markerRef.current as any).on("dragend", async (e: any) => {
          const pos = e.target.getLatLng();
          setIsGeocoding(true);
          setCoords({ lat: pos.lat, lng: pos.lng });
          const addr = await reverseGeocode(pos.lat, pos.lng);
          setSelectedAddress(addr);
          setIsGeocoding(false);
        });
      }

      setIsGeocoding(true);
      const addr = await reverseGeocode(lat, lng);
      setSelectedAddress(addr);
      setIsGeocoding(false);
    },
    [],
  );

  // ── Initialize map once Leaflet is ready & container is rendered ─
  useEffect(() => {
    if (!open || !leafletReady || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // biome-ignore lint/suspicious/noExplicitAny: Leaflet loaded from CDN
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // biome-ignore lint/suspicious/noExplicitAny: Leaflet event
    map.on("click", async (e: any) => {
      await placeMarker(e.latlng.lat, e.latlng.lng, map);
    });

    mapInstanceRef.current = map;

    // Small delay to allow container to fully render before invalidating size
    setTimeout(() => {
      // biome-ignore lint/suspicious/noExplicitAny: Leaflet map
      (map as any).invalidateSize();
    }, 100);
  }, [open, leafletReady, placeMarker]);

  // ── Cleanup map when dialog closes ──────────────────────────
  useEffect(() => {
    if (!open && mapInstanceRef.current) {
      // biome-ignore lint/suspicious/noExplicitAny: Leaflet map
      (mapInstanceRef.current as any).remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      setSelectedAddress("");
      setCoords(null);
      setIsGeocoding(false);
    }
  }, [open]);

  // ── Use my location ─────────────────────────────────────────
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // biome-ignore lint/suspicious/noExplicitAny: Leaflet map
        const map = mapInstanceRef.current as any;
        if (map) {
          map.flyTo([lat, lng], 16, { duration: 1.2 });
          await placeMarker(lat, lng, map);
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert(
          "Unable to get your location. Please allow location access and try again.",
        );
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }, [placeMarker]);

  // ── Confirm selection ────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (selectedAddress) {
      onConfirm(selectedAddress);
      onOpenChange(false);
    }
  }, [selectedAddress, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="booking.map_modal"
        className="sm:max-w-2xl w-full p-0 rounded-2xl overflow-hidden gap-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="font-display text-xl font-bold text-navy flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald" />
            Pick Pickup Location on Map
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tap anywhere on the map to drop a pin. Drag the pin to adjust.
          </p>
        </DialogHeader>

        {/* Map Container */}
        <div className="relative w-full" style={{ height: "400px" }}>
          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/30 gap-3 text-center px-6">
              <MapPin className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Map could not be loaded. Please check your connection.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoadError(false);
                  leafletLoadPromise = null;
                  loadLeaflet()
                    .then(() => setLeafletReady(true))
                    .catch(() => setLoadError(true));
                }}
              >
                Retry
              </Button>
            </div>
          ) : !leafletReady ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/30 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald" />
              <p className="text-sm text-muted-foreground">Loading map…</p>
            </div>
          ) : null}

          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ zIndex: 0 }}
          />

          {/* Use My Location button (overlaid on map) */}
          {leafletReady && !loadError && (
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 bg-white text-navy text-xs font-semibold px-3 py-2 rounded-xl shadow-card border border-border hover:bg-accent transition-colors disabled:opacity-60"
              aria-label="Use my current location"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Locate className="w-3.5 h-3.5 text-emerald" />
              )}
              {isLocating ? "Locating…" : "Use my location"}
            </button>
          )}
        </div>

        {/* Address Preview + Actions */}
        <div className="px-6 py-4 border-t border-border bg-background/80 space-y-4">
          {/* Selected address */}
          <div className="min-h-[48px] bg-accent/30 rounded-xl px-4 py-3 flex items-start gap-2.5">
            {isGeocoding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Getting address…
                </span>
              </>
            ) : selectedAddress ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">
                  {selectedAddress}
                </span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Tap the map to select your location
                </span>
              </>
            )}
          </div>

          {coords && !isGeocoding && (
            <p className="text-xs text-muted-foreground/70 text-right -mt-2">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="booking.map_modal.cancel_button"
              className="flex-1 rounded-xl border-border text-navy font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedAddress || isGeocoding}
              data-ocid="booking.map_modal.confirm_button"
              className="flex-1 rounded-xl bg-navy hover:bg-navy-light text-white font-semibold disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
