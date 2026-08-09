const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const routeRoutes = require("./routes/routeRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoute");
const historyRoutes = require("./routes/historyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userDashboardRoutes = require("./routes/userDashboardRoutes");
const truckRoutes = require("./routes/truckRoutes"); // Added truckRoutes

const connectDB = require("./config/db");
const testRoutes = require("./routes/testRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON
app.use(cors());

// Test Route
app.get("/", (req, res) => {
    res.send("CleanTrack Backend is Running...");
});

// Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/driver", driverRoutes); // Alias for driver dashboard
app.use("/api/routes", routeRoutes);
app.use("/api/trucks", truckRoutes); // Mounted trucks API
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userDashboardRoutes);


// Port
const PORT = process.env.PORT || 5000;

// Create HTTP Server & Integrate Socket.io
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Import Driver model for persisting location from socket events
const Driver = require("./models/driver");

// Socket.io connection logic
io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Allow clients to join rooms (e.g. driver room, route room)
    socket.on("join", (room) => {
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    // Handle driver location updates
    // Payload: { driverId, driverName, routeId, postalCode, lat, lng, speed, heading, updatedAt }
    socket.on("driver_location", async (data) => {
        console.log(`[DRIVER LOCATION] driverId=${data.driverId} routeId=${data.routeId} postalCode=${data.postalCode} lat=${data.lat} lng=${data.lng} speed=${data.speed}`);

        // ── Persist the latest location to the Driver document ──
        if (data.driverId && data.driverId !== "unknown") {
            try {
                await Driver.findByIdAndUpdate(data.driverId, {
                    location: { lat: data.lat, lng: data.lng }
                });
                console.log(`[BACKEND LOCATION UPDATE] driverId=${data.driverId} location saved: lat=${data.lat} lng=${data.lng}`);
            } catch (err) {
                console.error(`[Socket] Failed to persist location for driverId=${data.driverId}:`, err.message);
            }
        }

        const locationPayload = {
            driverId:   data.driverId,
            driverName: data.driverName,
            routeId:    data.routeId,
            postalCode: data.postalCode,
            lat:        data.lat,
            lng:        data.lng,
            speed:      data.speed,
            heading:    data.heading,
            updatedAt:  data.updatedAt || new Date().toISOString(),
        };

        // ── Primary: broadcast to route-specific room using routeId ──
        if (data.routeId) {
            const room = `route-${data.routeId}`;
            console.log(`[SOCKET] Broadcasting truck_location_updated to room: ${room}`);
            io.to(room).emit("truck_location_updated", locationPayload);
        }

        // ── Legacy fallback: also broadcast to postalCode-based room ──
        if (data.postalCode) {
            const legacyRoom = `route:${data.postalCode}`;
            io.to(legacyRoom).emit("driver_location_update", locationPayload);
        } else {
            // No postalCode and no routeId — broadcast to all (last resort)
            if (!data.routeId) {
                console.log(`[Socket] No routeId or postalCode — broadcasting to all`);
                io.emit("driver_location_update", locationPayload);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket client disconnected: ${socket.id}`);
    });
});

// Make io accessible globally if needed, e.g. req.io
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});