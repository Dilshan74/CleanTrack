const express = require("express");

const router = express.Router();

const {
    addHistory,
    getHistory,
    getDriverHistory
} = require("../controllers/historyController");

router.post("/", addHistory);
router.get("/", getHistory);
router.get("/driver/:driverId", getDriverHistory);

module.exports = router;
