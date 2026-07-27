import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";

const tone = {
  "On route": "bg-success/15 text-success",
  "Off duty": "bg-muted text-muted-foreground",
  "On leave": "bg-warning/20 text-warning-foreground",
};

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
  });

  useEffect(() => {
    adminService.getDrivers().then(setDrivers);
  }, []);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddDriver(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminService.addDriver(form);
      setDrivers(null);
      adminService.getDrivers().then(setDrivers);
      setShowAddModal(false);
      setForm({ name: "", email: "", phone: "", licenseNumber: "" });
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
          <h1 className="text-2xl font-bold">Manage Drivers</h1>
          <p className="text-muted-foreground">{drivers ? drivers.length : "..."} active drivers across 4 zones.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
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
                  <tr key={d.license || d._id} className="border-t">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.license}</td>
                    <td className="px-4 py-3">{d.route}</td>
                    <td className="px-4 py-3">{d.truck}</td>
                    <td className="px-4 py-3"><span className={`text-xs rounded-full px-2 py-0.5 ${tone[d.status] || tone["Off duty"]}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-right"><button className="text-sm text-primary">Assign</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Driver">
        <form onSubmit={handleAddDriver} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</div>}
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
            <label className="text-sm font-medium">License Number</label>
            <input required value={form.licenseNumber} onChange={(e) => updateForm("licenseNumber", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : "Add Driver"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
