import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Clock, Truck } from "lucide-react";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import driverService from "../../services/driverService";

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

export default function DriverDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const firstName = (user?.name || "Driver").split(" ")[0];

  useEffect(() => {
    driverService.getDashboard().then(setData);
  }, []);

  if (!data) return <Loader label="Loading dashboard…" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Good morning, {firstName}</h1>
        <p className="text-muted-foreground">Truck {data.truck} · {data.route}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat icon={MapPin} label="Stops today" value={data.stopsToday} hint={`${data.stopsToday - data.completed} remaining`} />
        <Stat icon={CheckCircle2} label="Completed" value={data.completed} hint="On track" tone="success" />
        <Stat icon={Clock} label="ETA next stop" value={data.etaNext} hint="Maple Ave" tone="warning" />
        <Stat icon={Truck} label="Truck" value={data.truck} hint={`Fuel ${data.fuel}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Route progress</h2>
          <div className="h-3 rounded-full bg-muted overflow-hidden mb-6">
            <div className="h-full bg-primary" style={{ width: `${data.progress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted p-3"><div className="text-2xl font-bold">{data.progress}%</div><div className="text-xs text-muted-foreground">Complete</div></div>
            <div className="rounded-lg bg-muted p-3"><div className="text-2xl font-bold">{data.remainingKm}</div><div className="text-xs text-muted-foreground">Remaining</div></div>
            <div className="rounded-lg bg-muted p-3"><div className="text-2xl font-bold">{data.etaFinish}</div><div className="text-xs text-muted-foreground">ETA finish</div></div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Announcements</h2>
          <ul className="space-y-3 text-sm">
            {data.announcements.map((a) => (
              <li key={a} className="rounded-lg bg-muted p-3">{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
