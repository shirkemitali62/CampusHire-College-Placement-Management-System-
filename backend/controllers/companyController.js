const Company = require("../models/Company");

// Admin: Add new company/job
const addCompany = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const company = await Company.create(req.body);

    res.status(201).json({
      message: "Company/job added successfully",
      company
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add company/job",
      error: error.message
    });
  }
};


// Student + authenticated users: Get open jobs
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      status: "open"
    }).sort({ createdAt: -1 });

    res.json({
      message: "Jobs fetched successfully",
      count: companies.length,
      companies
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
};


// Admin: Get all jobs
const getAllJobs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const jobs = await Company.find()
      .sort({ createdAt: -1 });

    res.json({
      message: "All jobs fetched successfully",
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
};


// Admin: Edit job
const updateJob = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const {
      companyName,
      jobTitle,
      description,
      location,
      package: salaryPackage,
      minimumCGPA,
      requiredSkills,
      applicationDeadline
    } = req.body;

    const job = await Company.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    if (companyName !== undefined)
      job.companyName = companyName;

    if (jobTitle !== undefined)
      job.jobTitle = jobTitle;

    if (description !== undefined)
      job.description = description;

    if (location !== undefined)
      job.location = location;

    if (salaryPackage !== undefined)
      job.package = salaryPackage;

    if (minimumCGPA !== undefined)
      job.minimumCGPA = minimumCGPA;

    if (requiredSkills !== undefined)
      job.requiredSkills = requiredSkills;

    if (applicationDeadline !== undefined)
      job.applicationDeadline = applicationDeadline;

    await job.save();

    res.json({
      message: "Job updated successfully",
      job
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update job",
      error: error.message
    });
  }
};


// Admin: Close job
const closeJob = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const job = await Company.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    job.status = "closed";

    await job.save();

    res.json({
      message: "Job closed successfully",
      job
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to close job",
      error: error.message
    });
  }
};


// Admin: Reopen job
const reopenJob = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const job = await Company.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    job.status = "open";

    await job.save();

    res.json({
      message: "Job reopened successfully",
      job
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to reopen job",
      error: error.message
    });
  }
};


module.exports = {
  addCompany,
  getCompanies,
  getAllJobs,
  updateJob,
  closeJob,
  reopenJob
};