const CollectionHistory = require("../models/collectionHistory");

// @desc    Add a new collection history entry
// @route   POST /api/history
const addHistory = async (req, res) => {
    try {
        const history = await CollectionHistory.create(req.body);
        res.status(201).json({ success: true, message: "Collection history saved", history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all collection history
// @route   GET /api/history
const getHistory = async (req, res) => {
    try {
        const history = await CollectionHistory.find()
            .populate("user", "name email")
            .populate("driver", "name")
            .populate("route");
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get history by driver
// @route   GET /api/history/driver/:driverId
const getDriverHistory = async (req, res) => {
    try {
        const history = await CollectionHistory.find({ driver: req.params.driverId })
            .populate("user", "name email")
            .populate("route");
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addHistory, getHistory, getDriverHistory };
