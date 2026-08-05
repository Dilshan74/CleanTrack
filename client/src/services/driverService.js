import api, { withFallback } from "./api";
import { delay } from "../utils/helpers";

/** Driver-facing data. Live API first, mock fallback for local dev. */

async function tryLive(request, fallback) {
  try {
    return await request();
  } catch (err) {
    console.warn("[driverService] API failed, using mock:", err?.response?.status, err?.response?.data?.message || err?.message);
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

export function getDashboard() {
  return tryLive(
    async () => {
      const { data } = await api.get("/driver/dashboard");
      // Server returns { success, truck, route, stopsToday, completed, ... } directly
      return data;
    },
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
  return tryLive(
    async () => {
      const { data } = await api.get("/driver/schedule");
      // Server returns { success, route } where route.areas is the stop list
      const areas = data.route?.areas || [];
      return areas.map((a, i) => ({
        id: a._id,
        seq: i + 1,
        addr: a.areaName || `Stop ${i + 1}`,
        type: a.wasteType || "General waste",
        eta: data.route?.collectionTime || "N/A",
        status: a.status || "Pending",
      }));
    },
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
  return tryLive(
    async () => {
      const { data } = await api.get("/driver/schedule");
      const areas = data.route?.areas || [];
      return {
        routeName: data.route?.routeName || "No route assigned",
        stops: areas.map((a, i) => ({
          id: a._id,
          seq: i + 1,
          addr: a.areaName || `Stop ${i + 1}`,
          type: a.wasteType || "General waste",
          status: a.status || "Pending",
        })),
      };
    },
    () => ({ routeName: "", stops: [] }),
  );
}

export async function updateStopStatus(id, status, wasteType) {
  try {
    // Server expects PUT /driver/update-status/:id
    const { data } = await api.put(`/driver/update-status/${id}`, { status, wasteType });
    return data;
  } catch {
    await delay(150);
    return { id, status, wasteType };
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
  return tryLive(
    async () => {
      const { data } = await api.get("/driver/notifications");
      return (data.notifications || []).map((n) => ({
        id: n._id,
        title: n.title || "Notification",
        body: n.message || "",
        time: n.createdAt
          ? new Date(n.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "—",
        unread: !n.isRead,
        tone: "primary",
      }));
    },
    () => [
      { id: 1, title: "Route update", body: "Route A has 2 new stops added.", time: "1h ago", unread: true, tone: "primary" },
      { id: 2, title: "Traffic alert", body: "Heavy traffic reported near Elm District.", time: "3h ago", unread: true, tone: "warning" },
      { id: 3, title: "Maintenance due", body: "Truck TRK-07 is due for oil change tomorrow.", time: "1d ago", unread: false, tone: "muted" },
    ]
  );
}

export function getProfile() {
  return tryLive(
    async () => {
      const { data } = await api.get("/driver/profile");
      // Server returns { success, driver: { name, email, phone, licenseNumber, vehicleNumber, assignedRoute, ... } }
      const d = data.driver || data;
      return {
        name: d.name || "—",
        email: d.email,
        phone: d.phone,
        license: d.licenseNumber || "—",
        truck: d.vehicleNumber?.plateNumber || d.vehicleNumber || "Unassigned",
        route: d.assignedRoute?.routeName || d.assignedRoute || "Unassigned",
        shift: "N/A",
      };
    },
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
