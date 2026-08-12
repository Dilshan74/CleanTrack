import api, { withFallback } from "./api";
import { delay, makeRef } from "../utils/helpers";

/** Resident-facing data. Live API first, mock fallback for local dev. */

async function tryLive(request, fallback) {
  try {
    return await request();
  } catch (err) {
    console.warn("[userService] API failed, using mock:", err?.response?.status, err?.response?.data?.message || err?.message);
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

export function getDashboard() {
  return tryLive(
    async () => {
      const { data } = await api.get("/user/dashboard");
      // Server returns { success, data: { nextPickup, monthlyPickups, ... } }
      return data.data || data;
    },
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
  return tryLive(
    async () => {
      const { data } = await api.get("/user/schedule");
      const items = data.data?.scheduleItems || [];
      const mappedItems = items.map((r) => {
        const timeStr = r.collectionTime || "7:30 AM";
        const parts = timeStr.split(" ");
        let date = "Scheduled";
        let time = timeStr;
        if (parts.length > 1) {
          const rawDate = parts[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const [y, m, d] = rawDate.split("-");
            date = `${d}/${m}/${y}`;
          } else {
            date = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
          }
          const rawTime = parts.slice(1).join(" ").trim();
          if (/^\d{1,2}:\d{2}/.test(rawTime)) {
            let [h, m] = rawTime.split(":");
            let hour = parseInt(h, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12;
            hour = hour ? hour : 12;
            time = `${hour}:${m} ${ampm}`;
          } else {
            time = rawTime;
          }
        }
        
        return {
          id:               r.id || "",
          date:             date,
          time:             time,
          routeName:        r.routeName || "",
          collectionTime:   r.collectionTime || "",
          status:           r.status === "Active" ? "Scheduled" : r.status,
          collectionStatus: r.collectionStatus || "Pending",
          driverId:         r.driverId || "",
          driverName:       r.driver || "Unassigned",
          truckPlate:       r.truckPlate || "",
          postalCode:       r.postalCode || ""
        };
      });

      return { scheduleItems: mappedItems, userPostalCode: data.data?.userPostalCode || "" };
    },
    () => ({
      scheduleItems: [
        { date: "Mon, Jul 14", time: "7:30 AM", type: "General waste", status: "Completed" },
        { date: "Wed, Jul 16", time: "7:30 AM", type: "Recyclables", status: "Scheduled" },
        { date: "Fri, Jul 18", time: "8:00 AM", type: "Organic waste", status: "Scheduled" },
        { date: "Mon, Jul 21", time: "7:30 AM", type: "General waste", status: "Scheduled" },
        { date: "Wed, Jul 23", time: "7:30 AM", type: "Recyclables", status: "Scheduled" },
        { date: "Sat, Jul 26", time: "9:00 AM", type: "Bulk pickup", status: "Scheduled" },
      ],
      userPostalCode: ""
    })
  );
}

export function getComplaints() {
  return tryLive(
    async () => {
      const { data } = await api.get("/user/complaints");
      // Server returns { success, data: [...] }
      const list = data.data || data;
      return (Array.isArray(list) ? list : []).map((r) => ({
        id: r._id || r.id,
        summary: r.description || r.garbageType || "Request",
        status: r.status || "Pending",
      }));
    },
    () => [
      { id: "C-204", summary: "Missed recycling pickup on Maple Ave.", status: "Reviewing" },
      { id: "C-198", summary: "Overflowing bin near park entrance.", status: "Resolved" },
      { id: "C-187", summary: "Damaged bin lid, needs replacement.", status: "Resolved" },
    ],
  );
}

export async function submitComplaint(payload) {
  try {
    const { data } = await api.post("/user/complaints", {
      garbageType: mapCategoryToEnum(payload.category),
      description: payload.description,
      pickupLocation: payload.location,
      collectionDate: new Date().toISOString(),
    });
    return data.data;
  } catch (err) {
    console.warn("[userService] submitComplaint failed:", err?.response?.data?.message);
    throw err;
  }
}

function mapCategoryToEnum(category) {
  const map = {
    "Missed pickup": "General Waste",
    "Overflowing bin": "General Waste",
    "Damaged bin": "General Waste",
    "Driver behavior": "General Waste",
    "Other": "General Waste",
    "Recyclables": "Recyclable",
    "Organic waste": "Organic",
  };
  return map[category] || "General Waste";
}

export function getNotifications() {
  return tryLive(
    async () => {
      const { data } = await api.get("/user/notifications");
      return (data.data || []).map((n) => ({
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
          n.notificationType === "Route" ? "primary"
          : n.notificationType === "Request" ? "warning"
          : "primary"
        ),
      }));
    },
    () => [
      { id: 1, title: "Pickup reminder", body: "Recyclables collected tomorrow at 7:30 AM.", time: "2h ago", date: "Today", unread: true, type: "Route", tone: "primary" },
      { id: 2, title: "Complaint update", body: "Your complaint is being reviewed.", time: "1d ago", date: "Yesterday", unread: true, type: "Request", tone: "warning" },
      { id: 3, title: "Schedule change", body: "Friday organic pickup moved to 8:00 AM.", time: "2d ago", date: "Aug 9", unread: false, type: "Route", tone: "primary" },
    ]
  );
}

export function getProfile() {
  return tryLive(
    async () => {
      const { data } = await api.get("/user/profile");
      const u = data.data || data;
      return {
        name: u.fullName || u.name || "—",
        email: u.email,
        phone: u.phone,
        address: u.address,
        province: u.province || "",
        district: u.district || "",
        city: u.city || "",
        nationalId: u.nationalId || "",
        postalCode: u.postalCode || "",
        profilePicture: u.profilePicture || "",
        preferences: u.preferences || { emailAlerts: true, smsAlerts: false, pickupReminders: true },
      };
    },
    () => ({
      name: "Alex Rivera",
      email: "alex@example.com",
      phone: "+1 (555) 210-4477",
      nationalId: "RES-88214",
      address: "142 Galle Road, Colombo 03",
      zone: "Zone A",
      profilePicture: "",
      preferences: { emailAlerts: true, smsAlerts: false, pickupReminders: true }
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

export async function uploadProfilePicture(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const { data } = await api.post("/user/profile/picture", { profilePicture: base64 });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.put("/user/profile/password", { currentPassword, newPassword });
  return data;
}

export async function updatePreferences(preferences) {
  try {
    const { data } = await api.put("/user/preferences", { preferences });
    return data;
  } catch (err) {
    console.error("Failed to update user preferences:", err);
    throw err;
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
  uploadProfilePicture,
  changePassword,
  updatePreferences,
};
