const express = require("express");

const {
  getAllStudents,
  getAllApplications,
  updateApplicationStatus
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/students", protect, getAllStudents);

router.get("/applications", protect, getAllApplications);

router.put("/applications/:id", protect, updateApplicationStatus);

module.exports = router;