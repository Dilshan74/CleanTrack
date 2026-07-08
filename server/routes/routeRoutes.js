const express = require("express");

const router = express.Router();

const {
    addRoute,
    getRoutes,
    updateRoute,
    deleteRoute
} = require("../controllers/routeController");

router.post("/", addRoute);

router.get("/", getRoutes);

router.put("/:id", updateRoute);

router.delete("/:id", deleteRoute);

module.exports = router;
