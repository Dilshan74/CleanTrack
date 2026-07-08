const mongoose = require("mongoose");

const collectionRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        garbageType: {
            type: String,
            required: true,
            enum: ["General Waste", "Electronic Waste", "Recyclable", "Hazardous", "Organic"],
        },
        description: {
            type: String,
        },
        pickupLocation: {
            type: String,
            required: true,
        },
        collectionDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Collected", "Rejected"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CollectionRequest", collectionRequestSchema);
