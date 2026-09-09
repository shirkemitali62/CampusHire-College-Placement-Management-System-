const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: "Not specified"
    },

    package: {
      type: Number,
      required: true
    },

    minimumCGPA: {
      type: Number,
      default: 0
    },

    requiredSkills: {
      type: [String],
      default: []
    },

    applicationDeadline: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Company", companySchema);