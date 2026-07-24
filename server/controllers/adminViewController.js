// Admin-facing portal endpoints. Responses match client/src/services/adminService.js.

const User = require("../models/user");
const Driver = require("../models/driver");
const Truck = require("../models/truck");
const Route = require("../models/route");
const CollectionRequest = require("../models/collectionRequest");
const CollectionHistory = require("../models/collectionHistory");
const Notification = require("../models/notification");
const { formatDate, toNotificationCard } = require("./viewHelpers");

function routeTone(pct) {
    if (pct >= 80) return "success";
    if (pct >= 60) return "warning";
    return "destructive";
}

function routeCompletion(route) {
    const areas = route.areas || [];
    if (!areas.length) return 0;
    const done = areas.filter((a) => a.status === "Collected").length;
    return Math.round((done / areas.length) * 100);
}

// GET /api/admin/overview
exports.getOverview = async (req, res) => {
    try {
        const [activeUsers, trucksOnRoute, openComplaints, routes] = await Promise.all([
            User.countDocuments({ role: "user", isActive: true }),
            Truck.countDocuments({ status: "Active" }),
            CollectionRequest.countDocuments({ status: { $in: ["Pending", "Approved"] } }),
            Route.find().populate("assignedDriver", "name"),
        ]);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const pickupsToday = await CollectionHistory.countDocuments({ collectedDate: { $gte: startOfDay } });

        // Volume for the last 7 days from collection history.
        const weeklyVolume = [];
        for (let i = 6; i >= 0; i--) {
            const from = new Date();
            from.setHours(0, 0, 0, 0);
            from.setDate(from.getDate() - i);
            const to = new Date(from);
            to.setDate(to.getDate() + 1);
            weeklyVolume.push(await CollectionHistory.countDocuments({ collectedDate: { $gte: from, $lt: to } }));
        }

        const routeHealth = routes.slice(0, 4).map((r) => {
            const p = routeCompletion(r);
            return { r: r.routeName, p, t: routeTone(p) };
        });

        res.json({ activeUsers, trucksOnRoute, pickupsToday, openComplaints, weeklyVolume, routeHealth });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        res.json(
            users.map((u) => ({
                name: u.fullName,
                email: u.email,
                zone: "—",
                status: u.isActive ? "Active" : "Suspended",
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/drivers
exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate("assignedRoute", "routeName").populate("vehicleNumber", "plateNumber");
        res.json(
            drivers.map((d) => ({
                name: d.name,
                license: d.licenseNumber || "—",
                route: d.assignedRoute?.routeName || "—",
                truck: d.vehicleNumber?.plateNumber || "—",
                status: d.status,
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/trucks
exports.getTrucks = async (req, res) => {
    try {
        const trucks = await Truck.find().populate("assignedDriver", "name");
        res.json(
            trucks.map((t) => ({
                id: t.plateNumber,
                plate: t.plateNumber,
                capacity: `${t.capacity} t`,
                driver: t.assignedDriver?.name || "—",
                status: t.status,
                fuel: 0,
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/routes
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate("assignedDriver", "name");
        res.json(
            routes.map((r) => ({
                id: r.routeName,
                zone: r.areas?.[0]?.areaName || "—",
                stops: r.areas?.length || 0,
                days: r.collectionTime || "—",
                driver: r.assignedDriver?.name || "—",
                truck: "—",
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/collections
exports.getCollections = async (req, res) => {
    try {
        const requests = await CollectionRequest.find().sort({ collectionDate: -1 }).limit(50);
        res.json(
            requests.map((r) => ({
                id: String(r._id).slice(-6).toUpperCase(),
                route: "—",
                zone: r.pickupLocation,
                date: formatDate(r.collectionDate),
                tons: 0,
                status: r.status,
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/reports
exports.getReports = async (req, res) => {
    try {
        const totalCollected = await CollectionHistory.countDocuments();

        const monthlyVolume = [];
        for (let i = 11; i >= 0; i--) {
            const from = new Date();
            from.setDate(1);
            from.setHours(0, 0, 0, 0);
            from.setMonth(from.getMonth() - i);
            const to = new Date(from);
            to.setMonth(to.getMonth() + 1);
            monthlyVolume.push(await CollectionHistory.countDocuments({ collectedDate: { $gte: from, $lt: to } }));
        }

        const byType = await CollectionRequest.aggregate([
            { $group: { _id: "$garbageType", v: { $sum: 1 } } },
            { $sort: { v: -1 } },
        ]);

        res.json({
            wasteCollected: `${totalCollected} t`,
            recycled: "0 t",
            avgDelay: "—",
            growth: "—",
            monthlyVolume,
            complaintCategories: byType.map((b) => ({ l: b._id, v: b.v })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiverType: "Admin" }).sort({ createdAt: -1 });
        res.json(notifications.map(toNotificationCard));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
