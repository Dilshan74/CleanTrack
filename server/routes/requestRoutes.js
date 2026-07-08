const express = require("express");

const router = express.Router();

const {
    createRequest,
    getRequests,
    updateStatus,
    deleteRequest
} = require("../controllers/requestController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("user"), createRequest);
router.get("/", protect, authorize("user", "admin"), getRequests);
router.put("/:id/status", protect, authorize("admin", "driver"), updateStatus);
router.delete("/:id", protect, authorize("user", "admin"), deleteRequest);

module.exports = router;