import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import driverService from "../../services/driverService";

const tone = {
  Done: "bg-success/15 text-success",
  "In progress": "bg-warning/20 text-warning-foreground",
  Pending: "bg-muted text-muted-foreground",
};

export default function TodaysSchedule() {
  const [stops, setStops] = useState(null);

  useEffect(() => {
    driverService.getTodaysSchedule().then(setStops);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Today&apos;s Schedule</h1>
        <p className="text-muted-foreground">Route A · Elm District · ordered by stop sequence.</p>
      </div>

      {!stops ? (
        <Loader label="Loading schedule…" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Waste type</th>
                <th className="px-4 py-3 font-medium">ETA</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s) => (
                <tr key={s.seq} className="border-t">
                  <td className="px-4 py-3 font-medium">{s.seq}</td>
                  <td className="px-4 py-3">{s.addr}</td>
                  <td className="px-4 py-3">{s.type}</td>
                  <td className="px-4 py-3">{s.eta}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${tone[s.status] || tone.Pending}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
