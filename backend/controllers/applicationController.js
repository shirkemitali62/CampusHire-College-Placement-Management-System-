const Application = require("../models/Application");
const Company = require("../models/Company");
const User = require("../models/User");

// Apply for a job with automatic eligibility check
const applyForJob = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        message: "Company ID is required"
      });
    }

    // Find company/job
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company/job not found"
      });
    }

    // Check job status
    if (company.status !== "open") {
      return res.status(400).json({
        message: "Applications are closed for this job"
      });
    }

    // Check application deadline
    if (company.applicationDeadline) {
      const today = new Date();
      const deadline = new Date(company.applicationDeadline);

      // Compare only calendar dates
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const deadlineDate = new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate()
      );

      if (deadlineDate < todayDate) {
        return res.status(400).json({
          message: "Application deadline has passed",
          deadline: company.applicationDeadline
        });
      }
    }

    // Find student
    const student = await User.findById(req.user.userId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Check CGPA eligibility
    if (student.cgpa < company.minimumCGPA) {
      return res.status(400).json({
        message: "You are not eligible for this job",
        reason: `Minimum CGPA required is ${company.minimumCGPA}`,
        yourCGPA: student.cgpa
      });
    }

    // Check skills eligibility
    const studentSkills = student.skills.map(skill =>
      skill.toLowerCase().trim()
    );

    const missingSkills = company.requiredSkills.filter(
      requiredSkill =>
        !studentSkills.includes(
          requiredSkill.toLowerCase().trim()
        )
    );

    if (missingSkills.length > 0) {
      return res.status(400).json({
        message: "You are not eligible for this job",
        reason: "Required skills are missing",
        missingSkills
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      student: req.user.userId,
      company: companyId
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job"
      });
    }

    // Create application
    const application = await Application.create({
      student: req.user.userId,
      company: companyId
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to apply",
      error: error.message
    });
  }
};


// Get student's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.userId
    })
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


module.exports = {
  applyForJob,
  getMyApplications
};