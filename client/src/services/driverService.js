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
      route: "Route A · Colombo Central",
      stopsToday: 42,
      completed: 28,
      etaNext: "6 min",
      nextStopName: "Galle Road",
      etaFinish: "1:45 PM",
      fuel: 68,
      progress: 67,
      remainingKm: "5.2 km",
      announcements: [
        "Road closure on 5th St — use detours.",
        "New bulk pickup added.",
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
        lat: a.lat || 6.9271 + (i + 1) * 0.0015,
        lng: a.lng || 79.8612 + (i + 1) * 0.0012,
      }));
    },
    () => [
      { seq: 1, addr: "12 Oak St", type: "Recyclables", eta: "7:30 AM", status: "Collected", lat: 6.9286, lng: 79.8624 },
      { seq: 2, addr: "24 Oak St", type: "General waste", eta: "7:38 AM", status: "Collected", lat: 6.9301, lng: 79.8636 },
      { seq: 3, addr: "8 Maple Ave", type: "Organic waste", eta: "7:52 AM", status: "Pending", lat: 6.9316, lng: 79.8648 },
      { seq: 4, addr: "42 Maple Ave", type: "Recyclables", eta: "8:05 AM", status: "Pending", lat: 6.9331, lng: 79.8660 },
      { seq: 5, addr: "17 Birch Rd", type: "General waste", eta: "8:20 AM", status: "Pending", lat: 6.9346, lng: 79.8672 },
      { seq: 6, addr: "38 Birch Rd", type: "Bulk pickup", eta: "8:35 AM", status: "Pending", lat: 6.9361, lng: 79.8684 },
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
        collectionStatus: data.route?.collectionStatus,
        days: data.route?.collectionTime || "",
        stops: areas.map((a, i) => ({
          id: a._id,
          seq: i + 1,
          addr: a.areaName || `Stop ${i + 1}`,
          type: a.wasteType || "General waste",
          status: a.status || "Pending",
          lat: a.lat || 6.9271 + (i + 1) * 0.0015,
          lng: a.lng || 79.8612 + (i + 1) * 0.0012,
        })),
      };
    },
    () => ({
      routeName: "Route A · Colombo Central",
      days: "Mon, Wed, Fri",
      stops: [
        { id: "s1", seq: 1, addr: "12 Oak St", type: "Recyclables", status: "Collected", lat: 6.9286, lng: 79.8624 },
        { id: "s2", seq: 2, addr: "24 Oak St", type: "General waste", status: "Collected", lat: 6.9301, lng: 79.8636 },
        { id: "s3", seq: 3, addr: "8 Maple Ave", type: "Organic waste", status: "Pending", lat: 6.9316, lng: 79.8648 },
        { id: "s4", seq: 4, addr: "42 Maple Ave", type: "Recyclables", status: "Pending", lat: 6.9331, lng: 79.8660 },
        { id: "s5", seq: 5, addr: "17 Birch Rd", type: "General waste", status: "Pending", lat: 6.9346, lng: 79.8672 },
        { id: "s6", seq: 6, addr: "38 Birch Rd", type: "Bulk pickup", status: "Pending", lat: 6.9361, lng: 79.8684 },
      ],
    }),
  );
}

export function getRoute() {
  return tryLive(
    async () => {
      const { data } = await api.get("/driver/schedule");
      return { route: data.route };
    },
    () => ({ route: { _id: "mock1", postalCode: "MockRoute1" } })
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
        date: n.createdAt
          ? new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "",
        unread: !n.isRead,
        type: n.notificationType || "System",
        tone: n.tone || (
          n.notificationType === "Route"   ? "warning"
          : n.notificationType === "Request" ? "primary"
          : "primary"
        ),
      }));
    },
    () => [
      { id: 1, title: "Route assigned",    body: "You are assigned to Route.", time: "Today", date: "Today", unread: false, type: "Route",  tone: "primary" },
      { id: 2, title: "Collection schedule", body: "Collection schedule updated.", time: "Today", date: "Today", unread: false, type: "Route",  tone: "primary" },
      { id: 3, title: "Truck assigned",    body: "Your truck status: Active.",     time: "Today", date: "Today", unread: false, type: "System", tone: "primary" },
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
        preferences: d.preferences || { shareLocation: true, routeAlerts: true, autoStatusSync: false }
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
      preferences: { shareLocation: true, routeAlerts: true, autoStatusSync: false }
    }),
  );
}

export async function updatePreferences(preferences) {
  try {
    const { data } = await api.put("/driver/preferences", { preferences });
    return data;
  } catch (err) {
    console.error("Failed to update preferences:", err);
    throw err;
  }
}

export async function startCollection(routeId) {
  const { data } = await api.put(`/driver/start-collection/${routeId}`);
  return data;
}

export async function endCollection(routeId) {
  const { data } = await api.put(`/driver/complete-area/${routeId}`);
  return data;
}

export default {
  getDashboard,
  getTodaysSchedule,
  getStops,
  getRoute,
  updateStopStatus,
  getHistory,
  getNotifications,
  getProfile,
  updatePreferences,
  startCollection,
  endCollection,
};
