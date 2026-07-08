const express = require("express");

const router = express.Router();

const {
    addHistory,
    getHistory,
    getDriverHistory
} = require("../controllers/historyController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("driver"), addHistory);
router.get("/", protect, authorize("admin"), getHistory);
router.get("/driver/:driverId", protect, authorize("admin", "driver"), getDriverHistory);

module.exports = router;
