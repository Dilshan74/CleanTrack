const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

router.post("/register", registerUser);
router.get("/me", protect, getMe);
router.post("/login", loginUser);


module.exports = router;
