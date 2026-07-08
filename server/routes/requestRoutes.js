const express = require("express");

const router = express.Router();

const {
    createRequest,
    getRequests,
    updateStatus,
    deleteRequest
} = require("../controllers/requestController");

router.post("/", createRequest);
router.get("/", getRequests);
router.put("/:id/status", updateStatus);
router.delete("/:id", deleteRequest);

module.exports = router;