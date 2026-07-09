const express = require("express");

const router = express.Router();

const {
    addTruck,
    getTrucks,
    updateTruck,
    deleteTruck
} = require("../controllers/truckController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ==============================
// Admin Routes (Manage Trucks)
// ==============================
router.post("/", protect, authorize("admin"), addTruck);
router.get("/", protect, authorize("admin"), getTrucks);
router.put("/:id", protect, authorize("admin"), updateTruck);
router.delete("/:id", protect, authorize("admin"), deleteTruck);

module.exports = router;
