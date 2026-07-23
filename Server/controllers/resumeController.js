const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const analyzeResume = require("../utils/analyzeResume");

// POST /api/resume/upload
const uploadResume = async (req, res) => {
  const filePath = req.file ? req.file.path : null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF resume" });
    }

    const { jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: "Job description is required" });
    }

    if (jobDescription.trim().length < 50) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Job description is too short. Please paste the full job description.",
      });
    }

    // Duplicate check
    const existing = await Resume.findOne({
      user: req.user._id,
      originalName: req.file.originalname,
      jobDescription: jobDescription.trim(),
    });

    if (existing) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(200).json({
        success: true,
        message: "Analysis already exists",
        resume: existing,
        duplicate: true,
      });
    }

    // Extract text from PDF
    let extractedText = "";
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = (pdfData.text || "").trim();
    } catch (pdfErr) {
      console.error("[PDF PARSE ERROR]", pdfErr.message);
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Could not read your PDF. Make sure it is a text-based PDF, not a scanned image.",
      });
    }

    if (!extractedText || extractedText.length < 100) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Your PDF appears to be empty or is a scanned image. Please upload a text-based PDF.",
      });
    }

    // Resume content validation — reject invoices, certificates, random docs
    const resumeKeywords = [
      "experience", "education", "skills", "work", "employment", "project",
      "university", "college", "degree", "bachelor", "master", "internship",
      "objective", "summary", "profile", "certification", "achievement",
      "responsibility", "qualification", "career", "job", "position", "role",
      "resume", "curriculum vitae", "cv",
    ];
    const lowerText = extractedText.toLowerCase();
    const keywordMatches = resumeKeywords.filter((kw) => lowerText.includes(kw));
    if (keywordMatches.length < 2) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "This doesn't look like a resume. Please upload your CV or resume PDF.",
      });
    }

    // Run analysis
    const { atsScore, matchedSkills, missingSkills, suggestions, aiSummary, aiPowered } =
      await analyzeResume(extractedText, jobDescription.trim());

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath,
      extractedText,
      jobDescription: jobDescription.trim(),
      atsScore,
      matchedSkills,
      missingSkills,
      suggestions,
      aiSummary,
    });

    return res.status(201).json({ success: true, message: "Analysis complete", resume, aiPowered });

  } catch (error) {
    console.error("[UPLOAD ERROR]", error.message);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({ success: false, message: "Analysis failed. Please try again." });
  }
};

// GET /api/resume/my-resumes
const getMyResumes = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      Resume.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Resume.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      resumes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET RESUMES ERROR]", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
};

// GET /api/resume/:id
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    res.status(200).json({ success: true, resume });
  } catch (error) {
    console.error("[GET RESUME ERROR]", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid resume ID" });
    }
    res.status(500).json({ success: false, message: "Failed to fetch resume" });
  }
};

// DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
    await resume.deleteOne();
    res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    console.error("[DELETE ERROR]", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid resume ID" });
    }
    res.status(500).json({ success: false, message: "Failed to delete resume" });
  }
};

module.exports = { uploadResume, getMyResumes, getResumeById, deleteResume };
