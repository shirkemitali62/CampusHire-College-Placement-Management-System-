const express = require("express");

const {
  addCompany,
  getCompanies,
  getAllJobs,
  updateJob,
  closeJob,
  reopenJob
} = require("../controllers/companyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Student + authenticated users
router.get("/", protect, getCompanies);

// Admin
router.get("/all", protect, getAllJobs);
router.post("/", protect, addCompany);
router.put("/:id", protect, updateJob);
router.put("/:id/close", protect, closeJob);
router.put("/:id/reopen", protect, reopenJob);

module.exports = router;