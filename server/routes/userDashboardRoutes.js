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
    getUserHistory,
    getUserDashboard,
    getTruckLocation
} = require("../controllers/userDashboardController");

// Use protect middleware for all routes below
router.use(protect);
// Ensure only users can access these routes (optional, if you want only 'user' role)
router.use(authorize("user"));

// 0: Dashboard summary
router.get("/dashboard", getUserDashboard);

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

// 8: Get live truck/driver location for the user's postal code
router.get("/truck-location", getTruckLocation);

// Aliases: /complaints maps to the same handlers as /requests
// so that userService.js calls to /user/complaints work correctly
router.route("/complaints")
    .post(createCollectionRequest)
    .get(getUserRequests);

module.exports = router;
