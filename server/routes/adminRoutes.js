const express = require("express");

const router = express.Router();

const { adminDashboard } = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    adminDashboard
);

module.exports = router;
