import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Navigation, Gauge, RefreshCw, CheckCircle2 } from "lucide-react";
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
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

function fmt(n, digits = 5) {
  return typeof n === "number" ? n.toFixed(digits) : "—";
}

// Haversine formula to compute distance in km
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
  const { position, tracking, simulated, start, stop } = useLocation();
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

  // Request Directions & Calculate ETA
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
    const destination = { lat: nextStop.lat, lng: nextStop.lng };
    const origin = { lat: position.lat, lng: position.lng };

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setEta(leg.duration.text);
          setDistanceRemaining(leg.distance.text);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, position, stopsData]);

  // Automatic Stop Completion logic
  useEffect(() => {
    if (!position || !stopsData || stopsData.stops.length === 0) return;

    const pendingStops = stopsData.stops.filter((s) => s.status === "Pending");
    if (pendingStops.length === 0) return;

    const nextStop = pendingStops[0];
    const dist = distanceInKm(position.lat, position.lng, nextStop.lat, nextStop.lng);

    // If within 50 meters (0.05 km)
    if (dist <= 0.05) {
      driverService.updateStopStatus(nextStop.id, "Collected", nextStop.type).then(() => {
        setAutoCompletedStop(nextStop);
        loadStops();
        setTimeout(() => setAutoCompletedStop(null), 5000);
      });
    }
  }, [position, stopsData, loadStops]);

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
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tracking ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${tracking ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            {tracking ? "Tracking" : "Paused"}
          </span>
          <button onClick={tracking ? stop : start} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted cursor-pointer">
            <RefreshCw className="h-4 w-4" /> {tracking ? "Stop" : "Start"}
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
                      text: "🚛 TRK-07",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    },
                  }}
                />
              )}

              {stopsData?.stops.map((stop) => (
                <MarkerF
                  key={stop.id}
                  position={{ lat: stop.lat, lng: stop.lng }}
                  icon={{
                    url: stop.status === "Collected"
                      ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                  options={{
                    label: {
                      text: `#${stop.seq}`,
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "bold",
                    },
                  }}
                />
              ))}

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#3b82f6",
                      strokeWeight: 5,
                      strokeOpacity: 0.8,
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
