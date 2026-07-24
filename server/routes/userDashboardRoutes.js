const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    createCollectionRequest,
    getUserRequests,
    getUserHistory
} = require("../controllers/userDashboardController");
const userView = require("../controllers/userViewController");

// Use protect middleware for all routes below
router.use(protect);
// Ensure only users can access these routes (optional, if you want only 'user' role)
router.use(authorize("user"));

// Portal (frontend-shaped) endpoints
router.get("/dashboard", userView.getDashboard);

router.route("/profile")
    .get(userView.getProfile)
    .put(userView.updateProfile)
    .post(userView.updateProfile);

router.get("/schedule", userView.getSchedule);
router.get("/notifications", userView.getNotifications);
router.get("/notification", userView.getNotifications);

router.route("/complaints")
    .get(userView.getComplaints)
    .post(userView.createComplaint);

// Raw request + history endpoints
router.route("/requests")
    .post(createCollectionRequest)
    .get(getUserRequests);

router.get("/history", getUserHistory);

module.exports = router;
