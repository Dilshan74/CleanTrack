const User = require("../models/user");
const CollectionRequest = require("../models/collectionRequest");
const CollectionRoute = require("../models/collectionRoute");
const Route = require("../models/route");
const Notification = require("../models/notification");
const CollectionHistory = require("../models/collectionHistory");

// 0. User Dashboard summary
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const [upcoming, openComplaints, history, notifications] = await Promise.all([
            CollectionRequest.find({ user: userId, status: { $in: ["Pending", "Approved"] } })
                .sort({ collectionDate: 1 })
                .limit(5),
            CollectionRequest.countDocuments({ user: userId, status: "Pending" }),
            CollectionHistory.countDocuments({ user: userId }),
            Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(5)
        ]);

        // Determine next pickup from approved/pending requests
        const nextItem = upcoming.find(r => r.status === "Approved") || upcoming[0];
        const nextPickup = nextItem
            ? {
                when: new Date(nextItem.collectionDate).toLocaleDateString("en-GB"),
                time: "N/A",
                type: nextItem.garbageType
              }
            : { when: "No upcoming", time: "N/A", type: "N/A" };

        const upcomingList = upcoming.map((r, i) => ({
            id: r._id,
            type: r.garbageType,
            date: new Date(r.collectionDate).toLocaleDateString("en-GB"),
            time: "N/A",
            status: r.status
        }));

        const alerts = notifications.slice(0, 3).map(n => n.message || n.title || "New notification");

        res.json({
            success: true,
            data: {
                nextPickup,
                monthlyPickups: history,
                recycledKg: 0,
                openComplaints,
                upcoming: upcomingList,
                alerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. View profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Update profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { fullName, phone, address, postalCode } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, phone, address, postalCode },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Create garbage collection request
exports.createCollectionRequest = async (req, res) => {
    try {
        const { garbageType, description, pickupLocation, collectionDate } = req.body;
        
        const newRequest = await CollectionRequest.create({
            user: req.user.id,
            garbageType,
            description,
            pickupLocation,
            collectionDate,
            status: "Pending"
        });

        res.status(201).json({ success: true, data: newRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. View my requests
exports.getUserRequests = async (req, res) => {
    try {
        const requests = await CollectionRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. View my collection schedule — matched by postal code
exports.getUserSchedule = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("postalCode address");
        const userPostalCode = (user?.postalCode || "").trim();

        let matchedRoutes = [];
        if (userPostalCode) {
            matchedRoutes = await Route.find({
                postalCode: userPostalCode,
                status: { $in: ["Active", "Inactive"] }
            })
            .populate("assignedDriver", "name phone")
            .sort({ createdAt: -1 });
        }

        const scheduleItems = matchedRoutes.map((r) => ({
            id: r._id,
            routeName: r.routeName,
            postalCode: r.postalCode,
            collectionTime: r.collectionTime,
            areas: r.areas?.map((a) => a.areaName).join(", ") || "—",
            driver: r.assignedDriver?.name || "Unassigned",
            driverPhone: r.assignedDriver?.phone || "",
            status: r.status || "Active",
        }));

        res.json({
            success: true,
            data: {
                userPostalCode,
                scheduleItems,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. View my notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. View my collection history
exports.getUserHistory = async (req, res) => {
    try {
        const history = await CollectionHistory.find({ user: req.user.id })
            .populate("driver", "fullName phone")
            .populate("route", "routeName area")
            .sort({ collectedDate: -1 });
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
