import { useEffect, useState, useRef } from "react";
import { Plus, MapPin, Navigation, Info } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from "@react-google-maps/api";
import { LOCATION_DATA } from "../../utils/locationData";

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "250px" };

export default function ManageRoutes() {
  const [routes, setRoutes] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Selection mode for clicking on the map
  const [mapMode, setMapMode] = useState("start"); // "start" or "end"

  const [form, setForm] = useState({
    routeName: "",
    routeDescription: "",
    collectionDate: "",
    collectionTimeOfDay: "",
    postalCode: "00100",
    province: "Western Province",
    district: "Colombo",
    city: "Colombo 01 (Fort)",
    assignedDriver: "",
    assignedTruck: "",
    startPoint: { name: "", latitude: 6.9271, longitude: 79.8612 },
    endPoint: { name: "", latitude: 6.9371, longitude: 79.8712 }
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  function refreshRoutes() {
    setRoutes(null);
    adminService.getRoutes().then(setRoutes);
  }

  useEffect(() => {
    refreshRoutes();
    adminService.getDrivers().then(setDrivers);
    adminService.getTrucks().then(setTrucks);
  }, []);

  const provinceOptions = Object.keys(LOCATION_DATA);
  const districtOptions = LOCATION_DATA[form.province] ? Object.keys(LOCATION_DATA[form.province]) : [];
  const cityOptions = LOCATION_DATA[form.province]?.[form.district] || [];

  function updateForm(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };

      if (key === "province") {
        const nextDistricts = Object.keys(LOCATION_DATA[value] || {});
        const nextDistrict = nextDistricts[0] || "";
        next.district = nextDistrict;
        
        const nextCities = LOCATION_DATA[value]?.[nextDistrict] || [];
        const nextCity = nextCities[0]?.city || "";
        next.city = nextCity;
        next.postalCode = nextCities[0]?.postalCode || "";
      }

      if (key === "district") {
        const nextCities = LOCATION_DATA[next.province]?.[value] || [];
        const nextCity = nextCities[0]?.city || "";
        next.city = nextCity;
        next.postalCode = nextCities[0]?.postalCode || "";
      }

      if (key === "city") {
        const cityList = LOCATION_DATA[next.province]?.[next.district] || [];
        const matched = cityList.find(c => c.city === value);
        next.postalCode = matched ? matched.postalCode : "";
      }

      return next;
    });
  }

  function handleMapClick(e) {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    if (mapMode === "start") {
      setForm(f => ({
        ...f,
        startPoint: { ...f.startPoint, latitude: lat, longitude: lng }
      }));
    } else {
      setForm(f => ({
        ...f,
        endPoint: { ...f.endPoint, latitude: lat, longitude: lng }
      }));
    }
  }

  async function handleAddRoute(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validations
    if (!form.startPoint.name.trim()) {
      setError("Start point name is required.");
      setSaving(false);
      return;
    }
    if (!form.endPoint.name.trim()) {
      setError("End point name is required.");
      setSaving(false);
      return;
    }
    if (isNaN(form.startPoint.latitude) || isNaN(form.startPoint.longitude) || isNaN(form.endPoint.latitude) || isNaN(form.endPoint.longitude)) {
      setError("Start and End point coordinates must be valid numbers.");
      setSaving(false);
      return;
    }
    if (Number(form.startPoint.latitude) === Number(form.endPoint.latitude) && Number(form.startPoint.longitude) === Number(form.endPoint.longitude)) {
      setError("Start and End points cannot be exactly identical.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        routeName: form.routeName,
        routeDescription: form.routeDescription,
        collectionTime: `${form.collectionDate} ${form.collectionTimeOfDay}`.trim(),
        province: form.province,
        district: form.district,
        city: form.city,
        postalCode: form.postalCode,
        assignedDriver: form.assignedDriver || null,
        assignedTruck: form.assignedTruck || null,
        startPoint: {
          name: form.startPoint.name,
          latitude: Number(form.startPoint.latitude),
          longitude: Number(form.startPoint.longitude)
        },
        endPoint: {
          name: form.endPoint.name,
          latitude: Number(form.endPoint.latitude),
          longitude: Number(form.endPoint.longitude)
        },
        areas: [
          {
            province: form.province,
            district: form.district,
            city: form.city,
            areaName: form.city,
          },
        ],
      };

      if (editingRoute) {
        await adminService.updateRoute(editingRoute._id, payload);
      } else {
        await adminService.addRoute(payload);
      }

      refreshRoutes();
      setShowAddModal(false);
      setEditingRoute(null);
      setForm({
        routeName: "",
        routeDescription: "",
        collectionDate: "",
        collectionTimeOfDay: "",
        postalCode: "00100",
        province: "Western Province",
        district: "Colombo",
        city: "Colombo 01 (Fort)",
        assignedDriver: "",
        assignedTruck: "",
        startPoint: { name: "", latitude: 6.9271, longitude: 79.8612 },
        endPoint: { name: "", latitude: 6.9371, longitude: 79.8712 }
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoute(r) {
    if (!window.confirm(`Delete route "${r.routeName || r.id}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteRoute(r._id);
      refreshRoutes();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete route.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Routes</h1>
          <p className="text-muted-foreground">{routes ? routes.length : "..."} active routes.</p>
        </div>
        <button 
          onClick={() => {
            setEditingRoute(null);
            setShowAddModal(true);
            setError("");
            setForm({
              routeName: "",
              routeDescription: "",
              collectionDate: "",
              collectionTimeOfDay: "",
              postalCode: "",
              province: "Western",
              district: "Colombo",
              municipalCouncil: "Colombo",
              assignedDriver: "",
              assignedTruck: "",
              startPoint: { name: "", latitude: 6.9271, longitude: 79.8612 },
              endPoint: { name: "", latitude: 6.9371, longitude: 79.8712 }
            });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New route
        </button>
      </div>

      {!routes ? (
        <Loader label="Loading routes…" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routes.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground border rounded-xl">No routes found.</div>
          ) : (
            routes.map((r) => (
              <div key={r._id || r.id} className="rounded-xl border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{r.routeName || r.id}</div>
                      <div className="text-xs text-muted-foreground">{r.city || r.areas?.[0]?.city || r.areas?.[0]?.municipalCouncil || "—"}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const area = (r.areas && r.areas[0]) || {};
                        setEditingRoute(r);
                        const timeParts = (r.collectionTime || "").split(" ");
                        const cDate = timeParts[0] || "";
                        const cTime = timeParts.slice(1).join(" ") || "";
                        setForm({
                          routeName: r.routeName || r.id,
                          routeDescription: r.routeDescription || "",
                          collectionDate: cDate,
                          collectionTimeOfDay: cTime,
                          postalCode: r.postalCode || "",
                          province: r.province || area.province || "Western Province",
                          district: r.district || area.district || "Colombo",
                          city: r.city || area.city || area.municipalCouncil || area.areaName || "Colombo 01 (Fort)",
                          assignedDriver: r.assignedDriver?._id || r.assignedDriver || "",
                          assignedTruck: r.assignedTruck?._id || r.assignedTruck || "",
                          startPoint: r.startPoint || { name: "", latitude: 6.9271, longitude: 79.8612 },
                          endPoint: r.endPoint || { name: "", latitude: 6.9371, longitude: 79.8712 }
                        });
                        setError("");
                        setShowAddModal(true);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(r)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {r.routeDescription && (
                  <p className="text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">{r.routeDescription}</p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
                  <div><div className="text-xs text-muted-foreground font-semibold">📍 Start Point</div><div className="font-medium truncate">{r.startPoint?.name || "—"}</div></div>
                  <div><div className="text-xs text-muted-foreground font-semibold">🏁 End Point</div><div className="font-medium truncate">{r.endPoint?.name || "—"}</div></div>
                  <div><div className="text-xs text-muted-foreground">Schedule</div><div className="font-medium">{r.collectionTime}</div></div>
                  <div><div className="text-xs text-muted-foreground">Driver</div><div className="font-medium">{r.assignedDriver?.name || "—"}</div></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingRoute ? "Edit Route" : "New Route"}>
        <form onSubmit={handleAddRoute} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Route Name</label>
            <input required value={form.routeName} onChange={(e) => updateForm("routeName", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Route Description</label>
            <textarea value={form.routeDescription} onChange={(e) => updateForm("routeDescription", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" rows={2} placeholder="Optional details..." />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Province</label>
              <select required value={form.province} onChange={(e) => updateForm("province", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                {provinceOptions.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">District</label>
              <select required value={form.district} onChange={(e) => updateForm("district", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                {districtOptions.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">City</label>
              <select required value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                {cityOptions.map((c) => (
                  <option key={c.city} value={c.city}>{c.city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Collection Date</label>
              <input required type="date" value={form.collectionDate} onChange={(e) => updateForm("collectionDate", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Collection Time</label>
              <input required type="time" value={form.collectionTimeOfDay} onChange={(e) => updateForm("collectionTimeOfDay", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Assigned Driver</label>
              <select value={form.assignedDriver} onChange={(e) => updateForm("assignedDriver", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                <option value="">Unassigned</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Assigned Truck</label>
              <select value={form.assignedTruck} onChange={(e) => updateForm("assignedTruck", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                <option value="">Unassigned</option>
                {trucks.map(t => (
                  <option key={t._id} value={t._id}>{t.plate}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Postal Code (Auto-populated)</label>
            <input required readOnly value={form.postalCode} className="w-full rounded-lg border bg-muted px-3 py-2 outline-none cursor-not-allowed" />
          </div>

          {/* Start Point Form */}
          <div className="border rounded-xl p-3.5 space-y-3 bg-muted/20">
            <div className="text-sm font-semibold flex items-center gap-1.5 text-primary">📍 Start Point Details</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1 col-span-3 md:col-span-1">
                <label className="text-xs text-muted-foreground">Location Name</label>
                <input required placeholder="e.g. Start Gate" value={form.startPoint.name} onChange={(e) => setForm(f => ({ ...f, startPoint: { ...f.startPoint, name: e.target.value } }))} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Latitude</label>
                <input type="number" step="any" required value={form.startPoint.latitude} onChange={(e) => setForm(f => ({ ...f, startPoint: { ...f.startPoint, latitude: Number(e.target.value) } }))} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Longitude</label>
                <input type="number" step="any" required value={form.startPoint.longitude} onChange={(e) => setForm(f => ({ ...f, startPoint: { ...f.startPoint, longitude: Number(e.target.value) } }))} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* End Point Form */}
          <div className="border rounded-xl p-3.5 space-y-3 bg-muted/20">
            <div className="text-sm font-semibold flex items-center gap-1.5 text-destructive">🏁 End Point Details</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1 col-span-3 md:col-span-1">
                <label className="text-xs text-muted-foreground">Location Name</label>
                <input required placeholder="e.g. End Gate" value={form.endPoint.name} onChange={(e) => setForm(f => ({ ...f, endPoint: { ...f.endPoint, name: e.target.value } }))} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Latitude</label>
                <input type="number" step="any" required value={form.endPoint.latitude} onChange={(e) => setForm(f => ({ ...f, endPoint: { ...f.endPoint, latitude: Number(e.target.value) } }))} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Longitude</label>
                <input type="number" step="any" required value={form.endPoint.longitude} onChange={(e) => setForm(f => ({ ...f, endPoint: { ...f.endPoint, longitude: Number(e.target.value) } }))} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* Google Map Selector & Selector Mode Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Click Map to Select Point</label>
              <div className="flex rounded-lg border overflow-hidden text-xs font-semibold">
                <button type="button" onClick={() => setMapMode("start")} className={`px-3 py-1.5 ${mapMode === "start" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>Select Start</button>
                <button type="button" onClick={() => setMapMode("end")} className={`px-3 py-1.5 ${mapMode === "end" ? "bg-destructive text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}>Select End</button>
              </div>
            </div>
            
            {isLoaded ? (
              <div className="rounded-xl overflow-hidden border">
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={form.startPoint.latitude ? { lat: form.startPoint.latitude, lng: form.startPoint.longitude } : DEFAULT_CENTER}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  {form.startPoint.latitude && (
                    <MarkerF
                      position={{ lat: form.startPoint.latitude, lng: form.startPoint.longitude }}
                      label="S"
                      draggable
                      onDragEnd={(e) => {
                        setForm(f => ({
                          ...f,
                          startPoint: { ...f.startPoint, latitude: e.latLng.lat(), longitude: e.latLng.lng() }
                        }));
                      }}
                    />
                  )}
                  {form.endPoint.latitude && (
                    <MarkerF
                      position={{ lat: form.endPoint.latitude, lng: form.endPoint.longitude }}
                      label="E"
                      draggable
                      onDragEnd={(e) => {
                        setForm(f => ({
                          ...f,
                          endPoint: { ...f.endPoint, latitude: e.latLng.lat(), longitude: e.latLng.lng() }
                        }));
                      }}
                    />
                  )}
                  {form.startPoint.latitude && form.endPoint.latitude && (
                    <PolylineF
                      path={[
                        { lat: form.startPoint.latitude, lng: form.startPoint.longitude },
                        { lat: form.endPoint.latitude, lng: form.endPoint.longitude }
                      ]}
                      options={{ strokeColor: "#16a34a", strokeOpacity: 0.8, strokeWeight: 4 }}
                    />
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="h-[250px] bg-muted rounded-xl flex items-center justify-center text-sm text-muted-foreground">Map Loading...</div>
            )}
          </div>

          <div className="flex justify-between gap-2 pt-2 border-t">
            <button type="button" onClick={() => {
              setShowAddModal(false);
              setEditingRoute(null);
            }} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : editingRoute ? "Update Route" : "Create Route"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
