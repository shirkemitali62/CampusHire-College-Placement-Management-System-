const express = require("express");

const {
  applyForJob,
  getMyApplications
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, applyForJob);

router.get("/my", protect, getMyApplications);

module.exports = router;