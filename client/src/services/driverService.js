import api, { withFallback } from "./api";
import { delay } from "../utils/helpers";

/** Driver-facing data. Live API first, mock fallback for local dev. */

export function getDashboard() {
  return withFallback(
    () => api.get("/driver/dashboard"),
    () => ({
      truck: "TRK-07",
      route: "Route A · Elm District",
      stopsToday: 42,
      completed: 28,
      etaNext: "6 min",
      etaFinish: "1:45 PM",
      fuel: 68,
      progress: 67,
      remainingKm: "5.2 km",
      announcements: [
        "Road closure on 5th St — use Oak Ave detour.",
        "New bulk pickup added to stop #38.",
        "Depot check-in by 2:30 PM.",
      ],
    }),
  );
}

export function getTodaysSchedule() {
  return withFallback(
    () => api.get("/driver/schedule"),
    () => [
      { seq: 1, addr: "12 Oak St", type: "Recyclables", eta: "7:30 AM", status: "Done" },
      { seq: 2, addr: "24 Oak St", type: "General waste", eta: "7:38 AM", status: "Done" },
      { seq: 3, addr: "8 Maple Ave", type: "Organic waste", eta: "7:52 AM", status: "Done" },
      { seq: 4, addr: "42 Maple Ave", type: "Recyclables", eta: "8:05 AM", status: "In progress" },
      { seq: 5, addr: "17 Birch Rd", type: "General waste", eta: "8:20 AM", status: "Pending" },
      { seq: 6, addr: "38 Birch Rd", type: "Bulk pickup", eta: "8:35 AM", status: "Pending" },
    ],
  );
}

export function getStops() {
  return withFallback(
    () => api.get("/driver/stops"),
    () => [
      { seq: 1, addr: "12 Oak St", type: "Recyclables", eta: "7:30 AM", status: "Collected" },
      { seq: 2, addr: "24 Oak St", type: "General waste", eta: "7:38 AM", status: "Collected" },
      { seq: 3, addr: "8 Maple Ave", type: "Organic waste", eta: "7:52 AM", status: "Issue" },
      { seq: 4, addr: "42 Maple Ave", type: "Recyclables", eta: "8:05 AM", status: "Pending" },
      { seq: 5, addr: "17 Birch Rd", type: "General waste", eta: "8:20 AM", status: "Pending" },
      { seq: 6, addr: "38 Birch Rd", type: "Bulk pickup", eta: "8:35 AM", status: "Pending" },
    ],
  );
}

export async function updateStopStatus(seq, status) {
  try {
    const { data } = await api.patch(`/driver/stops/${seq}`, { status });
    return data;
  } catch {
    await delay(150);
    return { seq, status };
  }
}

export function getHistory() {
  return withFallback(
    () => api.get("/driver/history"),
    () => [
      { date: "Jul 14", route: "Route A", stops: 41, done: 41, missed: 0, duration: "5h 40m" },
      { date: "Jul 13", route: "Route A", stops: 40, done: 39, missed: 1, duration: "5h 55m" },
      { date: "Jul 12", route: "Route C", stops: 44, done: 44, missed: 0, duration: "6h 05m" },
      { date: "Jul 11", route: "Route A", stops: 42, done: 40, missed: 2, duration: "6h 20m" },
      { date: "Jul 10", route: "Route B", stops: 38, done: 38, missed: 0, duration: "5h 30m" },
    ],
  );
}

export function getNotifications() {
  return withFallback(
    () => api.get("/driver/notifications"),
    () => [
      { id: 1, title: "Route update", body: "Stop #38 added: bulk pickup on Birch Rd.", time: "20m ago", unread: true, tone: "primary" },
      { id: 2, title: "Road closure", body: "5th St closed — use Oak Ave detour.", time: "1h ago", unread: true, tone: "warning" },
      { id: 3, title: "Maintenance", body: "TRK-07 scheduled for service Friday.", time: "1d ago", unread: false, tone: "muted" },
    ],
  );
}

export function getProfile() {
  return withFallback(
    () => api.get("/driver/profile"),
    () => ({
      name: "Sam Carter",
      email: "sam.driver@example.com",
      phone: "+1 (555) 776-1180",
      license: "DL-4471-CT",
      truck: "TRK-07",
      route: "Route A",
      shift: "Morning · 6 AM–2 PM",
    }),
  );
}

export default {
  getDashboard,
  getTodaysSchedule,
  getStops,
  updateStopStatus,
  getHistory,
  getNotifications,
  getProfile,
};
