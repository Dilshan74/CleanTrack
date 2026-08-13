const mongoose = require("mongoose");

const collectionHistorySchema = new mongoose.Schema(
    {
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CollectionRequest",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
        },
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CollectionRoute",
        },
        postalCode: {
            type: String,
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
