const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    getUserProfile,
    updateUserProfile,
    createCollectionRequest,
    getUserRequests,
    getUserSchedule,
    getUserNotifications,
    getUserHistory
} = require("../controllers/userDashboardController");

// Use protect middleware for all routes below
router.use(protect);
// Ensure only users can access these routes (optional, if you want only 'user' role)
router.use(authorize("user"));

// 1 & 2: View and Update profile
router.route("/profile")
    .get(getUserProfile)
    .put(updateUserProfile)
    .post(updateUserProfile);

// 3 & 4: Create request and View my requests
router.route("/requests")
    .post(createCollectionRequest)
    .get(getUserRequests);

// 5: View my collection schedule
router.get("/schedule", getUserSchedule);

// 6: View my notifications
router.get("/notifications", getUserNotifications);
router.get("/notification", getUserNotifications);

// 7: View my collection history
router.get("/history", getUserHistory);

module.exports = router;
