const Driver = require("../models/driver.js");
const Truck = require("../models/truck.js");
const Route = require("../models/route.js");
const CollectionHistory = require("../models/collectionHistory.js");
const Notification = require("../models/notification.js");

// Add Driver
exports.addDriver = async (req, res) => {
    try {
        const driver = await Driver.create(req.body);
        res.status(201).json({
            success: true,
            message: "Driver added successfully",
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Drivers
exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate("assignedRoute vehicleNumber");
        res.json({ success: true, count: drivers.length, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Driver By ID
exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate("assignedRoute vehicleNumber");
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }
        res.json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Driver
exports.updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );
        res.json({
            success: true,
            message: "Driver updated",
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
    try {
        await Driver.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Driver deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Assign Route
exports.assignRoute = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { assignedRoute: req.body.route },
            { returnDocument: "after" }
        );
        res.json({
            success: true,
            message: "Route assigned successfully",
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// DRIVER DASHBOARD APIs (Module 12)
// ==========================================

// Get Driver Profile & Assigned Truck
exports.getDriverProfile = async (req, res) => {
    try {
        const driver = await Driver.findById(req.driverProfile._id).populate("vehicleNumber").populate("assignedRoute");
        res.json({
            success: true,
            driver
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// View Assigned Collection Schedule
exports.getAssignedRoute = async (req, res) => {
    try {
        if (!req.driverProfile.assignedRoute) {
            return res.json({ success: true, message: "No route assigned", route: null });
        }
        const route = await Route.findById(req.driverProfile.assignedRoute);
        res.json({
            success: true,
            route
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Collection Status for a Specific Area
exports.updateCollectionStatus = async (req, res) => {
    try {
        const areaId = req.params.id || req.body.areaId;
        const routeId = req.driverProfile.assignedRoute || req.body.routeId;
        const status = req.body.status;
        
        if (!routeId) {
            return res.status(400).json({ success: false, message: "No route assigned to update" });
        }

        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }

        const area = route.areas.id(areaId);
        if (!area) {
            return res.status(404).json({ success: false, message: "Area not found in this route" });
        }

        area.status = status; // "Pending", "Collected", or "Missed"
        await route.save();

        res.json({
            success: true,
            message: "Area status updated successfully",
            route
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Share Live Location
exports.updateLiveLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        
        req.driverProfile.location = { lat, lng };
        await req.driverProfile.save();

        res.json({
            success: true,
            message: "Location updated successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete Assigned Areas (Entire Route)
exports.completeArea = async (req, res) => {
    try {
        const routeId = req.params.id;
        const route = await Route.findByIdAndUpdate(
            routeId, 
            { status: "Completed" }, 
            { new: true }
        );

        res.json({
            success: true,
            message: "Route marked as completed",
            route
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Get Driver Dashboard Summary
// ==========================================
exports.getDashboard = async (req, res) => {
    try {
        const driver = await Driver.findById(req.driverProfile._id)
            .populate("vehicleNumber")
            .populate("assignedRoute");

        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        const route = driver.assignedRoute;
        const stopsToday = route ? route.areas.length : 0;
        const completed = route ? route.areas.filter(a => a.status === "Collected").length : 0;
        const missed = route ? route.areas.filter(a => a.status === "Missed").length : 0;
        const progress = stopsToday > 0 ? Math.round((completed / stopsToday) * 100) : 0;

        const truck = driver.vehicleNumber;

        res.json({
            success: true,
            truck: truck ? truck.plateNumber : "N/A",
            route: route ? route.routeName : "No route assigned",
            stopsToday,
            completed,
            missed,
            progress,
            etaNext: "N/A",
            etaFinish: route ? route.collectionTime : "N/A",
            fuel: 0,
            remainingKm: "N/A",
            announcements: []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Get Driver Notifications
// ==========================================
exports.getDriverNotifications = async (req, res) => {
    try {
        // Look up notifications by receiver matching the user's ID or driver email
        const notifications = await Notification.find({ receiver: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
