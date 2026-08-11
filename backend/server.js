require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse-fork");
const { GoogleGenAI, Type } = require("@google/genai");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Rate Limiter: Max 10 audit requests per 15 minutes per IP (protects Gemini quota)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many audit requests from this IP. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// File Upload Handler (Strict 5MB Limit + PDF Mime Check)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only standard PDF files are allowed."));
    }
  },
});

// MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

// Enhanced Analysis Schema
const AnalysisSchema = new mongoose.Schema({
  userId: { type: String, default: "anonymous_user", index: true },
  resumeFileName: { type: String, required: true },
  matchScore: { type: Number, required: true },
  skillsScore: { type: Number, required: true },
  experienceScore: { type: Number, required: true },
  summary: { type: String, required: true },
  matchingSkills: [String],
  missingKeywords: [String],
  actionableImprovements: [String],
  createdAt: { type: Date, default: Date.now, index: -1 },
});

const Analysis = mongoose.model("Analysis", AnalysisSchema);

// GenAI SDK Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Input Validation Schema
const jobDescriptionSchema = z.string().min(20, "Job description must be at least 20 characters long.");

// 1. Analyze Resume Endpoint
app.post("/api/analyze", analyzeLimiter, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF resume file uploaded." });
    }

    // Validate Job Description Body
    const validation = jobDescriptionSchema.safeParse(req.body.jobDescription);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const jobDescription = validation.data;

    // Safely Extract Text from PDF Buffer
    let resumeText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } catch (pdfErr) {
      console.warn("PDF Extraction Warning:", pdfErr.message);
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        error: "Could not extract readable text from PDF. Ensure it is not an image-only scan.",
      });
    }

    // Call Gemini API with Structured Output Schema
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          text: `You are an enterprise Applicant Tracking System (ATS) engine.
          Analyze the following candidate resume against the target Job Description.

          --- RESUME ---
          ${resumeText}

          --- JOB DESCRIPTION ---
          ${jobDescription}`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            skillsScore: { type: Type.INTEGER },
            experienceScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "matchScore",
            "skillsScore",
            "experienceScore",
            "summary",
            "matchingSkills",
            "missingKeywords",
            "actionableImprovements",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text);

    // Save Analysis Record to Database
    const recordData = {
      ...parsedResult,
      resumeFileName: req.file.originalname,
      userId: req.headers["x-user-id"] || "anonymous_user",
    };

    let savedRecord = null;
    if (mongoose.connection.readyState === 1) {
      savedRecord = await Analysis.create(recordData);
    }

    return res.status(200).json({
      id: savedRecord?._id || null,
      ...parsedResult,
    });
  } catch (error) {
    console.error("Analysis Pipeline Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process resume audit." });
  }
});

// 2. Fetch Audit History Endpoint
app.get("/api/history", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || "anonymous_user";
    const history = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-__v");

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve history." });
  }
});

// 3. Delete Saved Audit Endpoint
app.delete("/api/history/:id", async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Record deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete record." });
  }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File Upload Error: ${err.message}` });
  }
  return res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Production-ready server running on port ${PORT}`));