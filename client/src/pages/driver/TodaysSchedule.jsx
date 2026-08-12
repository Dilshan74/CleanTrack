import { useEffect, useState, useRef } from "react";
import { Play, Map, MapPin, Truck, Calendar, Clock, Navigation } from "lucide-react";
import Loader from "../../components/common/Loader";
import driverService from "../../services/driverService";
import Modal from "../../components/common/Modal";
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

const tone = {
  Done: "bg-success/15 text-success",
  "In progress": "bg-warning/20 text-warning-foreground",
  Pending: "bg-muted text-muted-foreground",
};

const MAP_CONTAINER_STYLE = { width: "100%", height: "400px" };
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

export default function TodaysSchedule() {
  const [stops, setStops] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [driverPos, setDriverPos] = useState(null);
  const [starting, setStarting] = useState(false);
  
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    driverService.getTodaysSchedule().then(setStops);
    driverService.getRoute().then(data => setRouteInfo(data.route));
    driverService.getProfile().then(setProfile);
    
    // Get driver's current position for mapping
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => console.warn("Driver geolocation permission denied or unavailable.")
      );
    }
  }, []);

  async function handleStartCollection() {
    if (!routeInfo) return;
    setStarting(true);
    try {
      await driverService.startCollection(routeInfo._id);
      // Navigate to driver location tracking page to start transmitting live coordinates
      navigate("/driver/location");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to start collection.");
    } finally {
      setStarting(false);
    }
  }

  if (!stops || !profile) return <Loader label="Loading schedule…" />;

  // Format collection details
  const timeParts = (routeInfo?.collectionTime || "").split(" ");
  const collectionDate = timeParts[0] || "Scheduled";
  const collectionTime = timeParts.slice(1).join(" ") || "7:30 AM";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Schedule</h1>
          <p className="text-muted-foreground">Ordered by stop sequence.</p>
        </div>
        <div className="flex gap-2">
          {routeInfo && (
            <button
              onClick={() => setShowMapModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Map className="h-4 w-4 text-primary" /> View Route
            </button>
          )}
          {routeInfo && routeInfo.collectionStatus !== "Completed" && (
            <button
              onClick={handleStartCollection}
              disabled={starting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> {starting ? "Starting..." : "Start Collection"}
            </button>
          )}
        </div>
      </div>

      {/* Route Detail Card */}
      {routeInfo && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Route: {routeInfo.routeName}</h2>
          </div>
          {routeInfo.routeDescription && (
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">{routeInfo.routeDescription}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">📍</span>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Start Point</div>
                <div className="font-medium text-foreground">{routeInfo.startPoint?.name || "—"}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🏁</span>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">End Point</div>
                <div className="font-medium text-foreground">{routeInfo.endPoint?.name || "—"}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Assigned Truck</div>
                <div className="font-medium text-foreground">{profile.truck || "—"}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Collection Date / Time</div>
                <div className="font-medium text-foreground">{collectionDate} @ {collectionTime}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🗺️</span>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Location Area</div>
                <div className="font-medium text-foreground">
                  {routeInfo.city || routeInfo.areas?.[0]?.city || routeInfo.areas?.[0]?.municipalCouncil || "—"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">📮</span>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Postal Code</div>
                <div className="font-medium text-foreground">{routeInfo.postalCode || "—"}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🏢</span>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Province / District</div>
                <div className="font-medium text-foreground">{routeInfo.province || routeInfo.areas?.[0]?.province || "—"} / {routeInfo.district || routeInfo.areas?.[0]?.district || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stops Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-left">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((s) => (
              <tr key={s.seq} className="border-t">
                <td className="px-4 py-3 font-medium">{s.seq}</td>
                <td className="px-4 py-3">{s.addr}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${tone[s.status] || tone.Pending}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Route Map Modal */}
      {routeInfo && (
        <Modal isOpen={showMapModal} onClose={() => setShowMapModal(false)} title={`Route Map: ${routeInfo.routeName}`}>
          <div className="space-y-4">
            {isLoaded ? (
              <div className="rounded-xl overflow-hidden border">
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={routeInfo.startPoint ? { lat: routeInfo.startPoint.latitude, lng: routeInfo.startPoint.longitude } : DEFAULT_CENTER}
                  zoom={13}
                  onLoad={(map) => {
                    if (routeInfo.startPoint && routeInfo.endPoint) {
                      const bounds = new window.google.maps.LatLngBounds();
                      bounds.extend({ lat: routeInfo.startPoint.latitude, lng: routeInfo.startPoint.longitude });
                      bounds.extend({ lat: routeInfo.endPoint.latitude, lng: routeInfo.endPoint.longitude });
                      if (driverPos) bounds.extend(driverPos);
                      map.fitBounds(bounds);
                    }
                  }}
                >
                  {/* Start Point Marker */}
                  {routeInfo.startPoint && (
                    <MarkerF
                      position={{ lat: routeInfo.startPoint.latitude, lng: routeInfo.startPoint.longitude }}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      }}
                      title={`Start Point: ${routeInfo.startPoint.name}`}
                    />
                  )}

                  {/* End Point Marker */}
                  {routeInfo.endPoint && (
                    <MarkerF
                      position={{ lat: routeInfo.endPoint.latitude, lng: routeInfo.endPoint.longitude }}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                      }}
                      title={`End Point: ${routeInfo.endPoint.name}`}
                    />
                  )}

                  {/* Driver's Live Location Marker */}
                  {driverPos && (
                    <MarkerF
                      position={driverPos}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      }}
                      title="Your Current Location"
                    />
                  )}

                  {/* Route Polyline */}
                  {routeInfo.startPoint && routeInfo.endPoint && (
                    <PolylineF
                      path={[
                        { lat: routeInfo.startPoint.latitude, lng: routeInfo.startPoint.longitude },
                        { lat: routeInfo.endPoint.latitude, lng: routeInfo.endPoint.longitude }
                      ]}
                      options={{ strokeColor: "#16a34a", strokeOpacity: 0.8, strokeWeight: 4 }}
                    />
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center text-sm text-muted-foreground">Map Loading...</div>
            )}
            <div className="flex justify-between items-center text-xs text-muted-foreground flex-wrap gap-2">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="inline-block h-3.5 w-3.5 rounded-full bg-[#15803d]" /> Start Point</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3.5 w-3.5 rounded-full bg-[#dc2626]" /> End Point</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3.5 w-3.5 rounded-full bg-[#2563eb]" /> Driver Position</span>
              </div>
              <button onClick={() => setShowMapModal(false)} className="rounded-lg border px-4 py-1.5 hover:bg-muted font-semibold text-foreground">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
