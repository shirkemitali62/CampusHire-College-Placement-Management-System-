const Application = require("../models/Application");
const User = require("../models/User");

// Get all students
const getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const students = await User.find({
      role: "student"
    }).select("-password");

    res.json({
      message: "Students fetched successfully",
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message
    });
  }
};

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const applications = await Application.find()
      .populate("student", "-password")
      .populate("company")
      .sort({ createdAt: -1 });

    res.json({
      message: "Applications fetched successfully",
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "applied",
      "shortlisted",
      "rejected",
      "selected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status"
      });
    }

    const application = await Application.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    application.status = status;

    await application.save();

    res.json({
      message: "Application status updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update application status",
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getAllApplications,
  updateApplicationStatus
};