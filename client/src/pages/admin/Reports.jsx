import { useEffect, useState } from "react";
import { Recycle, Truck, Clock, TrendingUp, Download } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

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
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getReports().then(setData);
  }, []);

  if (!data) return <Loader label="Loading reports…" />;

  const maxVol = Math.max(...data.monthlyVolume);
  const maxCat = Math.max(...data.complaintCategories.map((c) => c.v));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Performance and sustainability metrics.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat icon={Truck} label="Waste collected" value={data.wasteCollected} hint="This month" />
        <Stat icon={Recycle} label="Recycled" value={data.recycled} hint="37% recycling rate" tone="success" />
        <Stat icon={Clock} label="Avg. delay" value={data.avgDelay} hint="-18% vs last month" tone="success" />
        <Stat icon={TrendingUp} label="Growth" value={data.growth} hint="Coverage vs last quarter" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Monthly volume (tons)</h2>
          <div className="flex items-end gap-1.5 h-56">
            {data.monthlyVolume.map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${(v / maxVol) * 100}%` }} title={`${v} t`} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Complaint categories</h2>
          <div className="space-y-4">
            {data.complaintCategories.map((c) => (
              <div key={c.l}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{c.l}</span>
                  <span className="text-muted-foreground">{c.v}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-chart-3" style={{ width: `${(c.v / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
