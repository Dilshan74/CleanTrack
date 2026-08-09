import { useEffect, useMemo, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";

const tone = {
  Completed: "bg-success/15 text-success",
  "In progress": "bg-warning/20 text-warning-foreground",
  Scheduled: "bg-muted text-muted-foreground",
  Missed: "bg-destructive/10 text-destructive",
};

const filters = ["All", "Scheduled", "In progress", "Completed", "Missed"];

export default function ManageCollections() {
  const [items, setItems] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [filter, setFilter] = useState("All");

  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "Active", collectionDate: "", collectionTimeOfDay: "", driverId: "", truckId: "" });

  function refreshCollections() {
    setItems(null);
    adminService.getCollections().then(setItems);
  }

  useEffect(() => {
    refreshCollections();
    adminService.getDrivers().then(setDrivers);
    adminService.getTrucks().then(setTrucks);
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const payload = {
        status: form.status,
        collectionTime: `${form.collectionDate} ${form.collectionTimeOfDay}`.trim(),
      };
      if (form.driverId) {
        payload.assignedDriver = form.driverId;
        payload.collectionStatus = "Assigned";
      }
      if (form.truckId) {
        payload.assignedTruck = form.truckId;
      }
      
      await adminService.updateRoute(editingItem.id, payload);
      setEditingItem(null);
      refreshCollections();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingItem) return;
    if (!window.confirm("Are you sure you want to delete this route completely? This cannot be undone.")) return;
    setSaving(true);
    try {
      await adminService.deleteRoute(editingItem.id);
      setEditingItem(null);
      refreshCollections();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  const rows = useMemo(() => {
    if (!items) return [];
    return filter === "All" ? items : items.filter((c) => c.status === filter);
  }, [items, filter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Collections</h1>
        <p className="text-muted-foreground">Scheduled and completed collection runs.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {!items ? (
        <Loader label="Loading collections…" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Driver Name</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Postal Code</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {c.driver || "—"}
                    <div className="text-xs text-muted-foreground font-normal">{c.truck || "No truck"}</div>
                  </td>
                  <td className="px-4 py-3">{c.route}</td>
                  <td className="px-4 py-3">{c.zone}</td>
                  <td className="px-4 py-3">{c.postalCode || "—"}</td>
                  <td className="px-4 py-3">{c.date}</td>
                  <td className="px-4 py-3"><span className={`text-xs rounded-full px-2 py-0.5 ${tone[c.status] || tone.Scheduled}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {c.isRoute && (
                      <button onClick={() => {
                        const timeParts = (c.fullTime || "").split(" ");
                        setEditingItem(c);
                        setForm({ 
                          status: c.status === "Completed" ? "Completed" : "Active",
                          collectionDate: timeParts[0] || "",
                          collectionTimeOfDay: timeParts.slice(1).join(" ") || "",
                          driverId: c.driverId || "",
                          truckId: c.truckId || "",
                        });
                      }} className="text-primary hover:text-primary/80" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Edit Collection">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Route Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active / Scheduled</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Marking a route as Completed removes it from the pending schedule.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Assigned Driver</label>
              <select
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Unassigned</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Assigned Truck</label>
              <select
                value={form.truckId}
                onChange={(e) => setForm({ ...form, truckId: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Unassigned</option>
                {trucks.map(t => (
                  <option key={t._id} value={t._id}>{t.plateNumber}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Collection Date</label>
              <input type="date" value={form.collectionDate} onChange={(e) => setForm({ ...form, collectionDate: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Collection Time</label>
              <input type="time" value={form.collectionTimeOfDay} onChange={(e) => setForm({ ...form, collectionTimeOfDay: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <button type="button" onClick={handleDelete} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" /> Delete Route
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingItem(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
