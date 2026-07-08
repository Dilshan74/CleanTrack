const express = require("express");

const router = express.Router();


const {
    addDriver,
    getDrivers,
    updateDriver,
    deleteDriver,
    assignRoute

}=require("../controllers/driverController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("admin"), addDriver);
router.get("/", protect, authorize("admin"), getDrivers);
router.put("/:id", protect, authorize("admin"), updateDriver);
router.delete("/:id", protect, authorize("admin"), deleteDriver);
router.put("/assign/:id", protect, authorize("admin"), assignRoute);



module.exports = router;