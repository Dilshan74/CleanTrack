import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";

const STATUSES = ["Available", "Assigned", "On Route", "Off Duty", "On Leave"];

const tone = {
  "Available": "bg-emerald-100 text-emerald-700",
  "Assigned":  "bg-blue-100 text-blue-700",
  "On Route":  "bg-amber-100 text-amber-700",
  "Off Duty":  "bg-muted text-muted-foreground",
  "On Leave":  "bg-orange-100 text-orange-700",
  "Completed": "bg-muted text-muted-foreground",
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  licenseNumber: "",
  assigntruck: "",
  assignroute: "",
};

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState(null);
  const [trucksList, setTrucksList] = useState([]);
  const [routesList, setRoutesList] = useState([]);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [form, setForm] = useState(emptyForm);

  // Assign modal
  const [assignTarget, setAssignTarget] = useState(null); // driver object
  const [assignForm, setAssignForm] = useState({ route: "", vehicleNumber: "" });
  const [assignError, setAssignError] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Inline status editing
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  function refresh() {
    setDrivers(null);
    adminService.getDrivers().then(setDrivers);
  }

  useEffect(() => {
    refresh();
    adminService.getTrucks().then(setTrucksList);
    adminService.getRoutes().then(setRoutesList);
  }, []);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateAssignForm(key, value) {
    setAssignForm((f) => ({ ...f, [key]: value }));
  }

  function openAssign(driver) {
    setAssignTarget(driver);
    setAssignForm({
      route: driver._routeId || "",
      vehicleNumber: driver._truckId || "",
    });
    setAssignError("");
  }

  async function handleStatusChange(driverId, newStatus) {
    setStatusSaving(true);
    try {
      await adminService.updateDriverStatus(driverId, newStatus);
      setDrivers((prev) =>
        prev.map((d) => (d._id === driverId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusSaving(false);
      setEditingStatusId(null);
    }
  }

  async function handleAddDriver(e) {
    e.preventDefault();
    setSaving(true);
    setAddError("");
    try {
      await adminService.addDriver({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        licenseNumber: form.licenseNumber,
        vehicleNumber: form.assigntruck || null,
        assignedRoute: form.assignroute || null,
      });
      setShowAddModal(false);
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setAddError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setAssigning(true);
    setAssignError("");
    try {
      await adminService.assignDriver(assignTarget._id, {
        route: assignForm.route || null,
        vehicleNumber: assignForm.vehicleNumber || null,
      });
      setAssignTarget(null);
      refresh();
    } catch (err) {
      setAssignError(err?.response?.data?.message || err.message);
    } finally {
      setAssigning(false);
    }
  }

  async function handleDelete(driver) {
    if (!window.confirm(`Delete driver "${driver.name}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteDriver(driver._id);
      refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete driver.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Drivers</h1>
          <p className="text-muted-foreground">{drivers ? drivers.length : "..."} active drivers across 4 zones.</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddError(""); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add driver
        </button>
      </div>

      {!drivers ? (
        <Loader label="Loading drivers…" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">License</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Truck</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No drivers found.</td></tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d._id} className="border-t">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.license}</td>
                    <td className="px-4 py-3">{d.route}</td>
                    <td className="px-4 py-3">{d.truck}</td>
                    <td className="px-4 py-3">
                      {editingStatusId === d._id ? (
                        <select
                          autoFocus
                          disabled={statusSaving}
                          defaultValue={d.status}
                          onChange={(e) => handleStatusChange(d._id, e.target.value)}
                          onBlur={() => setEditingStatusId(null)}
                          className="rounded-md border bg-background px-2 py-0.5 text-xs outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          title="Click to change status"
                          onClick={() => setEditingStatusId(d._id)}
                          className={`text-xs rounded-full px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity ${tone[d.status] || "bg-muted text-muted-foreground"}`}
                        >
                          {d.status}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                      <button
                        onClick={() => openAssign(d)}
                        className="text-sm text-primary hover:underline"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        className="text-destructive hover:text-destructive/80"
                        title="Delete driver"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Driver Modal ── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Driver">
        <form onSubmit={handleAddDriver} className="space-y-4">
          {addError && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{addError}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input required value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input required type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone (10 digits)</label>
            <input required pattern="\d{10}" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password <span className="text-muted-foreground font-normal text-xs">(driver uses this to log in)</span></label>
            <input required type="password" minLength={6} value={form.password} onChange={(e) => updateForm("password", e.target.value)} placeholder="Min. 6 characters" className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">License Number</label>
            <input required value={form.licenseNumber} onChange={(e) => updateForm("licenseNumber", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Assign Route (Optional)</label>
            <select value={form.assignroute} onChange={(e) => updateForm("assignroute", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- No Route Assigned --</option>
              {routesList.map(r => (
                <option key={r._id} value={r._id}>{r.id}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Assign Truck (Optional)</label>
            <select value={form.assigntruck} onChange={(e) => updateForm("assigntruck", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- No Truck Assigned --</option>
              {trucksList.map(t => (
                <option key={t._id} value={t._id}>{t.plate} ({t.capacity})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : "Add Driver"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Assign Route & Truck Modal ── */}
      <Modal isOpen={!!assignTarget} onClose={() => setAssignTarget(null)} title={`Assign — ${assignTarget?.name || ""}`}>
        <form onSubmit={handleAssign} className="space-y-4">
          {assignError && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{assignError}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Route</label>
            <select value={assignForm.route} onChange={(e) => updateAssignForm("route", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- Unassign Route --</option>
              {routesList.map(r => (
                <option key={r._id} value={r._id}>{r.id}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Truck</label>
            <select value={assignForm.vehicleNumber} onChange={(e) => updateAssignForm("vehicleNumber", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- Unassign Truck --</option>
              {trucksList.map(t => (
                <option key={t._id} value={t._id}>{t.plate} ({t.capacity}) — {t.driver}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">Assigning a truck that already belongs to another driver will show an error.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAssignTarget(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={assigning} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {assigning ? "Saving..." : "Save Assignment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
