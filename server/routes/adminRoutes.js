const express = require("express");

const router = express.Router();

const { 
    adminDashboard,
    getAllUsers,
    updateUser,
    deleteUser
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");
const adminView = require("../controllers/adminViewController");

const admin = [protect, authorize("admin")];

// Portal (frontend-shaped) read endpoints
router.get("/overview", admin, adminView.getOverview);
router.get("/users", admin, adminView.getUsers);
router.get("/drivers", admin, adminView.getDrivers);
router.get("/trucks", admin, adminView.getTrucks);
router.get("/routes", admin, adminView.getRoutes);
router.get("/collections", admin, adminView.getCollections);
router.get("/reports", admin, adminView.getReports);
router.get("/notifications", admin, adminView.getNotifications);

// Dashboard stats (raw)
router.get("/dashboard", protect, authorize("admin"), adminDashboard);

// Manage Users
router.put("/users/:id", protect, authorize("admin"), updateUser);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// Monitor Collection Progress
const { getCollectionProgress, getComplaints, updateComplaintStatus } = require("../controllers/adminController");
router.get("/progress", protect, authorize("admin"), getCollectionProgress);

// Handle Complaints
router.get("/complaints", protect, authorize("admin"), getComplaints);
router.put("/complaints/:id", protect, authorize("admin"), updateComplaintStatus);

module.exports = router;
