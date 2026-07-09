const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
    plateNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number, // in tons or kg
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Maintenance", "Inactive"],
        default: "Active"
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Truck", truckSchema);
