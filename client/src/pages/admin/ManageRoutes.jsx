import { useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

export default function ManageRoutes() {
  const [routes, setRoutes] = useState(null);

  useEffect(() => {
    adminService.getRoutes().then(setRoutes);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Routes</h1>
          <p className="text-muted-foreground">4 active routes covering 4 zones.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New route
        </button>
      </div>

      {!routes ? (
        <Loader label="Loading routes…" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routes.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{r.id}</div>
                    <div className="text-xs text-muted-foreground">{r.zone}</div>
                  </div>
                </div>
                <button className="text-sm text-primary">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Stops</div><div className="font-medium">{r.stops}</div></div>
                <div><div className="text-xs text-muted-foreground">Days</div><div className="font-medium">{r.days}</div></div>
                <div><div className="text-xs text-muted-foreground">Driver</div><div className="font-medium">{r.driver}</div></div>
                <div><div className="text-xs text-muted-foreground">Truck</div><div className="font-medium">{r.truck}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
