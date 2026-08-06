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

// Socket.io connection logic
io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Allow clients to join rooms (e.g. driver room, admin room)
    socket.on("join", (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Handle driver location updates
    socket.on("driver_location", (data) => {
        // data = { driverId, lat, lng, speed, heading }
        // Broadcast location update to anyone listening
        io.emit("driver_location_update", data);
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