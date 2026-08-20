const Driver = require("../models/driver.js");
const Truck = require("../models/truck.js");
const Route = require("../models/route.js");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const CollectionHistory = require("../models/collectionHistory.js");
const Notification = require("../models/notification.js");

// Add Driver
exports.addDriver = async (req, res) => {
    try {
        const { vehicleNumber, password, name, email, phone, licenseNumber, assignedRoute } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        // Check if a User account already exists with this email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Validate truck availability
        if (vehicleNumber) {
            const truck = await Truck.findById(vehicleNumber);
            if (!truck) {
                return res.status(404).json({ success: false, message: "Truck not found" });
            }
            if (truck.assignedDriver) {
                return res.status(400).json({ success: false, message: "This truck is already assigned to another driver!" });
            }
        }

        // Validate route availability
        if (assignedRoute) {
            const routeDoc = await Route.findById(assignedRoute);
            if (!routeDoc) {
                return res.status(404).json({ success: false, message: "Route not found" });
            }
            if (routeDoc.assignedDriver) {
                return res.status(400).json({ success: false, message: "This route is already assigned to another driver!" });
            }
        }

        // Create User account so the driver can log in
        const hashedPassword = await bcrypt.hash(password, 10);
        const userAccount = await User.create({
            fullName: name,
            email,
            password: hashedPassword,
            phone,
            address: "Driver",
            role: "driver"
        });

        // Create the Driver profile
        let driver;
        try {
            driver = await Driver.create({
                name, email, phone, licenseNumber,
                vehicleNumber: vehicleNumber || null,
                assignedRoute: assignedRoute || null
            });
        } catch (driverErr) {
            // Roll back user account if driver creation fails
            await User.findByIdAndDelete(userAccount._id);
            throw driverErr;
        }

        if (vehicleNumber) {
            await Truck.findByIdAndUpdate(vehicleNumber, { assignedDriver: driver._id });
        }

        if (assignedRoute) {
            await Route.findByIdAndUpdate(assignedRoute, { assignedDriver: driver._id });
        }

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

        // Derive a meaningful status from the assigned route instead of relying
        // on the stored status field (which is always "Available").
        const driversWithStatus = drivers.map((d) => {
            const obj = d.toObject();
            obj.status = d.status || "Available";
            return obj;
        });

        res.json({ success: true, count: driversWithStatus.length, data: driversWithStatus });
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
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

        // Unlink from any assigned truck
        if (driver.vehicleNumber) {
            await Truck.findByIdAndUpdate(driver.vehicleNumber, { assignedDriver: null });
        }

        if (driver.assignedRoute) {
            await Route.findByIdAndUpdate(driver.assignedRoute, { assignedDriver: null });
        }

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

// Assign Route and/or Truck to Driver
exports.assignRoute = async (req, res) => {
    try {
        const { route, vehicleNumber } = req.body;
        const driverId = req.params.id;

        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

        const oldRouteId = driver.assignedRoute ? driver.assignedRoute.toString() : null;
        const newRouteId = route || null;

        if (route !== undefined && route) {
            const routeDoc = await Route.findById(route);
            if (!routeDoc) return res.status(404).json({ success: false, message: "Route not found" });
            if (routeDoc.assignedDriver && routeDoc.assignedDriver.toString() !== driverId) {
                return res.status(400).json({ success: false, message: "This route is already assigned to another driver!" });
            }
        }

        // Handle truck assignment with conflict check
        if (vehicleNumber !== undefined) {
            if (vehicleNumber) {
                const truck = await Truck.findById(vehicleNumber);
                if (!truck) return res.status(404).json({ success: false, message: "Truck not found" });
                if (truck.assignedDriver && truck.assignedDriver.toString() !== driverId) {
                    return res.status(400).json({ success: false, message: "This truck is already assigned to another driver!" });
                }
                // Unlink old truck if switching
                if (driver.vehicleNumber && driver.vehicleNumber.toString() !== vehicleNumber) {
                    await Truck.findByIdAndUpdate(driver.vehicleNumber, { assignedDriver: null });
                }
                await Truck.findByIdAndUpdate(vehicleNumber, { assignedDriver: driverId });
            } else {
                // Unassigning truck
                if (driver.vehicleNumber) {
                    await Truck.findByIdAndUpdate(driver.vehicleNumber, { assignedDriver: null });
                }
            }
        }

        if (route !== undefined) {
            if (oldRouteId && oldRouteId !== newRouteId) {
                await Route.findByIdAndUpdate(oldRouteId, { assignedDriver: null });
            }
            if (newRouteId && oldRouteId !== newRouteId) {
                await Route.findByIdAndUpdate(newRouteId, { assignedDriver: driverId });
            }
            if (!newRouteId && oldRouteId) {
                // already cleared above
            }
        }

        const updateFields = {};
        if (route !== undefined) updateFields.assignedRoute = route || null;
        if (vehicleNumber !== undefined) updateFields.vehicleNumber = vehicleNumber || null;

        const updated = await Driver.findByIdAndUpdate(driverId, updateFields, { new: true })
            .populate("assignedRoute vehicleNumber");

        res.json({
            success: true,
            message: "Driver updated successfully",
            driver: updated
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
        const route = await Route.findById(req.driverProfile.assignedRoute)
            .populate("assignedDriver", "_id name email")
            .populate("assignedTruck", "_id plateNumber");
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
        const { status, wasteType } = req.body;
        
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

        if (status) area.status = status; // "Pending", "Collected", or "Missed"
        if (wasteType) area.wasteType = wasteType;
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

// Start Collection
exports.startCollection = async (req, res) => {
    try {
        const routeId = req.params.id;
        const route = await Route.findByIdAndUpdate(
            routeId, 
            { collectionStatus: "In_Progress", startedAt: new Date() }, 
            { new: true }
        );

        if (route && route.postalCode) {
            const users = await User.find({ postalCode: route.postalCode, role: "user" });
            const notifs = users.map(u => ({
                receiver: u._id,
                receiverType: "User",
                title: "Collection Started",
                message: "Your waste collection route has started. The collection vehicle is now on the route.",
                notificationType: "Route"
            }));
            if (notifs.length > 0) await Notification.insertMany(notifs);
        }

        if (req.io) {
            req.io.emit("route_started", { routeId });
            req.io.emit("assignment_updated", { routeId });
        }

        res.json({
            success: true,
            message: "Collection started",
            route
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// End Collection
exports.endCollection = async (req, res) => {
    try {
        const routeId = req.params.id;
        const route = await Route.findByIdAndUpdate(
            routeId, 
            { status: "Completed", collectionStatus: "Completed", endedAt: new Date() }, 
            { new: true }
        );

        try {
            if (route) {
                const CollectionHistory = require("../models/collectionHistory.js");
                await CollectionHistory.create({
                    driver: route.assignedDriver,
                    route: route._id,
                    postalCode: route.postalCode,
                    garbageType: "General waste", // Default for route
                    collectedDate: new Date(),
                    remarks: "Route completed by driver"
                });
            }
        } catch (err) {
            console.error("Failed to create CollectionHistory:", err.message);
        }

        if (route && route.postalCode) {
            const users = await User.find({ postalCode: route.postalCode, role: "user" });
            const notifs = users.map(u => ({
                receiver: u._id,
                receiverType: "User",
                title: "Collection Ended",
                message: "Today's waste collection for your route has been completed.",
                notificationType: "Route"
            }));
            if (notifs.length > 0) await Notification.insertMany(notifs);
        }

        if (req.io) {
            req.io.emit("route_ended", { routeId });
            req.io.emit("assignment_updated", { routeId });
        }

        res.json({
            success: true,
            message: "Collection ended",
            route
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete Assigned Areas (Entire Route)
exports.completeCollection = exports.endCollection;

// ==========================================
// Get Driver Dashboard Summary
// ==========================================
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

exports.getDashboard = async (req, res) => {
    try {
        const driverId = req.driverProfile._id;
        const driver = await Driver.findById(driverId)
            .populate("vehicleNumber")
            .populate("assignedRoute");

        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        const route = driver.assignedRoute;

        // Calculate total and completed trips
        const allDriverRoutes = await Route.find({ assignedDriver: driverId });
        const totalTrips = allDriverRoutes.length;
        const completedTrips = allDriverRoutes.filter(r => r.status === "Completed").length;

        // Calculate progress by mileage
        let totalMileage = 0;
        let completedMileage = 0;
        let progress = 0;

        if (route && route.startPoint && route.endPoint) {
            let prevPoint = { lat: route.startPoint.latitude, lng: route.startPoint.longitude };
            
            // Go through areas (stops)
            for (let i = 0; i < route.areas.length; i++) {
                const area = route.areas[i];
                if (area.lat && area.lng) {
                    const dist = calculateDistance(prevPoint.lat, prevPoint.lng, area.lat, area.lng);
                    totalMileage += dist;
                    if (area.status === "Collected" || area.status === "Missed") {
                        completedMileage += dist;
                    }
                    prevPoint = { lat: area.lat, lng: area.lng };
                }
            }
            // Add distance to end point
            if (route.endPoint.latitude && route.endPoint.longitude) {
                const dist = calculateDistance(prevPoint.lat, prevPoint.lng, route.endPoint.latitude, route.endPoint.longitude);
                totalMileage += dist;
                // If route is completely done, we can consider the final leg completed.
                // Assuming it's collected if the last area is collected.
                if (route.collectionStatus === "Completed") {
                     completedMileage += dist;
                } else if (route.areas.length > 0 && route.areas[route.areas.length - 1].status === "Collected") {
                     completedMileage += dist;
                }
            }
            if (totalMileage > 0) {
                progress = Math.round((completedMileage / totalMileage) * 100);
            }
        }

        const truck = driver.vehicleNumber;
        
        // Fetch Announcements (Global notifications)
        const announcements = await Notification.find({ receiver: null, notificationType: "System" })
            .sort({ createdAt: -1 })
            .limit(3);
        const formattedAnnouncements = announcements.map(a => ({ id: a._id, title: a.title, message: a.message }));

        res.json({
            success: true,
            truck: truck ? truck.plateNumber : "N/A",
            route: route ? route.routeName : "No route assigned",
            routeId: route ? route._id : null,
            collectionStatus: route ? route.collectionStatus : null,
            totalTrips,
            completedTrips,
            progress,
            totalMileage: totalMileage.toFixed(1),
            completedMileage: completedMileage.toFixed(1),
            announcements: formattedAnnouncements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Get Driver Notifications (DB + synthesized)
// ==========================================
exports.getDriverNotifications = async (req, res) => {
    try {
        const driverId  = req.driverProfile._id;
        const userId    = req.user.id;

        // 1. Stored DB notifications addressed to this user
        const storedNotifs = await Notification.find({ receiver: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        // 2. Synthesize route/collection notifications from assigned route
        const driver = await Driver.findById(driverId)
            .populate("assignedRoute")
            .populate("vehicleNumber");

        const routeNotifs = [];
        const truckNotifs = [];

        if (driver?.assignedRoute) {
            const route = driver.assignedRoute;
            const total      = route.areas?.length || 0;
            const collected  = route.areas?.filter((a) => a.status === "Collected").length || 0;
            const missed     = route.areas?.filter((a) => a.status === "Missed").length || 0;
            const pending    = total - collected - missed;
            const status     = route.collectionStatus || "Pending";

            // Route assignment notification
            routeNotifs.push({
                _id:              `route-assigned-${route._id}`,
                title:            "Route assigned",
                message:          `You are assigned to Route "${route.routeName}" from ${route.startPoint?.name || "Start"} to ${route.endPoint?.name || "End"}.`,
                notificationType: "Route",
                tone:             "primary",
                isRead:           true,
                createdAt:        route.updatedAt || route.createdAt,
            });

            // Collection status notification
            if (status === "In_Progress") {
                routeNotifs.push({
                    _id:              `route-progress-${route._id}`,
                    title:            "Collection in progress",
                    message:          `Waste collection is actively in progress on ${route.routeName}.`,
                    notificationType: "Route",
                    tone:             "warning",
                    isRead:           false,
                    createdAt:        new Date(),
                });
            } else if (status === "Completed") {
                routeNotifs.push({
                    _id:              `route-done-${route._id}`,
                    title:            "Route completed",
                    message:          `Route "${route.routeName}" has been marked as completed.`,
                    notificationType: "Route",
                    tone:             "success",
                    isRead:           true,
                    createdAt:        new Date(),
                });
            }

            // Schedule reminder
            if (route.collectionTime) {
                routeNotifs.push({
                    _id:              `route-schedule-${route._id}`,
                    title:            "Collection schedule",
                    message:          `${route.routeName} scheduled: ${route.collectionTime}. Area: ${route.postalCode || "N/A"}.`,
                    notificationType: "Route",
                    tone:             "primary",
                    isRead:           true,
                    createdAt:        route.createdAt,
                });
            }
        } else {
            routeNotifs.push({
                _id:              `route-none-${driverId}`,
                title:            "No route assigned",
                message:          "You have no route assigned yet. Please contact your admin.",
                notificationType: "Route",
                tone:             "warning",
                isRead:           false,
                createdAt:        new Date(),
            });
        }

        // 3. Truck alert
        if (driver?.vehicleNumber) {
            const truck = driver.vehicleNumber;
            truckNotifs.push({
                _id:              `truck-${truck._id}`,
                title:            "Truck assigned",
                message:          `Your assigned truck: ${truck.plateNumber}. Capacity: ${truck.capacity || "N/A"} t. Status: ${truck.status || "Active"}.`,
                notificationType: "System",
                tone:             "primary",
                isRead:           true,
                createdAt:        truck.updatedAt || truck.createdAt,
            });
        }

        // Merge all and sort newest first
        const all = [
            ...storedNotifs.map((n) => ({
                ...n.toObject(),
                tone: n.notificationType === "Route" ? "warning"
                    : n.notificationType === "Request" ? "primary"
                    : "primary",
            })),
            ...routeNotifs,
            ...truckNotifs,
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, notifications: all });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

