import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import Loader from "../../components/common/Loader";
import driverService from "../../services/driverService";

const badge = {
  Collected: "bg-success/15 text-success",
  Issue: "bg-warning/20 text-warning-foreground",
  Missed: "bg-destructive/10 text-destructive",
  Pending: "bg-muted text-muted-foreground",
};

export default function UpdateCollectionStatus() {
  const [stopsData, setStopsData] = useState(null);

  useEffect(() => {
    driverService.getStops().then(setStopsData);
  }, []);

  async function setStatus(id, status, wasteType) {
    setStopsData((prev) => ({
      ...prev,
      stops: prev.stops.map((s) => (s.id === id ? { ...s, status, type: wasteType } : s)),
    }));
    const dbStatus = status === "Issue" ? "Missed" : status;
    await driverService.updateStopStatus(id, dbStatus, wasteType);
  }

  if (!stopsData) return <Loader label="Loading stops…" />;

  const { routeName, stops } = stopsData;
  const done = stops.filter((s) => s.status !== "Pending").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Update Collection Status</h1>
        <p className="text-sm font-semibold text-primary mt-1">Route: {routeName}</p>
        <p className="text-muted-foreground mt-0.5">{done} of {stops.length} stops updated. Mark each stop as you go.</p>
      </div>

      {stops.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No stops or route assigned to you today.
        </div>
      ) : (
        <div className="grid gap-4">
          {stops.map((s) => (
            <div key={s.id || s.seq} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">Stop #{s.seq} · {s.addr}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Waste Type:</span>
                  <select
                    value={s.type || "General waste"}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setStopsData((prev) => ({
                        ...prev,
                        stops: prev.stops.map((item) => item.id === s.id ? { ...item, type: newType } : item),
                      }));
                    }}
                    className="text-xs rounded border border-input bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="General waste">General waste</option>
                    <option value="Recyclables">Recyclables</option>
                    <option value="Organic waste">Organic waste</option>
                    <option value="Hazardous waste">Hazardous waste</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`mr-2 text-xs rounded-full px-2 py-0.5 ${badge[s.status] || badge.Pending}`}>{s.status}</span>
                <button onClick={() => setStatus(s.id, "Collected", s.type)} className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-sm text-success-foreground hover:opacity-90">
                  <CheckCircle2 className="h-4 w-4" /> Collected
                </button>
                <button onClick={() => setStatus(s.id, "Issue", s.type)} className="inline-flex items-center gap-1 rounded-lg bg-warning px-3 py-1.5 text-sm text-warning-foreground hover:opacity-90">
                  <AlertCircle className="h-4 w-4" /> Issue
                </button>
                <button onClick={() => setStatus(s.id, "Missed", s.type)} className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:opacity-90">
                  <XCircle className="h-4 w-4" /> Missed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
