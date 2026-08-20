const User = require("../models/user");
const CollectionRequest = require("../models/collectionRequest");
const CollectionRoute = require("../models/collectionRoute");
const Route = require("../models/route");
const Notification = require("../models/notification");
const CollectionHistory = require("../models/collectionHistory");
const Driver = require("../models/driver");

// ── Helper: 3-tier Route Matching ───────────────────────────────────────────
// Matches routes based on structured location fields first, then falls back to
// free-text address keyword matching (which is the most common case for users).
async function findRoutesForUser(userDoc) {
    const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let userPostalCode = (userDoc?.postalCode || "").trim();
    let userCity       = (userDoc?.city || "").trim();
    const userAddressRaw = (userDoc?.address || "").trim();

    // Check driver profile if user is a driver without postalCode
    if (userDoc?.role === "driver" && !userPostalCode) {
        const Driver = require("../models/driver.js");
        const driverProfile = await Driver.findOne({ email: userDoc.email }).populate("assignedRoute");
        if (driverProfile && driverProfile.assignedRoute) {
            userPostalCode = driverProfile.assignedRoute.postalCode || "";
            userCity       = driverProfile.assignedRoute.city || "";
        }
    }

    let matchedRoutes = [];

    // Tier 1 & 2: structured location fields
    if (userPostalCode || userCity) {
        const routeQuery = { status: { $in: ["Active", "Inactive", "Completed"] } };
        if (userPostalCode && userCity) {
            routeQuery.postalCode = userPostalCode;
            routeQuery.city = { $regex: new RegExp(`^${escapeRegex(userCity)}$`, "i") };
        } else if (userPostalCode) {
            routeQuery.postalCode = userPostalCode;
        } else {
            routeQuery.city = { $regex: new RegExp(`^${escapeRegex(userCity)}$`, "i") };
        }
        matchedRoutes = await Route.find(routeQuery).sort({ collectionTime: 1 });

        if (matchedRoutes.length === 0 && userPostalCode && userCity) {
            matchedRoutes = await Route.find({
                status: { $in: ["Active", "Inactive", "Completed"] },
                postalCode: userPostalCode
            }).sort({ collectionTime: 1 });
        }
    }

    // Tier 3: address keyword matching
    if (userAddressRaw) {
        const addressWords = userAddressRaw
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter(w => w.length >= 4);

        if (addressWords.length > 0 && matchedRoutes.length === 0) {
            const allRoutes = await Route.find({
                status: { $in: ["Active", "Inactive", "Completed"] }
            }).sort({ collectionTime: 1 });

            const scored = allRoutes.map(r => {
                const routeText = [r.routeName || "", ...(r.areas?.map(a => a.areaName || "") || [])]
                    .join(" ").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
                const score = addressWords.reduce((acc, word) => acc + (routeText.includes(word) ? 1 : 0), 0);
                return { route: r, score };
            });

            const bestScore = Math.max(...scored.map(s => s.score));
            if (bestScore > 0) {
                matchedRoutes = scored.filter(s => s.score === bestScore).map(s => s.route);
            }
        } else if (addressWords.length > 0 && matchedRoutes.length > 1) {
            const scored = matchedRoutes.map(r => {
                const routeText = [r.routeName || "", ...(r.areas?.map(a => a.areaName || "") || [])]
                    .join(" ").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
                const score = addressWords.reduce((acc, word) => acc + (routeText.includes(word) ? 1 : 0), 0);
                return { route: r, score };
            });

            const bestScore = Math.max(...scored.map(s => s.score));
            if (bestScore > 0) {
                matchedRoutes = scored.filter(s => s.score === bestScore).map(s => s.route);
            }
        }
    }

    return { matchedRoutes, userPostalCode, userCity, userAddressRaw };
}

// 0. User Dashboard summary
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const userDoc = await User.findById(userId).select("postalCode province district city address role email");
        
        const { matchedRoutes, userPostalCode, userCity, userAddressRaw } = await findRoutesForUser(userDoc);

        console.log(`[DASHBOARD] userId=${userId} postalCode="${userPostalCode}" city="${userCity}" address="${userAddressRaw?.substring(0,50)}" matchedRoutes=${matchedRoutes.length}`);
        matchedRoutes.forEach(r => console.log(`  -> "${r.routeName}" postalCode="${r.postalCode}" city="${r.city}"`));

        // ── Primary route for the collection area card ────────────────────────
        const primaryRoute = matchedRoutes[0] || null;

        // ── Collection area card ──────────────────────────────────────────────
        let collectionArea = null;
        if (primaryRoute) {
            collectionArea = {
                city:      userCity || primaryRoute.city || "",
                address:   userAddressRaw,
                routeName: primaryRoute.routeName
            };
        }

        // ── Upcoming pickups ──────────────────────────────────────────────────
        // Only show Active/Inactive routes — Completed routes are past, not upcoming.
        // collectionTime format: "YYYY-MM-DD HH:MM"  (date + time)
        //                     OR "HH:MM" / "HH:MM AM/PM" (time only, no date)
        const upcomingRaw = [];
        for (const r of matchedRoutes) {
            // Skip permanently completed routes in the upcoming list
            if (r.status === "Completed") continue;

            const rawCT   = (r.collectionTime || "").trim();
            const parts   = rawCT.split(" ");
            const first   = parts[0] || "";
            const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(first);

            let formattedDate, formattedTime, rawDate;

            if (hasDate) {
                // ── Full datetime: "2026-08-13 10:00" ────────────────────────
                const [y, mo, d] = first.split("-");
                formattedDate = `${d}/${mo}/${y}`;
                rawDate       = new Date(first);          // reliable ISO-like parse

                const timeStr = parts.slice(1).join(" ").trim();
                if (/^\d{1,2}:\d{2}/.test(timeStr)) {
                    const [h, m] = timeStr.split(":");
                    let hour = parseInt(h, 10);
                    const ampm = hour >= 12 ? "PM" : "AM";
                    hour = hour % 12 || 12;
                    formattedTime = `${hour}:${m} ${ampm}`;
                } else {
                    formattedTime = timeStr || "—";
                }
            } else if (/^\d{1,2}:\d{2}/.test(first)) {
                // ── Time only: "10:00" or "10:00 AM" ─────────────────────────
                const [h, m] = first.split(":");
                let hour = parseInt(h, 10);
                const ampm = parts[1]?.toUpperCase() === "PM" || hour >= 12 ? "PM" : "AM";
                hour = hour % 12 || 12;
                formattedTime = `${hour}:${m} ${ampm}`;
                formattedDate = "Recurring";
                rawDate       = new Date(0);              // sort these after dated entries
            } else if (rawCT) {
                // ── Unrecognised format — show as-is ─────────────────────────
                formattedDate = rawCT;
                formattedTime = "—";
                rawDate       = new Date(0);
            } else {
                // ── No collectionTime set ─────────────────────────────────────
                formattedDate = "Not scheduled";
                formattedTime = "—";
                rawDate       = new Date(0);
            }

            // Derive display status: runtime collectionStatus takes priority over route.status
            let displayStatus = "Scheduled";
            if (r.collectionStatus === "In_Progress" || r.collectionStatus === "Started") {
                displayStatus = "In Progress";
            } else if (r.collectionStatus === "Completed") {
                displayStatus = "Completed";
            } else if (r.status === "Inactive") {
                displayStatus = "Inactive";
            }

            upcomingRaw.push({
                id:        r._id,
                routeName: r.routeName,
                date:      formattedDate,
                time:      formattedTime,
                status:    displayStatus,
                rawDate
            });
        }
        upcomingRaw.sort((a, b) => a.rawDate - b.rawDate);
        const upcomingPickups = upcomingRaw.slice(0, 5).map(({ rawDate, ...rest }) => rest);

        // ── Monthly pickups & recycled kg ─────────────────────────────────────
        // NOTE: When the driver ends a collection, CollectionHistory is created with
        // only driver+route+postalCode — NOT a per-user record. So counting by
        // CollectionHistory.user always returns 0 for residents.
        // We count route completions (endedAt in current month) for the user's area instead.
        const now            = new Date();
        const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Build area filter for CollectionHistory (by postalCode)
        const areaFilter = userPostalCode
            ? { postalCode: userPostalCode }
            : {};

        // Monthly pickup count = completed route collections for user's area this month
        const routeIds = matchedRoutes.map(r => r._id);
        const [monthlyPickups, historyThisMonth, historyLastMonth] = await Promise.all([
            // Count route-level completions this month (endedAt set by driver)
            routeIds.length > 0
                ? Route.countDocuments({
                    _id: { $in: routeIds },
                    collectionStatus: "Completed",
                    endedAt: { $gte: monthStart }
                  })
                : (Object.keys(areaFilter).length > 0
                    ? CollectionHistory.countDocuments({ ...areaFilter, collectedDate: { $gte: monthStart } })
                    : 0),
            // For recycled kg, use CollectionHistory by postalCode
            Object.keys(areaFilter).length > 0
                ? CollectionHistory.find({ ...areaFilter, collectedDate: { $gte: monthStart } }).select("quantity")
                : [],
            Object.keys(areaFilter).length > 0
                ? CollectionHistory.find({ ...areaFilter, collectedDate: { $gte: prevMonthStart, $lte: prevMonthEnd } }).select("quantity")
                : []
        ]);

        function sumKg(records) {
            let total = 0, hasData = false;
            for (const rec of records) {
                const match = String(rec.quantity || "").match(/[\d.]+/);
                if (match) { total += parseFloat(match[0]); hasData = true; }
            }
            return { total: parseFloat(total.toFixed(2)), hasData };
        }
        const thisMonthKg        = sumKg(historyThisMonth);
        const lastMonthKg        = sumKg(historyLastMonth);
        const recycledKg          = thisMonthKg.total;
        const recycledKgLastMonth = lastMonthKg.hasData ? lastMonthKg.total : null;
        const weightDataAvailable = thisMonthKg.hasData;

        // ── Open complaints (Pending + Approved = not yet resolved) ───────────
        const openComplaints = await CollectionRequest.countDocuments({
            user:   userId,
            status: { $in: ["Pending", "Approved"] }
        });

        // ── Recent alerts from Notification model ─────────────────────────────
        const notifDocs    = await Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(3);
        const recentAlerts = notifDocs.map(n => ({
            id:        n._id,
            title:     n.title || "Notification",
            message:   n.message || "",
            createdAt: n.createdAt
        }));

        res.json({
            success: true,
            data: {
                collectionArea,
                monthlyPickups,
                recycledKg,
                recycledKgLastMonth,
                weightDataAvailable,
                openComplaints,
                upcomingPickups,
                recentAlerts
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
        const { fullName, phone, address, province, district, city, postalCode, nationalId } = req.body;

        const { isValidLocation } = require("../utils/locationData");
        if (province && district && city && !isValidLocation(province, district, city, postalCode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid combination of Province, District, City, and Postal Code."
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, phone, address, province, district, city, postalCode, nationalId },
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

// 2c. Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
        }

        const bcrypt = require("bcryptjs");
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.uploadProfilePicture = async (req, res) => {
    try {
        const { profilePicture } = req.body;

        if (!profilePicture) {
            return res.status(400).json({ success: false, message: "No image data provided" });
        }

        // Basic validation: must be a data URI (base64 image)
        if (!profilePicture.startsWith("data:image/")) {
            return res.status(400).json({ success: false, message: "Invalid image format" });
        }

        // Limit size to ~2MB (base64 is ~1.33x raw size)
        const sizeBytes = Buffer.byteLength(profilePicture, "utf8");
        if (sizeBytes > 2 * 1024 * 1024 * 1.5) {
            return res.status(400).json({ success: false, message: "Image too large. Max 2MB." });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile picture updated", profilePicture: user.profilePicture });
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

// 5. View my collection schedule — matched by 3-tier logic
exports.getUserSchedule = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("postalCode address role email province district city");
        const { matchedRoutes, userPostalCode } = await findRoutesForUser(user);

        // For schedule, we still want to populate driver and truck details
        const routeIds = matchedRoutes.map(r => r._id);
        const populatedRoutes = await Route.find({ _id: { $in: routeIds } })
            .populate("assignedDriver", "name phone")
            .populate("assignedTruck", "plateNumber")
            .sort({ createdAt: -1 });

        const scheduleItems = populatedRoutes.map((r) => ({
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

// 6. View my notifications (DB + synthesized from complaints & schedule)
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // 6a. Stored notifications addressed to this user
        const storedNotifs = await Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(30);

        // 6b. User's own complaint (CollectionRequest) activity
        const requests = await CollectionRequest.find({ user: userId }).sort({ updatedAt: -1 }).limit(20);

        const complaintNotifs = requests.map((r) => {
            const statusMap = {
                Pending:   { title: "Complaint received",   msg: `Your ${r.garbageType} complaint is pending review.`,             tone: "warning" },
                Approved:  { title: "Complaint approved",   msg: `Your ${r.garbageType} complaint has been approved.`,              tone: "success" },
                Collected: { title: "Complaint resolved",   msg: `Your ${r.garbageType} complaint has been resolved. Thank you!`,   tone: "success" },
                Rejected:  { title: "Complaint rejected",   msg: `Your ${r.garbageType} complaint was rejected. Contact support.`,  tone: "destructive" },
            };
            const s = statusMap[r.status] || { title: "Complaint update", msg: `Status: ${r.status}`, tone: "primary" };
            return {
                _id:              `complaint-${r._id}`,
                title:            s.title,
                message:          s.msg,
                notificationType: "Request",
                tone:             s.tone,
                isRead:           r.status === "Pending" ? false : true,
                createdAt:        r.updatedAt || r.createdAt,
            };
        });

        // 6c. Schedule reminders — routes matching user's postal code
        const user = await User.findById(userId).select("postalCode");
        const userPostalCode = (user?.postalCode || "").trim();

        let scheduleNotifs = [];
        if (userPostalCode) {
            const routes = await Route.find({ postalCode: userPostalCode, status: "Active" })
                .select("routeName collectionTime postalCode")
                .sort({ collectionTime: 1 })
                .limit(5);

            scheduleNotifs = routes.map((r) => {
                const timeLabel = r.collectionTime
                    ? `Scheduled: ${r.collectionTime}`
                    : "Schedule pending";
                return {
                    _id:              `schedule-${r._id}`,
                    title:            "Collection schedule",
                    message:          `${r.routeName} — ${timeLabel} in your area (${userPostalCode}).`,
                    notificationType: "Route",
                    tone:             "primary",
                    isRead:           false,
                    createdAt:        new Date(),
                };
            });
        }

        // Merge all sources and sort newest first
        const all = [
            ...storedNotifs.map((n) => ({ ...n.toObject(), tone: n.notificationType === "Route" ? "warning" : "primary" })),
            ...complaintNotifs,
            ...scheduleNotifs,
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, data: all });
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
        const user = await User.findById(req.user.id).select("postalCode address city role email");
        const { matchedRoutes, userPostalCode } = await findRoutesForUser(user);

        // Find the most appropriate route with an assigned driver
        const routeId = matchedRoutes.find(r => r.assignedDriver)?._id;

        if (!routeId) {
            return res.status(404).json({ success: false, message: "No truck assigned to your area route." });
        }

        const route = await Route.findById(routeId)
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
                route:  {
                    id: route._id,
                    name: route.routeName,
                    postalCode: userPostalCode,
                    collectionStatus: route.collectionStatus,
                    startPoint: route.startPoint,
                    endPoint: route.endPoint,
                },
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
                route:  {
                    id: route._id,
                    name: route.routeName,
                    postalCode: userPostalCode,
                    collectionStatus: route.collectionStatus,
                    startPoint: route.startPoint,
                    endPoint: route.endPoint,
                },
            });
        }

        // Driver is actively tracking
        res.json({
            success:  true,
            tracking: true,
            driver: { id: driver._id, name: driver.name },
            truck:  { id: route.assignedTruck?._id, plateNumber: route.assignedTruck?.plateNumber || "" },
            route:  {
                id: route._id,
                name: route.routeName,
                postalCode: userPostalCode,
                collectionStatus: route.collectionStatus,
                startPoint: route.startPoint,
                endPoint: route.endPoint,
            },
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

exports.updateUserPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences },
            { new: true }
        ).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


