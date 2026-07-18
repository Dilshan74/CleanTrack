import { useEffect, useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

export default function ManageUsers() {
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("All zones");

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">4,218 residents registered.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
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
    </div>
  );
}
