const express = require("express");

const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Admin only
router.get("/", protect, authorize("admin"), getAllUsers);

// Logged-in users
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);

// Admin only
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
