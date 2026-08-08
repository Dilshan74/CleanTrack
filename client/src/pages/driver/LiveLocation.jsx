import { useEffect, useState, useCallback } from "react";
import { MapPin, Navigation, Gauge, RefreshCw, CheckCircle2, LocateFixed, Shield } from "lucide-react";
import { useLocation } from "../../hooks/useLocation";
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from "@react-google-maps/api";
import driverService from "../../services/driverService";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const DEFAULT_CENTER = {
  lat: 6.9271,
  lng: 79.8612,
};

// Premium dark mode maps style
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
  ],
};

function fmt(n, digits = 5) {
  return typeof n === "number" ? n.toFixed(digits) : "—";
}

function distanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LiveLocation() {
  const { position, tracking, permissionState, start, stop, driverInfo } = useLocation();
  const driverLabel = driverInfo?.fullName ? `\uD83D\uDE9B ${driverInfo.fullName}` : "\uD83D\uDE9B Driver";
  const [stopsData, setStopsData] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState("Calculating...");
  const [distanceRemaining, setDistanceRemaining] = useState("Calculating...");
  const [autoCompletedStop, setAutoCompletedStop] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const loadStops = useCallback(() => {
    driverService.getStops().then(setStopsData);
  }, []);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  useEffect(() => {
    if (!isLoaded || !position || !stopsData || stopsData.stops.length === 0) return;
    const pendingStops = stopsData.stops.filter((s) => s.status === "Pending");
    if (pendingStops.length === 0) {
      setDirections(null);
      setEta("No pending stops");
      setDistanceRemaining("0 km");
      return;
    }
    const nextStop = pendingStops[0];
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: position.lat, lng: position.lng },
        destination: { lat: nextStop.lat, lng: nextStop.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setEta(leg.duration.text);
          setDistanceRemaining(leg.distance.text);
        }
      }
    );
  }, [isLoaded, position, stopsData]);

  useEffect(() => {
    if (!position || !stopsData || stopsData.stops.length === 0) return;
    const pendingStops = stopsData.stops.filter((s) => s.status === "Pending");
    if (pendingStops.length === 0) return;
    const nextStop = pendingStops[0];
    const dist = distanceInKm(position.lat, position.lng, nextStop.lat, nextStop.lng);
    if (dist <= 0.05) {
      driverService.updateStopStatus(nextStop.id, "Collected", nextStop.type).then(() => {
        setAutoCompletedStop(nextStop);
        loadStops();
        setTimeout(() => setAutoCompletedStop(null), 5000);
      });
    }
  }, [position, stopsData, loadStops]);

  /* ── DENIED: Beautiful step-by-step guide ── */
  if (permissionState === "denied") {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Live Location</h1>
          <p className="text-muted-foreground">Real-time GPS routing, navigation, and auto stop completion.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-8 shadow-lg text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Location Access Blocked</h2>
            <p className="text-sm text-muted-foreground mb-7">
              You previously blocked location. Follow these 4 quick steps to re-enable it:
            </p>
            <div className="space-y-3 text-left mb-7">
              <div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                <div>
                  <p className="font-semibold text-sm">Click the lock icon in the address bar</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Look for <strong>🔒</strong> or <strong>ⓘ</strong> to the left of the URL</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                <div>
                  <p className="font-semibold text-sm">Click &ldquo;Site settings&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-0.5">It appears in the dropdown at the bottom</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                <div>
                  <p className="font-semibold text-sm">Set Location from &ldquo;Block&rdquo; to &ldquo;Allow&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Find the <strong>Location</strong> row and change the dropdown</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-white text-sm font-bold">4</span>
                <div>
                  <p className="font-semibold text-sm">Click &ldquo;Try Again&rdquo; below</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No page reload needed</p>
                </div>
              </div>
            </div>
            <button
              onClick={start}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <LocateFixed className="h-4 w-4" />
              Try Again — Enable Location
            </button>
            <p className="mt-4 text-xs text-muted-foreground">
              🔒 Your location is only used for route tracking and is never stored.
            </p>
          </div>
        </div>
      </div>
    );
  }


  /* ── MAIN TRACKING UI ── */
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Location</h1>
          <p className="text-muted-foreground">
            Real-time GPS routing, navigation, and auto stop completion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            tracking ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              tracking ? "bg-success animate-pulse" : "bg-muted-foreground"
            }`} />
            {tracking ? "Tracking" : permissionState === "acquiring" ? "Acquiring GPS..." : "Paused"}
          </span>
          <button
            onClick={tracking ? stop : start}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> {tracking ? "Stop" : "Start Tracking"}
          </button>
        </div>
      </div>

      {autoCompletedStop && (
        <div className="mb-4 p-4 rounded-xl bg-success/15 border border-success text-success flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span><strong>Auto Completed:</strong> Stop #{autoCompletedStop.seq} ({autoCompletedStop.addr}) marked as Collected!</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden h-96 relative">

          {/* GPS acquiring overlay on the map */}
          {permissionState === "acquiring" && !position && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary">
                  <LocateFixed className="h-7 w-7 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold">Acquiring GPS Signal</p>
                <p className="text-xs text-muted-foreground mt-1">Getting your exact location&hellip;</p>
              </div>
            </div>
          )}

          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={position ? { lat: position.lat, lng: position.lng } : DEFAULT_CENTER}
              zoom={14}
              options={MAP_OPTIONS}
            >
              {position && (
                <MarkerF
                  position={{ lat: position.lat, lng: position.lng }}
                  options={{
                    label: {
                      text: driverLabel,
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    },
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              Loading Map APIs...
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Navigation Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Driver Coordinates</div>
                <div className="font-medium">{fmt(position?.lat)}, {fmt(position?.lng)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gauge className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Speed</div>
                <div className="font-medium">{position ? `${Math.round(position.speed)} km/h` : "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Navigation className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">ETA to Next Stop</div>
                <div className="font-semibold text-primary">{eta}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="text-muted-foreground text-xs">Distance Remaining</div>
                <div className="font-semibold text-emerald-500">{distanceRemaining}</div>
              </div>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              Updated: {position ? new Date(position.updatedAt).toLocaleTimeString() : "waiting…"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
