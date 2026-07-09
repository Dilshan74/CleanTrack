const express = require("express");

const router = express.Router();

const {
    addRoute,
    getRoutes,
    updateRoute,
    deleteRoute,
    assignSchedule
} = require("../controllers/routeController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("admin"), addRoute);
router.get("/", protect, authorize("admin", "driver"), getRoutes);
router.put("/:id", protect, authorize("admin"), updateRoute);
router.delete("/:id", protect, authorize("admin"), deleteRoute);
router.put("/schedule/:id", protect, authorize("admin"), assignSchedule);

module.exports = router;
