import { useEffect, useState } from "react";
import { Plus, Fuel, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";

const tone = {
  "On route": "bg-success/15 text-success",
  Idle: "bg-muted text-muted-foreground",
  Maintenance: "bg-warning/20 text-warning-foreground",
};

export default function ManageTrucks() {
  const [trucks, setTrucks] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    plateNumber: "",
    capacity: "",
  });

  useEffect(() => {
    adminService.getTrucks().then(setTrucks);
  }, []);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddTruck(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminService.addTruck({
        plateNumber: form.plateNumber,
        capacity: Number(form.capacity),
      });
      setTrucks(null);
      adminService.getTrucks().then(setTrucks);
      setShowAddModal(false);
      setForm({ plateNumber: "", capacity: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTruck(truck) {
    if (!window.confirm(`Delete truck "${truck.plate}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteTruck(truck._id);
      setTrucks(null);
      adminService.getTrucks().then(setTrucks);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete truck.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Trucks</h1>
          <p className="text-muted-foreground">Fleet status and fuel levels.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add truck
        </button>
      </div>

      {!trucks ? (
        <Loader label="Loading trucks…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trucks.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground border rounded-xl">No trucks found.</div>
          ) : (
            trucks.map((t) => (
              <div key={t.id || t._id} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{t.id}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${tone[t.status] || tone.Idle}`}>{t.status}</span>
                    <button
                      onClick={() => handleDeleteTruck(t)}
                      className="text-destructive hover:text-destructive/80"
                      title="Delete truck"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Plate</div><div className="font-medium">{t.plate}</div></div>
                  <div><div className="text-xs text-muted-foreground">Capacity</div><div className="font-medium">{t.capacity}</div></div>
                  <div><div className="text-xs text-muted-foreground">Driver</div><div className="font-medium">{t.driver}</div></div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 text-muted-foreground"><Fuel className="h-3.5 w-3.5" /> Fuel</span>
                    <span>{t.fuel}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${t.fuel < 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${t.fuel}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Truck">
        <form onSubmit={handleAddTruck} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Plate Number</label>
            <input required value={form.plateNumber} onChange={(e) => updateForm("plateNumber", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Capacity (in tons)</label>
            <input required type="number" min="1" step="0.5" value={form.capacity} onChange={(e) => updateForm("capacity", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : "Add Truck"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
