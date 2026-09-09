const User = require("../models/User");
const Company = require("../models/Company");
const Application = require("../models/Application");

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const totalStudents = await User.countDocuments({
      role: "student"
    });

    const totalCompanies = await Company.countDocuments();

    const activeJobs = await Company.countDocuments({
      status: "open"
    });

    const totalApplications = await Application.countDocuments();

    const selectedStudents = await Application.countDocuments({
      status: "selected"
    });

    const placementPercentage =
      totalStudents > 0
        ? Math.round((selectedStudents / totalStudents) * 100)
        : 0;

    res.json({
      message: "Dashboard statistics fetched successfully",
      stats: {
        totalStudents,
        totalCompanies,
        activeJobs,
        totalApplications,
        selectedStudents,
        placementPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};