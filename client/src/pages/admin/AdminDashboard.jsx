import { useEffect, useState } from "react";
import { Users, Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

function Stat({ icon: Icon, label, value, hint, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value.toLocaleString?.() ?? value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

const healthColor = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getOverview().then(setData);
  }, []);

  if (!data) return <Loader label="Loading overview…" />;

  const max = Math.max(...data.weeklyVolume);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Operations overview</h1>
        <p className="text-muted-foreground">System-wide performance and open items.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat icon={Users} label="Active users" value={data.activeUsers} hint="+128 this week" />
        <Stat icon={Truck} label="Trucks on route" value={data.trucksOnRoute} hint="6 in depot" />
        <Stat icon={CheckCircle2} label="Pickups today" value={data.pickupsToday} hint="98% on time" tone="success" />
        <Stat icon={AlertTriangle} label="Open complaints" value={data.openComplaints} hint="7 high priority" tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Weekly pickup volume</h2>
          <div className="flex items-end gap-3 h-48">
            {data.weeklyVolume.map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${(v / max) * 100}%` }} title={`${v}`} />
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            {dayLabels.map((d, i) => (
              <span key={i} className="flex-1 text-center text-xs text-muted-foreground">{d}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Route health</h2>
          <div className="space-y-4">
            {data.routeHealth.map((r) => (
              <div key={r.r}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{r.r}</span>
                  <span className="text-muted-foreground">{r.p}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${healthColor[r.t] || "bg-primary"}`} style={{ width: `${r.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
