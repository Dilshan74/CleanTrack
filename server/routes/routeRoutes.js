const express = require("express");

const router = express.Router();

const {
    addRoute,
    getRoutes,
    updateRoute,
    deleteRoute
} = require("../controllers/routeController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("admin"), addRoute);
router.get("/", protect, authorize("admin", "driver"), getRoutes);
router.put("/:id", protect, authorize("admin"), updateRoute);
router.delete("/:id", protect, authorize("admin"), deleteRoute);

module.exports = router;
