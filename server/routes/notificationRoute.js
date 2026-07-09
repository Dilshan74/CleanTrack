const express=require("express");

const router=express.Router();


const {

createNotification,
getNotifications,
markAsRead

}=require("../controllers/notificationController");



const { protect, authorize } = require("../middleware/authMiddleware");

// Admins can create any notification
router.post("/", protect, authorize("admin"), createNotification);

// Users/Drivers can view their own notifications
// (Note: Users already have /api/user/notifications, this is a generic fallback)
router.get("/:userId", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;