import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../utils/constants";
import {
  User, Truck, Route as RouteIcon, MapPin, Gauge,
  Clock, Calendar, LocateFixed, Navigation,
} from "lucide-react";
import api from "../../services/api";

// ─── Map config ────────────────────────────────────────────────────────────────
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER      = { lat: 6.9271, lng: 79.8612 };
const LIGHT_STYLES        = []; // standard Google Maps look

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n, d = 5) { return typeof n === "number" ? n.toFixed(d) : "—"; }

function haversineKm(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function etaLabel(distKm, speedKmh) {
  const speed  = speedKmh > 2 ? speedKmh : 30; // assume 30 km/h if stationary
  const mins   = Math.round((distKm / speed) * 60);
  if (mins <= 1) return "Less than a minute";
  return `Approximately ${mins} minute${mins !== 1 ? "s" : ""}`;
}

function timeAgoLabel(ts) {
  if (!ts) return "Waiting...";
  const sec = Math.round((Date.now() - new Date(ts).getTime()) / 1000);
  if (sec < 5)  return "Just now";
  if (sec < 60) return `${sec} seconds ago`;
  const min = Math.floor(sec / 60);
  return `${min} minute${min !== 1 ? "s" : ""} ago`;
}

// Custom SVG marker: green truck circle
const TRUCK_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">
  <circle cx="28" cy="28" r="26" fill="#16a34a" stroke="white" stroke-width="3"/>
  <g transform="translate(14,15)" fill="white">
    <path d="M2 4h18v10H2z" rx="1"/>
    <path d="M20 7h4l3 3v4h-7V7z"/>
    <circle cx="6"  cy="16" r="2" fill="white"/>
    <circle cx="18" cy="16" r="2" fill="white"/>
    <circle cx="24" cy="16" r="2" fill="white"/>
  </g>
</svg>`);

// Custom SVG marker: blue user pin
const USER_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <circle cx="20" cy="20" r="10" fill="#2563eb" stroke="white" stroke-width="3"/>
  <circle cx="20" cy="20" r="4"  fill="white"/>
</svg>`);

// ─── Component ─────────────────────────────────────────────────────────────────
/**
 * LiveTrackingMap — premium UI showing truck + user locations.
 *
 * Props:
 *   routeId, driverId, driverName, truckPlate, collectionStatus,
 *   postalCode, routeName, collectionTime, onClose
 */
export default function LiveTrackingMap({
  routeId,
  driverId,
  driverName,
  truckPlate,
  collectionStatus,
  postalCode,
  routeName,
  collectionTime,
  onClose,
}) {
  const [truckPos,     setTruckPos]     = useState(null);
  const [userPos,      setUserPos]      = useState(null);
  const [trackStatus,  setTrackStatus]  = useState("waiting"); // "waiting"|"tracking"|"completed"
  const [mapType,      setMapType]      = useState("roadmap");
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [timeAgo,      setTimeAgo]      = useState("Waiting...");
  const [speed,        setSpeed]        = useState(0);
  const [liveRouteName, setLiveRouteName] = useState(routeName || "");
  const [livePlate,    setLivePlate]    = useState(truckPlate || "");

  const socketRef = useRef(null);
  const pollRef   = useRef(null);
  const mapRef    = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // ── Marker icons (created after Google Maps loads) ──
  const truckIcon = isLoaded ? {
    url: `data:image/svg+xml;charset=UTF-8,${TRUCK_SVG}`,
    scaledSize: new window.google.maps.Size(56, 56),
    anchor:     new window.google.maps.Point(28, 28),
  } : null;

  const userIcon = isLoaded ? {
    url: `data:image/svg+xml;charset=UTF-8,${USER_SVG}`,
    scaledSize: new window.google.maps.Size(40, 40),
    anchor:     new window.google.maps.Point(20, 20),
  } : null;

  // ── Apply location update ──
  const applyLocation = useCallback((data) => {
    const lat = data.lat ?? data.latitude;
    const lng = data.lng ?? data.longitude;
    if (!lat || !lng) return;
    const now = data.updatedAt || new Date().toISOString();
    setTruckPos({ lat, lng });
    setSpeed(data.speed ?? 0);
    setLastUpdated(now);
    setTrackStatus("tracking");
  }, []);

  // ── REST poll ──
  const pollLocation = useCallback(async () => {
    try {
      const params = postalCode ? `?postalCode=${encodeURIComponent(postalCode)}` : "";
      const { data } = await api.get(`/user/truck-location${params}`);

      if (data.route?.name)         setLiveRouteName(data.route.name);
      if (data.truck?.plateNumber)  setLivePlate(data.truck.plateNumber);

      if (data.success && data.tracking && data.location) {
        applyLocation({
          lat:       data.location.latitude,
          lng:       data.location.longitude,
          speed:     data.location.speed ?? 0,
          updatedAt: data.location.updatedAt,
        });
      } else if (data.route?.collectionStatus === "Completed") {
        setTrackStatus("completed");
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn("[LiveTrackingMap] 404 — stopping poll. Check postal code.");
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    }
  }, [applyLocation, postalCode]);

  // ── Socket + polling setup ──
  useEffect(() => {
    if (!driverId) return;

    const socketHost = API_BASE_URL.replace("/api", "");
    const socket = io(socketHost);
    socketRef.current = socket;

    const joinRooms = () => {
      if (routeId)    socket.emit("join", `route-${routeId}`);
      if (postalCode) socket.emit("join", `route:${postalCode}`);
    };

    socket.on("connect", joinRooms);
    if (socket.connected) joinRooms();

    socket.on("truck_location_updated", applyLocation);
    socket.on("driver_location_update", applyLocation);

    pollLocation();
    pollRef.current = setInterval(pollLocation, 5000);

    return () => {
      socket.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId, routeId, postalCode]);

  // ── User geolocation ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // ── "Updated X ago" ticker ──
  useEffect(() => {
    const t = setInterval(() => setTimeAgo(timeAgoLabel(lastUpdated)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // ── Stop polling on completed ──
  useEffect(() => {
    if (collectionStatus === "Completed") {
      setTrackStatus("completed");
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
  }, [collectionStatus]);

  // ── Map pan helpers ──
  const panToUser  = () => { if (userPos  && mapRef.current) { mapRef.current.panTo(userPos);  mapRef.current.setZoom(16); } };
  const panToTruck = () => { if (truckPos && mapRef.current) { mapRef.current.panTo(truckPos); mapRef.current.setZoom(16); } };

  // ── Derived values ──
  const displayRouteName = liveRouteName || routeName || postalCode || "—";
  const displayPlate     = livePlate     || truckPlate || "—";
  const distKm           = (truckPos && userPos)
    ? haversineKm(truckPos.lat, truckPos.lng, userPos.lat, userPos.lng)
    : null;
  const eta = distKm !== null ? etaLabel(distKm, speed) : null;

  const mapCenter = truckPos || userPos || DEFAULT_CENTER;

  // ── Status indicator ──
  const statusColor =
    trackStatus === "tracking"  ? "text-emerald-500" :
    trackStatus === "completed" ? "text-blue-400"    : "text-amber-400";
  const statusLabel =
    trackStatus === "tracking"  ? "Tracking"  :
    trackStatus === "completed" ? "Completed" : "Waiting";

  return (
    <div className="flex flex-col" style={{ height: "78vh", minHeight: 520 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold">Live Tracking: {displayRouteName}</h2>
          {trackStatus === "tracking" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )}
          {trackStatus !== "waiting" && (
            <span className="text-xs text-muted-foreground">Updated {timeAgo}</span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Body: Map + Details ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">

          {/* Map / Satellite toggle */}
          <div className="absolute top-3 left-3 z-10 flex overflow-hidden rounded-lg border bg-card shadow-sm text-xs font-medium">
            <button
              onClick={() => setMapType("roadmap")}
              className={`px-3 py-1.5 transition-colors ${mapType === "roadmap" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Map
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1.5 transition-colors ${mapType === "satellite" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Satellite
            </button>
          </div>

          {/* Waiting overlay */}
          {trackStatus !== "tracking" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/70 backdrop-blur-[2px]">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary mb-4">
                <Navigation className={`h-6 w-6 text-primary ${trackStatus === "waiting" ? "animate-bounce" : ""}`} />
              </div>
              {trackStatus === "completed" ? (
                <>
                  <p className="font-semibold text-emerald-500">Collection Completed</p>
                  <p className="text-xs text-muted-foreground mt-1">Today's collection is done.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Waiting for Truck Location</p>
                  <p className="text-xs text-muted-foreground mt-1">The driver has not started tracking yet.</p>
                </>
              )}
            </div>
          )}

          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={mapCenter}
              zoom={15}
              mapTypeId={mapType}
              options={{
                disableDefaultUI: true,
                zoomControl:      true,
                fullscreenControl: true,
                styles:           LIGHT_STYLES,
              }}
              onLoad={(map) => { mapRef.current = map; }}
            >
              {/* Truck marker */}
              {truckPos && truckIcon && (
                <MarkerF
                  position={truckPos}
                  icon={truckIcon}
                  label={{
                    text:       "Collection Truck",
                    color:      "#111827",
                    fontSize:   "11px",
                    fontWeight: "600",
                    className:  "marker-label-truck",
                  }}
                  zIndex={10}
                />
              )}

              {/* User marker */}
              {userPos && userIcon && (
                <MarkerF
                  position={userPos}
                  icon={userIcon}
                  label={{
                    text:       "You",
                    color:      "#111827",
                    fontSize:   "11px",
                    fontWeight: "600",
                  }}
                  zIndex={5}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
              Loading map…
            </div>
          )}
        </div>

        {/* ── Tracking Details Panel ── */}
        <div className="w-60 shrink-0 border-l bg-card overflow-y-auto p-5 space-y-5">
          <h3 className="font-semibold text-base">Tracking Details</h3>

          {/* Driver */}
          <DetailRow icon={<User className="h-4 w-4 text-muted-foreground" />} label="Driver" value={driverName || "—"} />

          {/* Truck */}
          <DetailRow icon={<Truck className="h-4 w-4 text-muted-foreground" />} label="Truck" value={displayPlate} />

          {/* Route */}
          <DetailRow icon={<RouteIcon className="h-4 w-4 text-muted-foreground" />} label="Route" value={displayRouteName} />

          {/* Status */}
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className={`text-sm font-semibold flex items-center gap-1.5 ${statusColor}`}>
              <span className={`h-2 w-2 rounded-full ${trackStatus === "tracking" ? "bg-emerald-500 animate-pulse" : trackStatus === "completed" ? "bg-blue-400" : "bg-amber-400"}`} />
              {statusLabel}
            </p>
          </div>

          {/* Coordinates */}
          <DetailRow
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            label="Coordinates"
            value={truckPos ? `${fmt(truckPos.lat, 5)}, ${fmt(truckPos.lng, 5)}` : "—"}
          />

          {/* Speed */}
          <DetailRow
            icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
            label="Current Speed"
            value={trackStatus === "tracking" ? `${Math.round(speed)} km/h` : "—"}
          />

          {/* Last Updated */}
          <DetailRow
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            label="Last Updated"
            value={timeAgo}
            valueClass={trackStatus === "tracking" ? "text-emerald-500" : undefined}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t bg-card px-6 py-4 space-y-4">

        {/* Info chips */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collection Schedule</p>
              <p className="font-medium text-xs">Today&nbsp;·&nbsp;{collectionTime || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <RouteIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="font-medium text-xs">{displayRouteName}</p>
            </div>
          </div>

          {eta && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Clock className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Arrival</p>
                <p className="font-medium text-xs text-emerald-500">{eta}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={panToUser}
            disabled={!userPos}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LocateFixed className="h-4 w-4" />
            My Location
          </button>
          <button
            onClick={panToTruck}
            disabled={!truckPos}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Truck className="h-4 w-4" />
            Truck Location
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component ──────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold break-words ${valueClass || ""}`}>{value}</p>
      </div>
    </div>
  );
}
