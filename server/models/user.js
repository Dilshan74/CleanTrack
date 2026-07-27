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
        role: {
            type: String,
            enum: ["user", "driver", "admin"],
            default: "user"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);