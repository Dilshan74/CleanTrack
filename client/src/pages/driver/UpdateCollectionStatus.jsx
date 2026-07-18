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
  const [stops, setStops] = useState(null);

  useEffect(() => {
    driverService.getStops().then(setStops);
  }, []);

  async function setStatus(seq, status) {
    setStops((prev) => prev.map((s) => (s.seq === seq ? { ...s, status } : s)));
    await driverService.updateStopStatus(seq, status);
  }

  if (!stops) return <Loader label="Loading stops…" />;

  const done = stops.filter((s) => s.status !== "Pending").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Update Collection Status</h1>
        <p className="text-muted-foreground">{done} of {stops.length} stops updated. Mark each stop as you go.</p>
      </div>

      <div className="grid gap-4">
        {stops.map((s) => (
          <div key={s.seq} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">Stop #{s.seq} · {s.addr}</div>
              <div className="text-sm text-muted-foreground">{s.type} · ETA {s.eta}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`mr-2 text-xs rounded-full px-2 py-0.5 ${badge[s.status] || badge.Pending}`}>{s.status}</span>
              <button onClick={() => setStatus(s.seq, "Collected")} className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-sm text-success-foreground hover:opacity-90">
                <CheckCircle2 className="h-4 w-4" /> Collected
              </button>
              <button onClick={() => setStatus(s.seq, "Issue")} className="inline-flex items-center gap-1 rounded-lg bg-warning px-3 py-1.5 text-sm text-warning-foreground hover:opacity-90">
                <AlertCircle className="h-4 w-4" /> Issue
              </button>
              <button onClick={() => setStatus(s.seq, "Missed")} className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:opacity-90">
                <XCircle className="h-4 w-4" /> Missed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
