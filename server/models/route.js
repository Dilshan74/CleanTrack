const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
    province: {
        type: String,
        required: false
    },
    district: {
        type: String,
        required: false
    },
    municipalCouncil: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
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
    province: {
        type: String,
        trim: true,
        default: ""
    },
    district: {
        type: String,
        trim: true,
        default: ""
    },
    city: {
        type: String,
        trim: true,
        default: ""
    },
    postalCode: {
        type: String,
        trim: true,
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
    },
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Route", routeSchema);
