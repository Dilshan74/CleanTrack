import api from "./api";

/** Admin-facing data. Live API first, mock fallback for local dev. */

async function tryLive(request, fallback) {
  try {
    const result = await request();
    return result;
  } catch (err) {
    console.warn("[adminService] API failed, using mock:", err?.response?.status, err?.response?.data?.message || err?.message);
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

export function getOverview() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/overview");
      return data;
    },
    () => ({
      activeUsers: 4218,
      trucksOnRoute: 18,
      pickupsToday: 1240,
      openComplaints: 23,
      weeklyVolume: [62, 74, 58, 81, 90, 40, 30],
      routeHealth: [
        { r: "Route A", p: 92, t: "success" },
        { r: "Route B", p: 68, t: "warning" },
        { r: "Route C", p: 41, t: "destructive" },
        { r: "Route D", p: 85, t: "success" },
      ],
    }),
  );
}

export function getUsers() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/users");
      return (data.users || []).map((u) => ({
        _id: u._id,
        name: u.fullName || u.name || "—",
        email: u.email,
        zone: u.address || "—",
        status: u.isActive !== false ? "Active" : "Suspended",
      }));
    },
    () => [
      { name: "Alex Rivera", email: "alex@example.com", zone: "Zone A", status: "Active" },
      { name: "Jordan Lee", email: "jordan@example.com", zone: "Zone B", status: "Active" },
      { name: "Priya Nair", email: "priya@example.com", zone: "Zone A", status: "Suspended" },
      { name: "Diego Santos", email: "diego@example.com", zone: "Zone C", status: "Active" },
      { name: "Mei Chen", email: "mei@example.com", zone: "Zone D", status: "Active" },
      { name: "Omar Farouk", email: "omar@example.com", zone: "Zone B", status: "Active" },
    ],
  );
}

export function getDrivers() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/drivers");
      return (data.data || []).map((d) => ({
        _id: d._id,
        name: d.name || "—",
        license: d.licenseNumber || "—",
        route: d.assignedRoute?.routeName || "Unassigned",
        truck: d.vehicleNumber?.plateNumber || "Unassigned",
        status: d.status || "Available",
      }));
    },
    () => [
      { name: "Sam Carter", license: "DL-4471-CT", route: "Route A", truck: "TRK-07", status: "On route" },
      { name: "Lena Ford", license: "DL-2210-CT", route: "Route B", truck: "TRK-03", status: "On route" },
      { name: "Marcus Bell", license: "DL-8890-CT", route: "Route C", truck: "TRK-11", status: "Off duty" },
      { name: "Nadia Khan", license: "DL-5567-CT", route: "Route D", truck: "TRK-05", status: "On leave" },
    ],
  );
}

export function getTrucks() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/trucks");
      return (data.trucks || []).map((t) => ({
        _id: t._id,
        id: t.plateNumber || t._id,
        plate: t.plateNumber || "—",
        capacity: t.capacity ? `${t.capacity} t` : "—",
        driver: t.assignedDriver?.name || "Unassigned",
        status: t.status || "Idle",
        fuel: 0,
      }));
    },
    () => [
      { id: "TRK-03", plate: "CT-8842", capacity: "12 t", driver: "Lena Ford", status: "On route", fuel: 72 },
      { id: "TRK-05", plate: "CT-1190", capacity: "10 t", driver: "Nadia Khan", status: "Maintenance", fuel: 40 },
      { id: "TRK-07", plate: "CT-4471", capacity: "12 t", driver: "Sam Carter", status: "On route", fuel: 68 },
      { id: "TRK-11", plate: "CT-9903", capacity: "8 t", driver: "Marcus Bell", status: "Idle", fuel: 90 },
    ],
  );
}

export function getRoutes() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/routes");
      return (data.routes || []).map((r) => {
        const primaryArea = r.areas?.[0] || {};
        const zoneLabel = primaryArea.municipalCouncil
          ? `${primaryArea.municipalCouncil}, ${primaryArea.district}`
          : r.areas?.map((a) => a.areaName).join(", ") || "—";

        return {
          _id: r._id,
          id: r.routeName || r._id,
          zone: zoneLabel,
          stops: r.areas?.length || 0,
          days: r.collectionTime || "—",
          postalCode: r.postalCode || "",
          driver: r.assignedDriver?.name || "Unassigned",
          truck: r.assignedDriver?.vehicleNumber?.plateNumber || "—",
        };
      });
    },
    () => [
      { id: "Route A", zone: "Elm District", stops: 42, days: "Mon · Wed · Fri", driver: "Sam Carter", truck: "TRK-07" },
      { id: "Route B", zone: "Riverside", stops: 38, days: "Tue · Thu · Sat", driver: "Lena Ford", truck: "TRK-03" },
      { id: "Route C", zone: "Old Town", stops: 44, days: "Mon · Thu", driver: "Marcus Bell", truck: "TRK-11" },
      { id: "Route D", zone: "Hillcrest", stops: 36, days: "Wed · Sat", driver: "Nadia Khan", truck: "TRK-05" },
    ],
  );
}

export function getCollections() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/collections");
       const historyItems = (data.history || []).map((h) => ({
        id: h._id,
        driver: h.driver?.name || "—",
        route: h.route?.routeName || "—",
        zone: "—",
        date: h.createdAt
          ? new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "—",
        postalCode: h.postalCode || "—",
        status: "Completed",
      }));
      const routeItems = (data.routes || []).map((r) => {
        let status = "Scheduled";
        const total = r.areas?.length || 0;
        const missedCount = r.areas?.filter((a) => a.status === "Missed").length || 0;
        const completedCount = r.areas?.filter((a) => a.status === "Collected" || a.status === "Missed").length || 0;
        
        if (r.status === "Completed" || (total > 0 && completedCount === total)) {
          status = missedCount > 0 ? "Missed" : "Completed";
        } else if (completedCount > 0) {
          status = "In progress";
        }
        
        let displayDate = "Scheduled";
        if (r.collectionTime) {
          const rawDate = r.collectionTime.split(" ")[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const [y, m, d] = rawDate.split("-");
            displayDate = `${d}/${m}/${y}`;
          } else {
            displayDate = rawDate;
          }
        }

        return {
          id: r._id,
          driver: r.assignedDriver?.name || "Unassigned",
          driverId: r.assignedDriver?._id || "",
          truck: r.assignedTruck?.plateNumber || "Unassigned",
          truckId: r.assignedTruck?._id || "",
          collectionStatus: r.collectionStatus || "Pending",
          route: r.routeName || "—",
          zone: r.areas?.map((a) => a.areaName).join(", ") || "—",
          postalCode: r.postalCode || "—",
          date: displayDate,
          fullTime: r.collectionTime,
          status,
          isRoute: true,
        };
      });
      return [...historyItems, ...routeItems].slice(0, 20);
    },
    () => [
      { id: "COL-9021", route: "Route A", zone: "Elm District", date: "Jul 14", status: "Completed" },
      { id: "COL-9022", route: "Route B", zone: "Riverside", date: "Jul 14", status: "Completed" },
      { id: "COL-9023", route: "Route C", zone: "Old Town", date: "Jul 15", status: "In progress", isRoute: true },
      { id: "COL-9024", route: "Route D", zone: "Hillcrest", date: "Jul 15", status: "Scheduled", isRoute: true },
      { id: "COL-9025", route: "Route A", zone: "Elm District", date: "Jul 16", status: "Scheduled", isRoute: true },
    ],
  );
}

export function getReports() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/reports");
      return data;
    },
    () => ({
      wasteCollected: "1,284 t",
      recycled: "472 t",
      avgDelay: "6 min",
      growth: "+12%",
      monthlyVolume: [240, 265, 250, 290, 310, 305, 330, 320, 350, 360, 340, 380],
      complaintCategories: [
        { l: "Missed pickup", v: 38 },
        { l: "Overflowing bin", v: 24 },
        { l: "Damaged bin", v: 18 },
        { l: "Driver behavior", v: 9 },
        { l: "Other", v: 11 },
      ],
    }),
  );
}

export function getNotifications() {
  return tryLive(
    async () => {
      const { data } = await api.get("/admin/notifications");
      return (data.notifications || []).map((n) => ({
        id: n._id,
        title: n.title || "Notification",
        body: n.message || "",
        time: n.createdAt
          ? new Date(n.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "—",
        unread: !n.isRead,
        tone:
          n.notificationType === "Route"
            ? "warning"
            : n.notificationType === "Request"
            ? "primary"
            : "primary",
      }));
    },
    () => [
      { id: 1, title: "High-priority complaint", body: "3 new complaints flagged in Zone C.", time: "15m ago", unread: true, tone: "destructive" },
      { id: 2, title: "Truck maintenance", body: "TRK-05 flagged for service (fuel system).", time: "2h ago", unread: true, tone: "warning" },
      { id: 3, title: "New registrations", body: "128 residents registered this week.", time: "1d ago", unread: false, tone: "primary" },
      { id: 4, title: "Recycling target met", body: "Monthly recycling target reached (37%).", time: "3d ago", unread: false, tone: "success" },
    ],
  );
}

export async function addUser(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
}

export async function addDriver(payload) {
  const { data } = await api.post("/admin/drivers", payload);
  return data;
}

export async function deleteDriver(id) {
  const { data } = await api.delete(`/admin/drivers/${id}`);
  return data;
}

export async function assignDriver(id, payload) {
  const { data } = await api.put(`/admin/drivers/assign/${id}`, payload);
  return data;
}

export async function addTruck(payload) {
  const { data } = await api.post("/admin/trucks", payload);
  return data;
}

export async function deleteTruck(id) {
  const { data } = await api.delete(`/admin/trucks/${id}`);
  return data;
}

export async function addRoute(payload) {
  const { data } = await api.post("/admin/routes", payload);
  return data;
}

export async function updateRoute(id, payload) {
  const { data } = await api.put(`/admin/routes/${id}`, payload);
  return data;
}

export async function deleteRoute(id) {
  const { data } = await api.delete(`/admin/routes/${id}`);
  return data;
}

export default {
  getOverview,
  getUsers,
  getDrivers,
  getTrucks,
  getRoutes,
  getCollections,
  getReports,
  getNotifications,
  addUser,
  deleteUser,
  addDriver,
  deleteDriver,
  assignDriver,
  addTruck,
  deleteTruck,
  addRoute,
  updateRoute,
  deleteRoute,
};
