const Driver = require("../models/driver.js");

// Add Driver
exports.addDriver = async (req, res) => {
    try {
        const driver = await Driver.create(req.body);
        res.status(201).json({
            success: true,
            message: "Driver added successfully",
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Drivers
exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json({
            success: true,
            drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Driver
exports.updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );
        res.json({
            success: true,
            message: "Driver updated",
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
    try {
        await Driver.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Driver deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Assign Route
exports.assignRoute = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { assignedRoute: req.body.route },
            { returnDocument: "after" }
        );
        res.json({
            success: true,
            message: "Route assigned successfully",
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
