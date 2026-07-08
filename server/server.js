const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const routeRoutes = require("./routes/routeroutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoute");
const historyRoutes = require("./routes/historyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const connectDB = require("./config/db");
const testRoutes = require("./routes/testRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.use("/api/routes", routeRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});