const express = require("express");

const router = express.Router();


const {
    addDriver,
    getDrivers,
    updateDriver,
    deleteDriver,
    assignRoute

}=require("../controllers/driverController");



router.post("/",addDriver);

router.get("/",getDrivers);

router.put("/:id",updateDriver);

router.delete("/:id",deleteDriver);

router.put("/assign/:id",assignRoute);



module.exports = router;