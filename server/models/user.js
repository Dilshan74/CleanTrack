const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        province: {
            type: String,
            trim: true,
            default: ""
        },
        district: {
            type: String,
            trim: true,
            default: ""
        },
        city: {
            type: String,
            trim: true,
            default: ""
        },
        postalCode: {
            type: String,
            trim: true,
            default: ""
        },
        nationalId: {
            type: String,
            trim: true,
            default: ""
        },
        preferences: {
            emailAlerts: { type: Boolean, default: true },
            smsAlerts: { type: Boolean, default: false },
            pickupReminders: { type: Boolean, default: true }
        },
        role: {
            type: String,
            enum: ["user", "driver", "admin"],
            default: "user"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        profilePicture: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);