const User = require("../models/user.js");

const Truck = require("../models/truck");
// (Route is already required below for getCollectionProgress, but we can safely require it at the top)

const adminDashboard = async (req, res) => {
    try {
        const users = await User.countDocuments({ role: "user" });
        const drivers = await User.countDocuments({ role: "driver" });
        const trucks = await Truck.countDocuments();
        const routesCount = await Route.countDocuments();
        
        // Collection schedules (routes that have an assigned driver)
        const schedules = await Route.countDocuments({ assignedDriver: { $ne: null } });

        // Collections progress
        const routes = await Route.find();
        let pending = 0;
        let collected = 0;
        
        routes.forEach(route => {
            route.areas.forEach(area => {
                if (area.status === "Pending") pending++;
                if (area.status === "Collected") collected++;
            });
        });

        res.json({
            success: true,
            totalUsers: users,
            totalDrivers: drivers,
            totalTrucks: trucks,
            totalRoutes: routesCount,
            totalSchedules: schedules,
            collections: {
                completed: collected,
                pending: pending
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manage Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { fullName, email, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, email, phone, address },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Monitor Collection Progress
const Route = require("../models/route");
const getCollectionProgress = async (req, res) => {
    try {
        const routes = await Route.find();
        
        let pending = 0;
        let collected = 0;
        let missed = 0;

        routes.forEach(route => {
            route.areas.forEach(area => {
                if (area.status === "Pending") pending++;
                if (area.status === "Collected") collected++;
                if (area.status === "Missed") missed++;
            });
        });

        res.json({
            success: true,
            progress: { pending, collected, missed }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Handle Complaints
const CollectionRequest = require("../models/collectionRequest");
const getComplaints = async (req, res) => {
    try {
        const complaints = await CollectionRequest.find().populate("user", "fullName email");
        res.json({ success: true, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await CollectionRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        res.json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    adminDashboard,
    getAllUsers,
    updateUser,
    deleteUser,
    getCollectionProgress,
    getComplaints,
    updateComplaintStatus
};
