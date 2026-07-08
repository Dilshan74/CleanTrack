const mongoose = require("mongoose");

const collectionHistorySchema = new mongoose.Schema(
    {
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CollectionRequest",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
        },
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CollectionRoute",
        },
        garbageType: {
            type: String,
            required: true,
        },
        collectedDate: {
            type: Date,
            default: Date.now,
        },
        quantity: {
            type: String,
            default: "Not Recorded",
        },
        remarks: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CollectionHistory", collectionHistorySchema);
