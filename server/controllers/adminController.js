const User = require("../models/user.js");
const Truck = require("../models/truck");
const Route = require("../models/route");
const CollectionRequest = require("../models/collectionRequest");
const CollectionHistory = require("../models/collectionHistory");
const Notification = require("../models/notification");
const Driver = require("../models/driver");

// ============================================================
// GET /api/admin/overview  — summary data for the admin dashboard
// ============================================================
const getOverview = async (req, res) => {
    try {
        const [activeUsers, trucksOnRoute, openComplaints, routes, recentHistory] = await Promise.all([
            User.countDocuments({ role: "user", isActive: true }),
            Truck.countDocuments({ status: "Active" }),
            CollectionRequest.countDocuments({ status: "Pending" }),
            Route.find().select("routeName areas status"),
            CollectionHistory.find().sort({ createdAt: -1 }).limit(7)
        ]);

        // Count today's pickups from history
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pickupsToday = await CollectionHistory.countDocuments({ createdAt: { $gte: today } });

        // Build weekly volume (last 7 days)
        const weeklyVolume = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const count = await CollectionHistory.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });
            weeklyVolume.push(count);
        }

        // Route health from area statuses
        const routeHealth = routes.map(r => {
            const total = r.areas.length || 1;
            const collected = r.areas.filter(a => a.status === "Collected").length;
            const pct = Math.round((collected / total) * 100);
            const tone = pct >= 80 ? "success" : pct >= 50 ? "warning" : "destructive";
            return { r: r.routeName, p: pct, t: tone };
        });

        res.json({
            success: true,
            activeUsers,
            trucksOnRoute,
            pickupsToday,
            openComplaints,
            weeklyVolume,
            routeHealth
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/dashboard  — alias kept for backward compat

const adminDashboard = async (req, res) => {
    try {
        const users = await User.countDocuments({ role: "user" });
        const drivers = await Driver.countDocuments();
        const trucks = await Truck.countDocuments();
        const routesCount = await Route.countDocuments();
        const schedules = await Route.countDocuments({ assignedDriver: { $ne: null } });

        const routes = await Route.find();
        let pending = 0;
        let collected = 0;

        routes.forEach(route => {
            route.areas.forEach(area => {
                if (area.status === "Pending") pending++;
                if (area.status === "Collected") collected++;
            });
        });

        res.json({
            success: true,
            totalUsers: users,
            totalDrivers: drivers,
            totalTrucks: trucks,
            totalRoutes: routesCount,
            totalSchedules: schedules,
            collections: { completed: collected, pending }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Manage Users

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { fullName, email, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, email, phone, address },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Monitor Collection Progress

const getCollectionProgress = async (req, res) => {
    try {
        const routes = await Route.find();

        let pending = 0;
        let collected = 0;
        let missed = 0;

        routes.forEach(route => {
            route.areas.forEach(area => {
                if (area.status === "Pending") pending++;
                if (area.status === "Collected") collected++;
                if (area.status === "Missed") missed++;
            });
        });

        res.json({
            success: true,
            progress: { pending, collected, missed }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET /api/admin/collections — recent collection history

const getCollections = async (req, res) => {
    try {
        const history = await CollectionHistory.find()
            .populate("driver", "name")
            .populate("route", "routeName")
            .sort({ createdAt: -1 })
            .limit(50);

        // Also include active route statuses
        const routes = await Route.find().populate("assignedDriver", "name").select("routeName areas status assignedDriver collectionTime");

        res.json({ success: true, history, routes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET /api/admin/reports — aggregate statistics

const getReports = async (req, res) => {
    try {
        const [totalHistory, pendingRequests, allRequests] = await Promise.all([
            CollectionHistory.countDocuments(),
            CollectionRequest.countDocuments({ status: "Pending" }),
            CollectionRequest.find().select("status createdAt")
        ]);

        // Monthly volume for last 12 months
        const monthlyVolume = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const count = await CollectionHistory.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            monthlyVolume.push(count);
        }

        // Complaint categories
        const complaintAgg = await CollectionRequest.aggregate([
            { $group: { _id: "$garbageType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const complaintCategories = complaintAgg.map(c => ({ l: c._id || "Other", v: c.count }));

        res.json({
            success: true,
            wasteCollected: `${totalHistory} collections`,
            recycled: "N/A",
            avgDelay: "N/A",
            growth: "+0%",
            monthlyVolume,
            complaintCategories: complaintCategories.length ? complaintCategories : [
                { l: "Pending", v: pendingRequests },
                { l: "Total", v: allRequests.length }
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Handle Complaints (requests from users)

const getComplaints = async (req, res) => {
    try {
        const complaints = await CollectionRequest.find().populate("user", "fullName email");
        res.json({ success: true, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await CollectionRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        res.json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET /api/admin/notifications — all system notifications

const getNotificationsForAdmin = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("receiver", "fullName email");
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getOverview,
    adminDashboard,
    getAllUsers,
    updateUser,
    deleteUser,
    getCollectionProgress,
    getCollections,
    getReports,
    getComplaints,
    updateComplaintStatus,
    getNotificationsForAdmin
};
