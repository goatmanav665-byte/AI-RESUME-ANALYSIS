const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    resumeText: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    atsScore: {
      type: Number,
      required: true,
    },
    matchingSkills: [
      {
        type: String,
      },
    ],
    missingKeywords: [
      {
        type: String,
      },
    ],
    improvementSuggestions: [
      {
        type: String,
      },
    ],
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Analysis", analysisSchema);
