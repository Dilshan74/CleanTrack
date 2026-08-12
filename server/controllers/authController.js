const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification");

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phone, address, province, district, city, postalCode } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const { isValidLocation } = require("../utils/locationData");
        if (province && district && city && !isValidLocation(province, district, city, postalCode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid combination of Province, District, City, and Postal Code."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
            address,
            province: province || "",
            district: district || "",
            city: city || "",
            postalCode: postalCode || ""
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Fire-and-forget: notify admin when a user logs in
        if (user.role === "user") {
            (async () => {
                try {
                    const admin = await User.findOne({ role: "admin" });
                    if (admin) {
                        await Notification.create({
                            receiver: admin._id,
                            receiverType: "Admin",
                            title: "New User Login",
                            message: `${user.fullName} (${user.email}) just logged in.`,
                            notificationType: "System"
                        });
                    }
                } catch (notifErr) {
                    console.error("[Login Notification] Failed to create notification:", notifErr.message);
                }
            })();
        }

        if (user.role === "driver") {
            const Driver = require("../models/driver");
            await Driver.findOneAndUpdate({ email: user.email }, { status: "On Route" });
        }

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Logout User
exports.logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === "driver") {
            const Driver = require("../models/driver");
            await Driver.findOneAndUpdate({ email: user.email }, { status: "Off duty" });
        }
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};