// Resident-facing portal endpoints. Responses are shaped exactly as the
// frontend (client/src/services/userService.js) expects — plain objects/arrays.

const User = require("../models/user");
const CollectionRequest = require("../models/collectionRequest");
const Notification = require("../models/notification");
const CollectionHistory = require("../models/collectionHistory");
const { formatDate, formatTime, toNotificationCard } = require("./viewHelpers");

const OPEN_STATUSES = ["Pending", "Approved"];

function toProfile(user) {
    return {
        name: user.fullName,
        email: user.email,
        phone: user.phone || "",
        nationalId: "",
        address: user.address || "",
        zone: "",
    };
}

function toComplaint(r) {
    return {
        id: r._id,
        summary: r.description || r.garbageType,
        status: r.status === "Collected" ? "Resolved" : r.status === "Rejected" ? "Rejected" : "Reviewing",
    };
}

// GET /api/user/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await CollectionRequest.find({ user: userId }).sort({ collectionDate: 1 });
        const upcomingReqs = requests.filter((r) => OPEN_STATUSES.includes(r.status));
        const openComplaints = requests.filter((r) => OPEN_STATUSES.includes(r.status)).length;

        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const monthlyPickups = await CollectionHistory.countDocuments({
            user: userId,
            collectedDate: { $gte: start },
        });

        const notifications = await Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(3);

        const next = upcomingReqs[0];
        res.json({
            nextPickup: next
                ? { when: formatDate(next.collectionDate), time: formatTime(next.collectionDate), type: next.garbageType }
                : null,
            monthlyPickups,
            recycledKg: 0,
            openComplaints,
            upcoming: upcomingReqs.slice(0, 3).map((r) => ({
                id: r._id,
                type: r.garbageType,
                date: formatDate(r.collectionDate),
                time: formatTime(r.collectionDate),
                status: r.status,
            })),
            alerts: notifications.map((n) => n.message),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/user/schedule
exports.getSchedule = async (req, res) => {
    try {
        const requests = await CollectionRequest.find({ user: req.user.id }).sort({ collectionDate: 1 });
        res.json(
            requests.map((r) => ({
                date: formatDate(r.collectionDate),
                time: formatTime(r.collectionDate),
                type: r.garbageType,
                status: r.status,
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/user/complaints
exports.getComplaints = async (req, res) => {
    try {
        const requests = await CollectionRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(requests.map(toComplaint));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/user/complaints
exports.createComplaint = async (req, res) => {
    try {
        const { category, location, description } = req.body;
        const request = await CollectionRequest.create({
            user: req.user.id,
            garbageType: "General Waste",
            description: category ? `[${category}] ${description}` : description,
            pickupLocation: location || "Not specified",
            collectionDate: new Date(),
            status: "Pending",
        });
        res.status(201).json(toComplaint(request));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/user/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications.map(toNotificationCard));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/user/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(toProfile(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const update = {};
        if (name !== undefined) update.fullName = name;
        if (phone !== undefined) update.phone = phone;
        if (address !== undefined) update.address = address;

        const user = await User.findByIdAndUpdate(req.user.id, update, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(toProfile(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
