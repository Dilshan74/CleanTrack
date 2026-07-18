import api, { withFallback } from "./api";

/** Admin-facing data. Live API first, mock fallback for local dev. */

export function getOverview() {
  return withFallback(
    () => api.get("/admin/overview"),
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
  return withFallback(
    () => api.get("/admin/users"),
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
  return withFallback(
    () => api.get("/admin/drivers"),
    () => [
      { name: "Sam Carter", license: "DL-4471-CT", route: "Route A", truck: "TRK-07", status: "On route" },
      { name: "Lena Ford", license: "DL-2210-CT", route: "Route B", truck: "TRK-03", status: "On route" },
      { name: "Marcus Bell", license: "DL-8890-CT", route: "Route C", truck: "TRK-11", status: "Off duty" },
      { name: "Nadia Khan", license: "DL-5567-CT", route: "Route D", truck: "TRK-05", status: "On leave" },
    ],
  );
}

export function getTrucks() {
  return withFallback(
    () => api.get("/admin/trucks"),
    () => [
      { id: "TRK-03", plate: "CT-8842", capacity: "12 t", driver: "Lena Ford", status: "On route", fuel: 72 },
      { id: "TRK-05", plate: "CT-1190", capacity: "10 t", driver: "Nadia Khan", status: "Maintenance", fuel: 40 },
      { id: "TRK-07", plate: "CT-4471", capacity: "12 t", driver: "Sam Carter", status: "On route", fuel: 68 },
      { id: "TRK-11", plate: "CT-9903", capacity: "8 t", driver: "Marcus Bell", status: "Idle", fuel: 90 },
    ],
  );
}

export function getRoutes() {
  return withFallback(
    () => api.get("/admin/routes"),
    () => [
      { id: "Route A", zone: "Elm District", stops: 42, days: "Mon · Wed · Fri", driver: "Sam Carter", truck: "TRK-07" },
      { id: "Route B", zone: "Riverside", stops: 38, days: "Tue · Thu · Sat", driver: "Lena Ford", truck: "TRK-03" },
      { id: "Route C", zone: "Old Town", stops: 44, days: "Mon · Thu", driver: "Marcus Bell", truck: "TRK-11" },
      { id: "Route D", zone: "Hillcrest", stops: 36, days: "Wed · Sat", driver: "Nadia Khan", truck: "TRK-05" },
    ],
  );
}

export function getCollections() {
  return withFallback(
    () => api.get("/admin/collections"),
    () => [
      { id: "COL-9021", route: "Route A", zone: "Elm District", date: "Jul 14", tons: 9.2, status: "Completed" },
      { id: "COL-9022", route: "Route B", zone: "Riverside", date: "Jul 14", tons: 7.8, status: "Completed" },
      { id: "COL-9023", route: "Route C", zone: "Old Town", date: "Jul 15", tons: 4.1, status: "In progress" },
      { id: "COL-9024", route: "Route D", zone: "Hillcrest", date: "Jul 15", tons: 0, status: "Scheduled" },
      { id: "COL-9025", route: "Route A", zone: "Elm District", date: "Jul 16", tons: 0, status: "Scheduled" },
    ],
  );
}

export function getReports() {
  return withFallback(
    () => api.get("/admin/reports"),
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
  return withFallback(
    () => api.get("/admin/notifications"),
    () => [
      { id: 1, title: "High-priority complaint", body: "3 new complaints flagged in Zone C.", time: "15m ago", unread: true, tone: "destructive" },
      { id: 2, title: "Truck maintenance", body: "TRK-05 flagged for service (fuel system).", time: "2h ago", unread: true, tone: "warning" },
      { id: 3, title: "New registrations", body: "128 residents registered this week.", time: "1d ago", unread: false, tone: "primary" },
      { id: 4, title: "Recycling target met", body: "Monthly recycling target reached (37%).", time: "3d ago", unread: false, tone: "success" },
    ],
  );
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
};
