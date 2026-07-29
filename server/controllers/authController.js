const User = require("../models/user");
const Driver = require("../models/driver");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function signToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// Register User
exports.registerUser = async (req, res) => {
    try {
        // The frontend sends `name`; accept `fullName` too for API clients.
        const { fullName, name, email, password, phone, address } = req.body;
        let { role } = req.body;

        // Never allow self-registration as an admin.
        if (role !== "user" && role !== "driver") {
            role = "user";
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName: fullName || name,
            email,
            password: hashedPassword,
            phone,
            address,
            role
        });

        // A driver needs a Driver profile so the driver portal (driverAuth) works.
        if (role === "driver") {
            const existingDriver = await Driver.findOne({ email });
            if (!existingDriver) {
                await Driver.create({
                    name: user.fullName,
                    email: user.email,
                    phone: phone || "0000000000",
                    licenseNumber: "PENDING"
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: signToken(user),
            user: {
                id: user._id,
                fullName: user.fullName,
                name: user.fullName,
                email: user.email,
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

        res.json({
            success: true,
            message: "Login successful",
            token: signToken(user),
            user: {
                id: user._id,
                fullName: user.fullName,
                name: user.fullName,
                email: user.email,
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