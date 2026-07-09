const express = require("express");

const router = express.Router();

const { 
    adminDashboard,
    getAllUsers,
    updateUser,
    deleteUser
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Dashboard stats
router.get("/dashboard", protect, authorize("admin"), adminDashboard);

// Manage Users
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id", protect, authorize("admin"), updateUser);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// Monitor Collection Progress
const { getCollectionProgress, getComplaints, updateComplaintStatus } = require("../controllers/adminController");
router.get("/progress", protect, authorize("admin"), getCollectionProgress);

// Handle Complaints
router.get("/complaints", protect, authorize("admin"), getComplaints);
router.put("/complaints/:id", protect, authorize("admin"), updateComplaintStatus);

module.exports = router;
