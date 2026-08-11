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
    lat: {
        type: Number,
        default: 0
    },
    lng: {
        type: Number,
        default: 0
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
    routeDescription: {
        type: String,
        default: ""
    },
    startPoint: {
        name: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    endPoint: {
        name: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    areas: [areaSchema],
    collectionTime: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        trim: true,
        default: ""
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null
    },
    assignedTruck: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Truck",
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Completed", "Inactive"],
        default: "Active"
    },
    collectionStatus: {
        type: String,
        enum: ["Pending", "Assigned", "Started", "In_Progress", "Completed"],
        default: "Pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Route", routeSchema);
