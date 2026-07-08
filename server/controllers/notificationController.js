const Notification = require("../models/notification");

// @desc    Create a notification
// @route   POST /api/notifications
const createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json({ success: true, message: "Notification created", notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications/:userId
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { returnDocument: "after" }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createNotification, getNotifications, markAsRead };
