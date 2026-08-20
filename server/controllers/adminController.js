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
            Route.find().select("routeName areas status collectionTime"),
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

        // Filter for today's routes
        const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayShort = shortDays[new Date().getDay()];
        const todayLong = longDays[new Date().getDay()];
        
        // Use local timezone date string (YYYY-MM-DD) for matching specific dates
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);

        const activeRoutes = routes.filter(r => {
            if (!r.collectionTime) return false;
            const ct = r.collectionTime;
            return ct.includes(todayShort) || ct.includes(todayLong) || ct.includes(localISOTime);
        });

        // Route health from area statuses
        const routeHealth = activeRoutes.map(r => {
            const total = r.areas?.length || 1;
            const collected = r.areas?.filter(a => a.status === "Collected").length || 0;
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
        const routes = await Route.find().populate("assignedDriver", "name").populate("assignedTruck", "plateNumber").select("routeName areas status assignedDriver assignedTruck collectionTime postalCode collectionStatus");

        res.json({ success: true, history, routes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET /api/admin/reports — aggregate statistics

const getReports = async (req, res) => {
    try {
        const now = new Date();

        // This month boundaries
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Last month boundaries
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const [
            totalHistory,
            thisMonthHistory,
            lastMonthHistory,
            pendingRequests,
            approvedRequests,
            collectedRequests,
            totalUsers,
            totalDrivers,
        ] = await Promise.all([
            CollectionHistory.countDocuments(),
            CollectionHistory.countDocuments({ createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
            CollectionHistory.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
            CollectionRequest.countDocuments({ status: "Pending" }),
            CollectionRequest.countDocuments({ status: "Approved" }),
            CollectionRequest.countDocuments({ status: "Collected" }),
            User.countDocuments({ role: "user" }),
            Driver.countDocuments(),
        ]);

        // Growth: compare this month vs last month collections
        let growthPct = 0;
        if (lastMonthHistory > 0) {
            growthPct = Math.round(((thisMonthHistory - lastMonthHistory) / lastMonthHistory) * 100);
        } else if (thisMonthHistory > 0) {
            growthPct = 100;
        }
        const growthStr = growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`;

        // Monthly volume for last 12 months
        const monthlyVolume = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const count = await CollectionHistory.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            monthlyVolume.push(count);
        }

        // Complaint categories by garbage type
        const complaintAgg = await CollectionRequest.aggregate([
            { $group: { _id: "$garbageType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const complaintCategories = complaintAgg.length
            ? complaintAgg.map(c => ({ l: c._id || "Other", v: c.count }))
            : [
                { l: "Pending",   v: pendingRequests   || 0 },
                { l: "Approved",  v: approvedRequests  || 0 },
                { l: "Collected", v: collectedRequests || 0 },
              ];

        // Recycling rate: collected / (collected + pending + approved) * 100
        const totalRequests = pendingRequests + approvedRequests + collectedRequests;
        const recyclingRate = totalRequests > 0
            ? Math.round((collectedRequests / totalRequests) * 100)
            : 0;

        res.json({
            success: true,
            wasteCollected: `${totalHistory} collections`,
            recycled: `${recyclingRate}%`,
            avgDelay: `${totalUsers} users`,
            growth: growthStr,
            totalUsers,
            totalDrivers,
            pendingRequests,
            monthlyVolume,
            complaintCategories,
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

        try {
            if (status === "Collected") {
                const CollectionHistory = require("../models/collectionHistory");
                await CollectionHistory.create({
                    request: complaint._id,
                    user: complaint.user,
                    postalCode: complaint.pickupLocation || "N/A",
                    garbageType: complaint.garbageType || "General waste",
                    collectedDate: new Date(),
                    remarks: "Resolved complaint request"
                });
            }
        } catch (err) {
            console.error("Failed to create CollectionHistory for complaint:", err.message);
        }

        res.json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// GET /api/admin/notifications — all system notifications

const getNotificationsForAdmin = async (req, res) => {
    try {
        // 1. Get stored database notifications
        const dbNotifs = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(30)
            .populate("receiver", "fullName email");

        // 2. Synthesize complaints notifications (CollectionRequests)
        const CollectionRequest = require("../models/collectionRequest");
        const complaints = await CollectionRequest.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("user", "fullName");

        const complaintNotifs = complaints.map((c) => ({
            _id: `complaint-${c._id}`,
            title: `New Complaint: ${c.garbageType}`,
            message: `User ${c.user?.fullName || "Resident"} reported a complaint: "${c.description || ""}". Status: ${c.status}.`,
            notificationType: "Request",
            tone: c.status === "Pending" ? "destructive" : "success",
            isRead: c.status !== "Pending",
            createdAt: c.createdAt
        }));

        // 3. Synthesize truck/fleet alerts
        const Truck = require("../models/truck");
        const trucks = await Truck.find({ status: { $in: ["Maintenance", "Out of Service"] } }).limit(10);
        const truckNotifs = trucks.map((t) => ({
            _id: `truck-${t._id}`,
            title: `Fleet Alert: Truck ${t.plateNumber}`,
            message: `Truck ${t.plateNumber} is currently marked as ${t.status}.`,
            notificationType: "Route",
            tone: "warning",
            isRead: false,
            createdAt: t.updatedAt || t.createdAt
        }));

        // Merge all and sort by newest first
        const all = [
            ...dbNotifs.map((n) => ({
                ...n.toObject(),
                tone: n.notificationType === "Route" ? "warning" : "primary"
            })),
            ...complaintNotifs,
            ...truckNotifs
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, notifications: all });
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
