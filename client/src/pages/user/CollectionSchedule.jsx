import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";
import Modal from "../../components/common/Modal";
import LiveTrackingMap from "./LiveTrackingMap";
import { LocateFixed } from "lucide-react";

function StatusBadge({ status }) {
  const tone =
    status === "Completed"
      ? "bg-muted text-muted-foreground"
      : "bg-success/15 text-success";
  return <span className={`text-xs rounded-full px-2 py-0.5 ${tone}`}>{status}</span>;
}

export default function CollectionSchedule() {
  const [rows, setRows] = useState(null);
  const [trackingDriver, setTrackingDriver] = useState(null);

  useEffect(() => {
    userService.getSchedule().then(data => setRows(data.scheduleItems || []));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Collection Schedule</h1>
        <p className="text-muted-foreground">Your pickup calendar for the next two weeks.</p>
      </div>

      {!rows ? (
        <Loader label="Loading schedule…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                      No collections scheduled for your area yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3 font-medium">{r.routeName || "—"}</td>
                      <td className="px-4 py-3">{r.date}</td>
                      <td className="px-4 py-3">{r.time}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {r.driverId && r.collectionStatus !== "Completed" && (
                          <button
                            onClick={() => setTrackingDriver({
                              routeId:        r.id,
                              driverId:       r.driverId,
                              driverName:     r.driverName,
                              truckPlate:     r.truckPlate,
                              status:         r.collectionStatus,
                              postalCode:     r.postalCode,
                              routeName:      r.routeName,
                              collectionTime: r.time,
                            })}
                            className="inline-flex items-center gap-1.5 rounded-lg border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                          >
                            <LocateFixed className="h-3 w-3" /> Track Truck
                          </button>
                        )}
                        {r.collectionStatus === "Completed" && (
                           <span className="text-xs text-muted-foreground">Today's collection completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Legend</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-chart-1" /> Recyclables</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-chart-2" /> Organic waste</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-chart-3" /> General waste</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-chart-5" /> Bulk pickup</li>
            </ul>
            <div className="mt-6 rounded-lg bg-muted p-3 text-sm">
              <div className="font-medium">Tip</div>
              <p className="text-muted-foreground">Place bins by 7:00 AM on collection day.</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      <Modal 
        isOpen={!!trackingDriver} 
        onClose={() => setTrackingDriver(null)} 
        title=""
        maxWidth="max-w-5xl"
        noPadding
      >
        {trackingDriver && (
          <LiveTrackingMap 
            routeId={trackingDriver.routeId}
            driverId={trackingDriver.driverId}
            driverName={trackingDriver.driverName}
            truckPlate={trackingDriver.truckPlate}
            collectionStatus={trackingDriver.status}
            postalCode={trackingDriver.postalCode}
            routeName={trackingDriver.routeName}
            collectionTime={trackingDriver.collectionTime}
            onClose={() => setTrackingDriver(null)}
          />
        )}
      </Modal>
    </div>
  );
}
