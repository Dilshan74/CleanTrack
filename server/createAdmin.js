const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/user");
const connectDB = require("./config/db");

const run = async () => {
    await connectDB();
    
    const adminEmail = "admin@example.com";
    
    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
        console.log("Admin already exists! You can log in with:");
        console.log("Email: admin@example.com");
        console.log("Password: password123");
    } else {
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        admin = await User.create({
            fullName: "System Admin",
            email: adminEmail,
            password: hashedPassword,
            phone: "0000000000",
            address: "Admin HQ",
            role: "admin"
        });
        
        console.log("Successfully created an Admin account! You can log in with:");
        console.log("Email: admin@example.com");
        console.log("Password: password123");
    }
    
    process.exit(0);
};

run();
