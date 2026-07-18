import api, { withFallback } from "./api";
import { delay, makeRef } from "../utils/helpers";

/** Resident-facing data. Live API first, mock fallback for local dev. */

export function getDashboard() {
  return withFallback(
    () => api.get("/user/dashboard"),
    () => ({
      nextPickup: { when: "Tomorrow", time: "7:30 AM", type: "Recyclables" },
      monthlyPickups: 8,
      recycledKg: 42,
      openComplaints: 1,
      upcoming: [
        { id: 1, type: "Recyclables", date: "Wed, Jul 15", time: "7:30 AM", status: "Scheduled" },
        { id: 2, type: "Organic waste", date: "Fri, Jul 17", time: "8:00 AM", status: "Scheduled" },
        { id: 3, type: "General waste", date: "Mon, Jul 20", time: "7:30 AM", status: "Scheduled" },
      ],
      alerts: [
        "Route B truck delayed by 15 min.",
        "Bulk pickup available next Sat.",
        "Your complaint #C-204 is being reviewed.",
      ],
    }),
  );
}

export function getSchedule() {
  return withFallback(
    () => api.get("/user/schedule"),
    () => [
      { date: "Mon, Jul 14", time: "7:30 AM", type: "General waste", status: "Completed" },
      { date: "Wed, Jul 16", time: "7:30 AM", type: "Recyclables", status: "Scheduled" },
      { date: "Fri, Jul 18", time: "8:00 AM", type: "Organic waste", status: "Scheduled" },
      { date: "Mon, Jul 21", time: "7:30 AM", type: "General waste", status: "Scheduled" },
      { date: "Wed, Jul 23", time: "7:30 AM", type: "Recyclables", status: "Scheduled" },
      { date: "Sat, Jul 26", time: "9:00 AM", type: "Bulk pickup", status: "Scheduled" },
    ],
  );
}

export function getComplaints() {
  return withFallback(
    () => api.get("/user/complaints"),
    () => [
      { id: "C-204", summary: "Missed recycling pickup on Maple Ave.", status: "Reviewing" },
      { id: "C-198", summary: "Overflowing bin near park entrance.", status: "Resolved" },
      { id: "C-187", summary: "Damaged bin lid, needs replacement.", status: "Resolved" },
    ],
  );
}

export async function submitComplaint(payload) {
  try {
    const { data } = await api.post("/user/complaints", payload);
    return data;
  } catch {
    await delay();
    return { id: makeRef("C"), ...payload, status: "Reviewing" };
  }
}

export function getNotifications() {
  return withFallback(
    () => api.get("/user/notifications"),
    () => [
      { id: 1, title: "Pickup reminder", body: "Recyclables collected tomorrow at 7:30 AM.", time: "2h ago", unread: true, tone: "primary" },
      { id: 2, title: "Complaint update", body: "Your complaint #C-204 is being reviewed.", time: "1d ago", unread: true, tone: "warning" },
      { id: 3, title: "Schedule change", body: "Friday organic pickup moved to 8:00 AM.", time: "2d ago", unread: false, tone: "muted" },
      { id: 4, title: "Recycling milestone", body: "You recycled 42 kg this month. Great job!", time: "4d ago", unread: false, tone: "success" },
    ],
  );
}

export function getProfile() {
  return withFallback(
    () => api.get("/user/profile"),
    () => ({
      name: "Alex Rivera",
      email: "alex@example.com",
      phone: "+1 (555) 210-4477",
      nationalId: "RES-88214",
      address: "42 Maple Ave, Elm District",
      zone: "Zone A",
    }),
  );
}

export async function updateProfile(payload) {
  try {
    const { data } = await api.put("/user/profile", payload);
    return data;
  } catch {
    await delay();
    return payload;
  }
}

export default {
  getDashboard,
  getSchedule,
  getComplaints,
  submitComplaint,
  getNotifications,
  getProfile,
  updateProfile,
};
