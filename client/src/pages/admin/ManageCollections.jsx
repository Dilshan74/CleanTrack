import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

const tone = {
  Completed: "bg-success/15 text-success",
  "In progress": "bg-warning/20 text-warning-foreground",
  Scheduled: "bg-muted text-muted-foreground",
};

const filters = ["All", "Scheduled", "In progress", "Completed"];

export default function ManageCollections() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    adminService.getCollections().then(setItems);
  }, []);

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
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Tons</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{c.id}</td>
                  <td className="px-4 py-3">{c.route}</td>
                  <td className="px-4 py-3">{c.zone}</td>
                  <td className="px-4 py-3">{c.date}</td>
                  <td className="px-4 py-3">{c.tons > 0 ? `${c.tons} t` : "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs rounded-full px-2 py-0.5 ${tone[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
