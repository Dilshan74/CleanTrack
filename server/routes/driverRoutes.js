const express = require("express");

const router = express.Router();


const {
    addDriver,
    getDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    assignRoute,
    getDriverProfile,
    getAssignedRoute,
    updateCollectionStatus,
    updateLiveLocation,
    startCollection,
    completeCollection,
    getDashboard,
    getDriverNotifications
}=require("../controllers/driverController");

const { protect, authorize } = require("../middleware/authMiddleware");
const driverAuth = require("../middleware/driverAuth");

// ==============================
// Driver Dashboard Routes
// ==============================
// Dashboard summary
router.get("/dashboard", driverAuth, getDashboard);

// Profile
router.get("/dashboard/profile", driverAuth, getDriverProfile);
router.get("/profile", driverAuth, getDriverProfile);

// Schedule / Route
router.get("/dashboard/route", driverAuth, getAssignedRoute);
router.get("/route", driverAuth, getAssignedRoute);
router.get("/schedule", driverAuth, getAssignedRoute);

// Status updates
router.put("/dashboard/status", driverAuth, updateCollectionStatus);
router.put("/status", driverAuth, updateCollectionStatus);
router.put("/update-status/:id", driverAuth, updateCollectionStatus);

// Location updates
router.put("/dashboard/location", driverAuth, updateLiveLocation);
router.put("/location", driverAuth, updateLiveLocation);

// Complete Area
router.put("/dashboard/complete-area/:id", driverAuth, completeCollection);
router.put("/complete-area/:id", driverAuth, completeCollection);

// Start Collection
router.put("/start-collection/:id", driverAuth, startCollection);

// Notifications
router.get("/notifications", driverAuth, getDriverNotifications);

// Preferences / Settings
router.put("/preferences", driverAuth, async (req, res) => {
    try {
        const { preferences } = req.body;
        const Driver = require("../models/driver");
        const updated = await Driver.findByIdAndUpdate(
            req.driverProfile._id,
            { preferences },
            { new: true }
        );
        res.json({ success: true, driver: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==============================
// Admin Routes (Manage Drivers)
// ==============================
router.post("/", protect, authorize("admin"), addDriver);
router.get("/", protect, authorize("admin"), getDrivers);
router.get("/:id", protect, authorize("admin"), getDriverById);
router.put("/assign/:id", protect, authorize("admin"), assignRoute);
router.put("/:id", protect, authorize("admin"), updateDriver);
router.delete("/:id", protect, authorize("admin"), deleteDriver);

module.exports = router;