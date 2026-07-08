const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token"
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: "No Token Found"
        });
    }
};

// Role Authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize
};
