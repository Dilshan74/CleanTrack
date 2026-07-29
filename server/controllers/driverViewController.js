// Driver-facing portal endpoints. Uses `driverAuth`, so req.driverProfile and
// req.user are available. Responses match client/src/services/driverService.js.

const Driver = require("../models/driver");
const Route = require("../models/route");
const Notification = require("../models/notification");
const CollectionHistory = require("../models/collectionHistory");
const { formatDate, toNotificationCard } = require("./viewHelpers");

async function loadDriver(req) {
    return Driver.findById(req.driverProfile._id).populate("assignedRoute").populate("vehicleNumber");
}

function stopFromArea(area, index) {
    return {
        seq: index + 1,
        addr: area.areaName,
        type: "General waste",
        eta: "—",
        status: area.status,
    };
}

// GET /api/driver/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const driver = await loadDriver(req);
        const route = driver.assignedRoute;
        const areas = route?.areas || [];
        const completed = areas.filter((a) => a.status === "Collected").length;
        const progress = areas.length ? Math.round((completed / areas.length) * 100) : 0;

        res.json({
            truck: driver.vehicleNumber?.plateNumber || "—",
            route: route ? route.routeName : "No route assigned",
            stopsToday: areas.length,
            completed,
            etaNext: "—",
            etaFinish: "—",
            fuel: 0,
            progress,
            remainingKm: "—",
            announcements: [],
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/driver/schedule  and  GET /api/driver/stops
exports.getStops = async (req, res) => {
    try {
        const driver = await loadDriver(req);
        const areas = driver.assignedRoute?.areas || [];
        res.json(areas.map(stopFromArea));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/driver/stops/:seq
exports.updateStop = async (req, res) => {
    try {
        const seq = Number(req.params.seq);
        const { status } = req.body;
        const driver = await loadDriver(req);
        const route = driver.assignedRoute;
        if (!route) return res.status(400).json({ message: "No route assigned" });

        const area = route.areas[seq - 1];
        if (!area) return res.status(404).json({ message: "Stop not found" });

        area.status = status;
        await route.save();
        res.json({ seq, status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/driver/history
exports.getHistory = async (req, res) => {
    try {
        const history = await CollectionHistory.find({ driver: req.driverProfile._id })
            .populate("route", "routeName")
            .sort({ collectedDate: -1 });
        res.json(
            history.map((h) => ({
                date: formatDate(h.collectedDate),
                route: h.route?.routeName || "—",
                stops: 1,
                done: 1,
                missed: 0,
                duration: "—",
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/driver/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications.map(toNotificationCard));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/driver/profile
exports.getProfile = async (req, res) => {
    try {
        const driver = await loadDriver(req);
        res.json({
            name: driver.name,
            email: driver.email,
            phone: driver.phone || "",
            license: driver.licenseNumber || "",
            truck: driver.vehicleNumber?.plateNumber || "—",
            route: driver.assignedRoute?.routeName || "—",
            shift: "—",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
