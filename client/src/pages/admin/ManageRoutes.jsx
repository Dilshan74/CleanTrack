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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    routeName: "",
    collectionTime: "",
    province: "Western",
    district: "Colombo",
    municipalCouncil: "Colombo",
  });

  useEffect(() => {
    adminService.getRoutes().then(setRoutes);
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
      await adminService.addRoute({
        routeName: form.routeName,
        collectionTime: form.collectionTime,
        areas: [
          {
            province: form.province,
            district: form.district,
            municipalCouncil: form.municipalCouncil,
            areaName: form.municipalCouncil,
          },
        ],
      });
      setRoutes(null);
      adminService.getRoutes().then(setRoutes);
      setShowAddModal(false);
      setForm({
        routeName: "",
        collectionTime: "",
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Routes</h1>
          <p className="text-muted-foreground">{routes ? routes.length : "..."} active routes.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
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
                      <div className="font-semibold">{r.id}</div>
                      <div className="text-xs text-muted-foreground">{r.zone}</div>
                    </div>
                  </div>
                  <button className="text-sm text-primary">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Stops</div><div className="font-medium">{r.stops}</div></div>
                  <div><div className="text-xs text-muted-foreground">Days</div><div className="font-medium">{r.days}</div></div>
                  <div><div className="text-xs text-muted-foreground">Driver</div><div className="font-medium">{r.driver}</div></div>
                  <div><div className="text-xs text-muted-foreground">Truck</div><div className="font-medium">{r.truck}</div></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Route">
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Collection Time/Days</label>
            <input required value={form.collectionTime} onChange={(e) => updateForm("collectionTime", e.target.value)} placeholder="e.g. Mon, Wed 7:30 AM" className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : "Create Route"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
