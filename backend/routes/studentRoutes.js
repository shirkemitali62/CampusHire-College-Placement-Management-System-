const express = require("express");

const {
  getProfile,
  updateProfile
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get student profile
router.get("/profile", protect, getProfile);

// Update student profile
router.put("/profile", protect, updateProfile);

module.exports = router;