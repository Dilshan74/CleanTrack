import { useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";

const LOCATION_DATA = {
  Western: {
    Colombo: ["Colombo", "Dehiwala-Mount Lavinia", "Sri Jayawardenepura Kotte", "Kaduwela", "Moratuwa"],
    Gampaha: ["Negombo", "Gampaha"],
  },
  "North Western": {
    Kurunegala: ["Kurunegala"],
  },
  Central: {
    Kandy: ["Kandy"],
    Matale: ["Matale", "Dambulla"],
    "Nuwara Eliya": ["Nuwara Eliya"],
  },
  Uva: {
    Badulla: ["Badulla", "Bandarawela"],
  },
  Southern: {
    Galle: ["Galle"],
    Matara: ["Matara"],
    Hambantota: ["Hambantota"],
  },
  Sabaragamuwa: {
    Ratnapura: ["Ratnapura"],
  },
  "North Central": {
    Anuradhapura: ["Anuradhapura"],
    Polonnaruwa: ["Polonnaruwa"],
  },
  Northern: {
    Jaffna: ["Jaffna"],
  },
  Eastern: {
    Batticaloa: ["Batticaloa"],
    Ampara: ["Kalmunai", "Akkaraipattu"],
  },
};

export default function ManageRoutes() {
  const [routes, setRoutes] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    routeName: "",
    collectionDate: "",
    collectionTimeOfDay: "",
    postalCode: "",
    province: "Western",
    district: "Colombo",
    municipalCouncil: "Colombo",
  });

  function refreshRoutes() {
    setRoutes(null);
    adminService.getRoutes().then(setRoutes);
  }

  useEffect(() => {
    refreshRoutes();
  }, []);

  const provinceOptions = Object.keys(LOCATION_DATA);
  const districtOptions = LOCATION_DATA[form.province] ? Object.keys(LOCATION_DATA[form.province]) : [];
  const municipalOptions = LOCATION_DATA[form.province]?.[form.district] || [];

  function updateForm(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };

      if (key === "province") {
        const nextDistricts = Object.keys(LOCATION_DATA[value] || {});
        const nextDistrict = nextDistricts[0] || "";
        next.district = nextDistrict;
        next.municipalCouncil = LOCATION_DATA[value]?.[nextDistrict]?.[0] || "";
      }

      if (key === "district") {
        next.municipalCouncil = LOCATION_DATA[next.province]?.[value]?.[0] || "";
      }

      return next;
    });
  }

  async function handleAddRoute(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        routeName: form.routeName,
        collectionTime: `${form.collectionDate} ${form.collectionTimeOfDay}`,
        postalCode: form.postalCode,
        areas: [
          {
            province: form.province,
            district: form.district,
            municipalCouncil: form.municipalCouncil,
            areaName: form.municipalCouncil,
          },
        ],
      };

      if (editingRoute) {
        await adminService.updateRoute(editingRoute._id, payload);
      } else {
        await adminService.addRoute(payload);
      }

      setRoutes(null);
      adminService.getRoutes().then(setRoutes);
      setShowAddModal(false);
      setEditingRoute(null);
      setForm({
        routeName: "",
        collectionDate: "",
        collectionTimeOfDay: "",
        postalCode: "",
        province: "Western",
        district: "Colombo",
        municipalCouncil: "Colombo",
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
              collectionDate: "",
              collectionTimeOfDay: "",
              postalCode: "",
              province: "Western",
              district: "Colombo",
              municipalCouncil: "Colombo",
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
              <div key={r._id || r.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{r.routeName || r.id}</div>
                      <div className="text-xs text-muted-foreground">{r.zone}</div>
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
                          collectionDate: cDate,
                          collectionTimeOfDay: cTime,
                          postalCode: r.postalCode || "",
                          province: area.province || "Western",
                          district: area.district || "Colombo",
                          municipalCouncil: area.municipalCouncil || area.areaName || "Colombo",
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Stops</div><div className="font-medium">{r.stops}</div></div>
                  <div><div className="text-xs text-muted-foreground">Postal Code</div><div className="font-medium">{r.postalCode || "—"}</div></div>
                  <div><div className="text-xs text-muted-foreground">Schedule</div><div className="font-medium">{r.collectionTime}</div></div>
                  <div><div className="text-xs text-muted-foreground">Driver</div><div className="font-medium">{r.driver}</div></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingRoute ? "Edit Route" : "New Route"}>
        <form onSubmit={handleAddRoute} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Route Name</label>
            <input required value={form.routeName} onChange={(e) => updateForm("routeName", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
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
              <label className="text-sm font-medium">Municipal Council</label>
              <select required value={form.municipalCouncil} onChange={(e) => updateForm("municipalCouncil", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                {municipalOptions.map((council) => (
                  <option key={council} value={council}>{council}</option>
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Postal Code</label>
            <input
              required
              value={form.postalCode}
              onChange={(e) => updateForm("postalCode", e.target.value)}
              placeholder="e.g. 80000"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Residents with this postal code will see this route in their schedule.</p>
          </div>
          <div className="flex justify-between gap-2 pt-2">
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

