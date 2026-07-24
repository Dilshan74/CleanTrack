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
    completeArea
}=require("../controllers/driverController");

const { protect, authorize } = require("../middleware/authMiddleware");
const driverAuth = require("../middleware/driverAuth");
const driverView = require("../controllers/driverViewController");

// ==============================
// Driver Portal (frontend-shaped)
// ==============================
router.get("/dashboard", driverAuth, driverView.getDashboard);
router.get("/schedule", driverAuth, driverView.getStops);
router.get("/stops", driverAuth, driverView.getStops);
router.patch("/stops/:seq", driverAuth, driverView.updateStop);
router.get("/history", driverAuth, driverView.getHistory);
router.get("/notifications", driverAuth, driverView.getNotifications);
router.get("/profile", driverAuth, driverView.getProfile);

// ==============================
// Driver Dashboard Routes (raw)
// ==============================
// Profile
router.get("/dashboard/profile", driverAuth, getDriverProfile);

// Schedule / Route
router.get("/dashboard/route", driverAuth, getAssignedRoute);
router.get("/route", driverAuth, getAssignedRoute);

// Status updates
router.put("/dashboard/status", driverAuth, updateCollectionStatus);
router.put("/status", driverAuth, updateCollectionStatus);
router.put("/update-status/:id", driverAuth, updateCollectionStatus);

// Location updates
router.put("/dashboard/location", driverAuth, updateLiveLocation);
router.put("/location", driverAuth, updateLiveLocation);

// Complete Area
router.put("/dashboard/complete-area/:id", driverAuth, completeArea);
router.put("/complete-area/:id", driverAuth, completeArea);

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