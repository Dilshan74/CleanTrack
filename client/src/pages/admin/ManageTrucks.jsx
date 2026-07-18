import { useEffect, useState } from "react";
import { Plus, Fuel } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

const tone = {
  "On route": "bg-success/15 text-success",
  Idle: "bg-muted text-muted-foreground",
  Maintenance: "bg-warning/20 text-warning-foreground",
};

export default function ManageTrucks() {
  const [trucks, setTrucks] = useState(null);

  useEffect(() => {
    adminService.getTrucks().then(setTrucks);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Trucks</h1>
          <p className="text-muted-foreground">Fleet status and fuel levels.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add truck
        </button>
      </div>

      {!trucks ? (
        <Loader label="Loading trucks…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trucks.map((t) => (
            <div key={t.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">{t.id}</div>
                <span className={`text-xs rounded-full px-2 py-0.5 ${tone[t.status] || tone.Idle}`}>{t.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Plate</div><div className="font-medium">{t.plate}</div></div>
                <div><div className="text-xs text-muted-foreground">Capacity</div><div className="font-medium">{t.capacity}</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Driver</div><div className="font-medium">{t.driver}</div></div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-muted-foreground"><Fuel className="h-3.5 w-3.5" /> Fuel</span>
                  <span>{t.fuel}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${t.fuel < 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${t.fuel}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
