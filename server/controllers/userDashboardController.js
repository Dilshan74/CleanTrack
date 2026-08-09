const User = require("../models/user");
const CollectionRequest = require("../models/collectionRequest");
const CollectionRoute = require("../models/collectionRoute");
const Route = require("../models/route");
const Notification = require("../models/notification");
const CollectionHistory = require("../models/collectionHistory");
const Driver = require("../models/driver");

// 0. User Dashboard summary
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const [userDoc, upcomingRequests, openComplaints, history, notifications] = await Promise.all([
            User.findById(userId).select("postalCode"),
            CollectionRequest.find({ user: userId, status: { $in: ["Pending", "Approved"] } }),
            CollectionRequest.countDocuments({ user: userId, status: "Pending" }),
            CollectionHistory.countDocuments({ user: userId }),
            Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(5)
        ]);

        let userPostalCode = (userDoc?.postalCode || "").trim();

        if (userDoc?.role === "driver" && !userPostalCode) {
            const driverProfile = await Driver.findOne({ email: userDoc.email }).populate("assignedRoute");
            if (driverProfile && driverProfile.assignedRoute) {
                userPostalCode = driverProfile.assignedRoute.postalCode || "";
            }
        }

        let matchedRoutes = [];
        if (userPostalCode) {
            matchedRoutes = await Route.find({
                postalCode: userPostalCode,
                status: { $in: ["Active", "Inactive", "Completed"] }
            });
        }

        let allUpcoming = [];

        upcomingRequests.forEach(req => {
            allUpcoming.push({
                id: req._id,
                type: req.garbageType,
                date: new Date(req.collectionDate).toLocaleDateString("en-GB"),
                time: "N/A",
                status: req.status,
                rawDate: new Date(req.collectionDate)
            });
        });

        matchedRoutes.forEach(r => {
            if (r.collectionTime) {
                const dateStr = r.collectionTime.split(" ")[0]; 
                const timeStr = r.collectionTime.split(" ").slice(1).join(" ").trim(); 
                
                let formattedTime = timeStr;
                if (/^\d{1,2}:\d{2}/.test(timeStr)) {
                    let [h, m] = timeStr.split(":");
                    let hour = parseInt(h, 10);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    hour = hour % 12;
                    hour = hour ? hour : 12;
                    formattedTime = `${hour}:${m} ${ampm}`;
                }

                allUpcoming.push({
                    id: r._id,
                    type: "Scheduled Route",
                    date: new Date(dateStr).toLocaleDateString("en-GB"),
                    time: formattedTime,
                    status: r.status === "Active" ? "Scheduled" : r.status,
                    rawDate: new Date(dateStr)
                });
            }
        });

        allUpcoming.sort((a, b) => a.rawDate - b.rawDate);
        const upcomingList = allUpcoming.slice(0, 5).map(u => {
            const { rawDate, ...rest } = u;
            return rest;
        });

        const nextPickup = allUpcoming.length > 0
            ? {
                when: allUpcoming[0].date,
                time: allUpcoming[0].time,
                type: allUpcoming[0].type
              }
            : { when: "No upcoming", time: "N/A", type: "N/A" };

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
        const user = await User.findById(req.user.id).select("postalCode address role email");
        let userPostalCode = (user?.postalCode || "").trim();
        console.log("getUserSchedule -> User:", user.email, "Role:", user.role, "PostalCode:", userPostalCode);

        if (user?.role === "driver" && !userPostalCode) {
            const driverProfile = await Driver.findOne({ email: user.email }).populate("assignedRoute");
            if (driverProfile && driverProfile.assignedRoute) {
                userPostalCode = driverProfile.assignedRoute.postalCode || "";
                console.log("getUserSchedule -> Driver profile found. Route PostalCode:", userPostalCode);
            } else {
                console.log("getUserSchedule -> Driver profile or assignedRoute NOT found");
            }
        }

        let matchedRoutes = [];
        if (userPostalCode) {
            matchedRoutes = await Route.find({
                postalCode: userPostalCode,
                status: { $in: ["Active", "Inactive", "Completed"] }
            })
            .populate("assignedDriver", "name phone")
            .populate("assignedTruck", "plateNumber")
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
            driverId: r.assignedDriver?._id || "",
            truckPlate: r.assignedTruck?.plateNumber || "",
            status: r.status || "Active",
            collectionStatus: r.collectionStatus || "Pending",
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

// 8. Get truck/driver live location for the user's assigned route
exports.getTruckLocation = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("postalCode address");

        // Priority: query param > profile postalCode > extract from address
        let userPostalCode = (req.query.postalCode || user?.postalCode || "").trim();

        // Fallback: try to extract a numeric postal code from the address string
        if (!userPostalCode && user?.address) {
            const match = user.address.match(/\b\d{5}\b/);
            if (match) userPostalCode = match[0];
        }

        if (!userPostalCode) {
            return res.status(404).json({
                success: false,
                message: "No postal code found for your account. Please update your profile with your postal code."
            });
        }

        // Find the route for this postal code with an assigned driver.
        // NOTE: Do NOT filter by route.status — a "Completed" route still has
        // a driver assigned and must be queryable for live tracking.
        const route = await Route.findOne({
            postalCode:     userPostalCode,
            assignedDriver: { $ne: null },
        })
        .sort({ updatedAt: -1 })           // prefer most recently updated if multiple
        .populate("assignedDriver", "name location status updatedAt")
        .populate("assignedTruck",  "_id plateNumber");

        if (!route || !route.assignedDriver) {
            return res.status(404).json({ success: false, message: "No truck assigned to your area route." });
        }

        const driver      = route.assignedDriver;
        const hasLocation = !!(driver.location?.lat && driver.location?.lng);

        console.log(`[USER TRACKING] userId=${req.user.id} routeId=${route._id} driver=${driver.name} collectionStatus=${route.collectionStatus} lat=${driver.location?.lat} lng=${driver.location?.lng}`);

        // Collection completed — stop tracking
        if (route.collectionStatus === "Completed") {
            return res.json({
                success: true,
                tracking: false,
                message:  "Collection completed for today",
                driver: { id: driver._id, name: driver.name },
                truck:  { id: route.assignedTruck?._id, plateNumber: route.assignedTruck?.plateNumber || "" },
                route:  { id: route._id, name: route.routeName, postalCode: userPostalCode, collectionStatus: route.collectionStatus },
            });
        }

        // Driver assigned but hasn't sent GPS yet
        if (!hasLocation) {
            return res.json({
                success: true,
                tracking: false,
                message:  "Driver has not started tracking yet",
                driver: { id: driver._id, name: driver.name },
                truck:  { id: route.assignedTruck?._id, plateNumber: route.assignedTruck?.plateNumber || "" },
                route:  { id: route._id, name: route.routeName, postalCode: userPostalCode, collectionStatus: route.collectionStatus },
            });
        }

        // Driver is actively tracking
        res.json({
            success:  true,
            tracking: true,
            driver: { id: driver._id, name: driver.name },
            truck:  { id: route.assignedTruck?._id, plateNumber: route.assignedTruck?.plateNumber || "" },
            route:  { id: route._id, name: route.routeName, postalCode: userPostalCode, collectionStatus: route.collectionStatus },
            location: {
                latitude:  driver.location.lat,
                longitude: driver.location.lng,
                speed:     0,
                updatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


