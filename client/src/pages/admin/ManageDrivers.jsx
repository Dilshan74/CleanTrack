import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

const tone = {
  "On route": "bg-success/15 text-success",
  "Off duty": "bg-muted text-muted-foreground",
  "On leave": "bg-warning/20 text-warning-foreground",
};

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState(null);

  useEffect(() => {
    adminService.getDrivers().then(setDrivers);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Drivers</h1>
          <p className="text-muted-foreground">24 active drivers across 4 zones.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add driver
        </button>
      </div>

      {!drivers ? (
        <Loader label="Loading drivers…" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">License</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Truck</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.license} className="border-t">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.license}</td>
                  <td className="px-4 py-3">{d.route}</td>
                  <td className="px-4 py-3">{d.truck}</td>
                  <td className="px-4 py-3"><span className={`text-xs rounded-full px-2 py-0.5 ${tone[d.status] || tone["Off duty"]}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-right"><button className="text-sm text-primary">Assign</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
