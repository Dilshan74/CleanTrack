const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Driver = require("./models/driver");
const Route = require("./models/route");
const connectDB = require("./config/db");

const run = async () => {
    await connectDB();
    
    // Find any driver to assign the route to
    const driver = await Driver.findOne();
    if (!driver) {
        console.log("No driver found in the database. Please create a driver first.");
        process.exit(1);
    }

    // Create a dummy route
    const route = await Route.create({
        routeName: "Test Downtown Route",
        collectionTime: "10:00 AM",
        assignedDriver: driver._id,
        areas: [
            { areaName: "Main Street", status: "Pending" },
            { areaName: "Park Avenue", status: "Pending" },
            { areaName: "Elm Street", status: "Pending" }
        ]
    });

    // Update all drivers to have this assignedRoute
    await Driver.updateMany(
        {},
        { 
            $set: { 
                assignedRoute: route._id,
                vehicleNumber: null // Fix old string value if present
            } 
        }
    );

    console.log("Successfully created a route and assigned it to the driver!");
    console.log("Route ID:", route._id);
    console.log("Area IDs:");
    route.areas.forEach(area => console.log(`- ${area.areaName}: ${area._id}`));

    process.exit(0);
};

run();
