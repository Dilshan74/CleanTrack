const { protect, authorize } = require("./authMiddleware");
const Driver = require("../models/driver");

const driverAuth = async (req, res, next) => {
    try {
        // Run the generic protect middleware to verify JWT and set req.user
        protect(req, res, async () => {
            // No strict role check needed, just check if a Driver profile exists for their email

            // Find the driver profile by matching the email
            const driverProfile = await Driver.findOne({ email: req.user.email });
            
            if (!driverProfile) {
                return res.status(404).json({
                    success: false,
                    message: "Driver profile not found. Please contact admin."
                });
            }

            // Attach driver profile to request
            req.driverProfile = driverProfile;
            next();
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Not authorized as driver"
        });
    }
};

module.exports = driverAuth;
