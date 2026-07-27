import { useEffect, useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";

export default function ManageUsers() {
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("All zones");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    adminService.getUsers().then(setUsers);
  }, []);

  const rows = useMemo(() => {
    return (users || []).filter((u) => {
      const q = query.toLowerCase();
      const matchesQuery = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesZone = zone === "All zones" || u.zone === zone;
      return matchesQuery && matchesZone;
    });
  }, [users, query, zone]);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminService.addUser(form);
      setUsers(null);
      adminService.getUsers().then(setUsers);
      setShowAddModal(false);
      setForm({ fullName: "", email: "", password: "", phone: "", address: "" });
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
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">{users ? users.length : "..."} residents registered.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>

      {!users ? (
        <Loader label="Loading users…" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b p-3">
            <div className="flex items-center gap-2 flex-1 rounded-lg bg-muted px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
              <option>All zones</option>
              <option>Zone A</option>
              <option>Zone B</option>
              <option>Zone C</option>
              <option>Zone D</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users match your filters.</td></tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.email} className="border-t">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">{u.zone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${u.status === "Active" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right"><button className="text-sm text-primary">Edit</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add User">
        <form onSubmit={handleAddUser} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <input required value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
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
            <label className="text-sm font-medium">Address / Zone</label>
            <input required value={form.address} onChange={(e) => updateForm("address", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input required type="password" minLength={6} value={form.password} onChange={(e) => updateForm("password", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : "Add User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
