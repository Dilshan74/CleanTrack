const CollectionRequest = require("../models/collectionRequest");

// @desc    Create a new collection request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
    try {
        const { user, garbageType, description, pickupLocation, collectionDate } = req.body;

        const request = await CollectionRequest.create({
            user,
            garbageType,
            description,
            pickupLocation,
            collectionDate,
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all collection requests
// @route   GET /api/requests
// @access  Private/Admin
const getRequests = async (req, res) => {
    try {
        const requests = await CollectionRequest.find().populate("user", "name email");
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const request = await CollectionRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: "after", runValidators: true }
        );

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a collection request
// @route   DELETE /api/requests/:id
// @access  Private
const deleteRequest = async (req, res) => {
    try {
        const request = await CollectionRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createRequest, getRequests, updateStatus, deleteRequest };
