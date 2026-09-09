const User = require("../models/User");

// Get logged-in student's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Profile fetched successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

// Update logged-in student's profile
const updateProfile = async (req, res) => {
  try {
    const { name, cgpa, skills, resumeLink } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    if (name !== undefined) user.name = name;
    if (cgpa !== undefined) user.cgpa = cgpa;
    if (skills !== undefined) user.skills = skills;
    if (resumeLink !== undefined) user.resumeLink = resumeLink;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cgpa: user.cgpa,
        skills: user.skills,
        resumeLink: user.resumeLink
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};