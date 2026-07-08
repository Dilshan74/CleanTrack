const User = require("../models/user.js");

const adminDashboard = async (req, res) => {
    const users = await User.countDocuments({
        role: "user"
    });

    const drivers = await User.countDocuments({
        role: "driver"
    });

    const admins = await User.countDocuments({
        role: "admin"
    });

    res.json({
        success: true,
        totalUsers: users,
        totalDrivers: drivers,
        totalAdmins: admins
    });
};

module.exports = {
    adminDashboard
};
