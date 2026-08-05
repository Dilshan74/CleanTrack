const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
    province: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    municipalCouncil: {
        type: String,
        required: true
    },
    areaName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Collected", "Missed"],
        default: "Pending"
    },
    wasteType: {
        type: String,
        default: "General waste"
    }
});

const routeSchema = new mongoose.Schema({
    routeName: {
        type: String,
        required: true
    },
    areas: [areaSchema],
    collectionTime: {
        type: String,
        required: true
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Completed", "Inactive"],
        default: "Active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Route", routeSchema);
