// Seeds demo data for local development so the wired UI shows real content.
// Usage: node seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/user");
const Driver = require("./models/driver");
const Truck = require("./models/truck");
const Route = require("./models/route");
const CollectionRequest = require("./models/collectionRequest");
const CollectionHistory = require("./models/collectionHistory");
const Notification = require("./models/notification");

async function upsertUser({ fullName, email, password, phone, address, role }) {
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            fullName,
            email,
            password: await bcrypt.hash(password, 10),
            phone,
            address,
            role,
        });
    }
    return user;
}

const run = async () => {
    await connectDB();

    // Admin
    await upsertUser({
        fullName: "System Admin",
        email: "admin@example.com",
        password: "password123",
        phone: "0000000000",
        address: "Admin HQ",
        role: "admin",
    });

    // Residents
    const residents = [];
    for (const r of [
        { fullName: "Alex Rivera", email: "alex@example.com", address: "42 Maple Ave, Elm District" },
        { fullName: "Priya Nair", email: "priya@example.com", address: "8 Oak St, Riverside" },
    ]) {
        residents.push(
            await upsertUser({
                ...r,
                password: "password123",
                phone: "0711111111",
                role: "user",
            }),
        );
    }

    // Driver (User account + Driver profile)
    const driverUser = await upsertUser({
        fullName: "Sam Carter",
        email: "driver@example.com",
        password: "password123",
        phone: "0722222222",
        address: "Depot",
        role: "driver",
    });

    // Trucks
    const trucks = [];
    for (const t of [
        { plateNumber: "CT-4471", capacity: 12, status: "Active" },
        { plateNumber: "CT-1190", capacity: 10, status: "Maintenance" },
    ]) {
        let truck = await Truck.findOne({ plateNumber: t.plateNumber });
        if (!truck) truck = await Truck.create(t);
        trucks.push(truck);
    }

    // Route with areas
    let route = await Route.findOne({ routeName: "Route A · Elm District" });
    if (!route) {
        route = await Route.create({
            routeName: "Route A · Elm District",
            collectionTime: "Mon · Wed · Fri",
            areas: [
                { areaName: "12 Oak St", status: "Collected" },
                { areaName: "24 Oak St", status: "Collected" },
                { areaName: "8 Maple Ave", status: "Pending" },
                { areaName: "42 Maple Ave", status: "Pending" },
            ],
        });
    }

    // Driver profile linked to route + truck
    let driver = await Driver.findOne({ email: driverUser.email });
    if (!driver) {
        driver = await Driver.create({
            name: driverUser.fullName,
            email: driverUser.email,
            phone: driverUser.phone,
            licenseNumber: "DL-4471-CT",
            status: "On route",
        });
    }
    driver.assignedRoute = route._id;
    driver.vehicleNumber = trucks[0]._id;
    await driver.save();
    route.assignedDriver = driver._id;
    await route.save();
    trucks[0].assignedDriver = driver._id;
    await trucks[0].save();

    // Collection requests (also used as "complaints")
    const primary = residents[0];
    const existingReqs = await CollectionRequest.countDocuments({ user: primary._id });
    if (existingReqs === 0) {
        await CollectionRequest.create([
            {
                user: primary._id,
                garbageType: "Recyclable",
                description: "Weekly recyclables pickup",
                pickupLocation: primary.address,
                collectionDate: new Date(Date.now() + 86400000),
                status: "Approved",
            },
            {
                user: primary._id,
                garbageType: "General Waste",
                description: "[Missed pickup] Missed recycling pickup on Maple Ave.",
                pickupLocation: primary.address,
                collectionDate: new Date(),
                status: "Pending",
            },
        ]);
    }

    // History
    const existingHistory = await CollectionHistory.countDocuments();
    if (existingHistory === 0) {
        const anyReq = await CollectionRequest.findOne({ user: primary._id });
        await CollectionHistory.create({
            request: anyReq._id,
            user: primary._id,
            driver: driver._id,
            route: route._id,
            garbageType: "Recyclable",
            collectedDate: new Date(),
            quantity: "9.2 t",
        });
    }

    // Notifications
    const existingNotifs = await Notification.countDocuments({ receiver: primary._id });
    if (existingNotifs === 0) {
        await Notification.create([
            {
                receiver: primary._id,
                receiverType: "User",
                title: "Pickup reminder",
                message: "Recyclables collected tomorrow at 7:30 AM.",
                notificationType: "Collection",
            },
            {
                receiver: driverUser._id,
                receiverType: "Driver",
                title: "Route update",
                message: "New bulk pickup added to your route.",
                notificationType: "Route",
            },
        ]);
    }

    console.log("Seed complete.");
    console.log("Admin:    admin@example.com / password123");
    console.log("Resident: alex@example.com / password123");
    console.log("Driver:   driver@example.com / password123");
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
