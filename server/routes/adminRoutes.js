const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/adminController");

// Import other controllers for proxy routes
const { getDrivers, getDriverById, addDriver, updateDriver, deleteDriver, assignRoute } = require("../controllers/driverController");
const { getTrucks, addTruck, updateTruck, deleteTruck } = require("../controllers/truckController");
const { getRoutes, addRoute, updateRoute, deleteRoute, assignSchedule } = require("../controllers/routeController");

const { protect, authorize } = require("../middleware/authMiddleware");


// Dashboard

// New overview endpoint (used by AdminDashboard.jsx via adminService.getOverview())
router.get("/overview", protect, authorize("admin"), getOverview);
// Legacy dashboard endpoint
router.get("/dashboard", protect, authorize("admin"), adminDashboard);

// Manage Users

router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id", protect, authorize("admin"), updateUser);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// Manage Drivers (proxy — same handlers as /api/drivers)

router.get("/drivers", protect, authorize("admin"), getDrivers);
router.post("/drivers", protect, authorize("admin"), addDriver);
router.get("/drivers/:id", protect, authorize("admin"), getDriverById);
router.put("/drivers/:id", protect, authorize("admin"), updateDriver);
router.delete("/drivers/:id", protect, authorize("admin"), deleteDriver);
router.put("/drivers/assign/:id", protect, authorize("admin"), assignRoute);


// Manage Trucks (proxy — same handlers as /api/trucks)

router.get("/trucks", protect, authorize("admin"), getTrucks);
router.post("/trucks", protect, authorize("admin"), addTruck);
router.put("/trucks/:id", protect, authorize("admin"), updateTruck);
router.delete("/trucks/:id", protect, authorize("admin"), deleteTruck);


// Manage Routes (proxy — same handlers as /api/routes)

router.get("/routes", protect, authorize("admin"), getRoutes);
router.post("/routes", protect, authorize("admin"), addRoute);
router.put("/routes/:id", protect, authorize("admin"), updateRoute);
router.delete("/routes/:id", protect, authorize("admin"), deleteRoute);
router.put("/routes/schedule/:id", protect, authorize("admin"), assignSchedule);


// Monitor Collection Progress & History

router.get("/progress", protect, authorize("admin"), getCollectionProgress);
router.get("/collections", protect, authorize("admin"), getCollections);


// Reports

router.get("/reports", protect, authorize("admin"), getReports);


// Complaints (user collection requests)

router.get("/complaints", protect, authorize("admin"), getComplaints);
router.put("/complaints/:id", protect, authorize("admin"), updateComplaintStatus);


// Notifications

router.get("/notifications", protect, authorize("admin"), getNotificationsForAdmin);

module.exports = router;
