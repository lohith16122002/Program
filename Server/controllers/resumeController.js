const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const analyzeResume = require("../utils/analyzeResume");

const uploadResume = async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload a PDF resume" });
    const { jobDescription } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: "Job description is required" });
    }
    if (jobDescription.trim().length < 50) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: "Job description is too short. Please paste the full job description." });
    }
    const existing = await Resume.findOne({ user: req.user._id, originalName: req.file.originalname, jobDescription: jobDescription.trim() });
    if (existing) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(200).json({ success: true, message: "Analysis already exists", resume: existing, duplicate: true });
    }
    let extractedText = "";
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = (pdfData.text || "").trim();
    } catch (pdfErr) {
      console.error("[PDF PARSE ERROR]", pdfErr.message);
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: "Could not read your PDF. Make sure it is a text-based PDF, not a scanned image." });
    }
    if (!extractedText || extractedText.length < 100) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: "Your PDF appears to be empty or is a scanned image. Please upload a text-based PDF." });
    }
    const { atsScore, matchedSkills, missingSkills, suggestions, aiSummary, aiPowered } = await analyzeResume(extractedText, jobDescription.trim());
    const resume = await Resume.create({ user: req.user._id, originalName: req.file.originalname, fileName: req.file.filename, filePath, extractedText, jobDescription: jobDescription.trim(), atsScore, matchedSkills, missingSkills, suggestions, aiSummary });
    return res.status(201).json({ success: true, message: "Analysis complete", resume, aiPowered });
  } catch (error) {
    console.error("[UPLOAD ERROR]", error.message);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({ success: false, message: "Analysis failed. Please try again." });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const [resumes, total] = await Promise.all([
      Resume.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      Resume.countDocuments({ user: req.user._id })
    ]);
    res.status(200).json({ success: true, resumes, total, page, pages: Math.ceil(total/limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.status(200).json({ success: true, resume });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid resume ID" });
    res.status(500).json({ success: false, message: "Failed to fetch resume" });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    if (resume.filePath && fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    await resume.deleteOne();
    res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid resume ID" });
    res.status(500).json({ success: false, message: "Failed to delete resume" });
  }
};

module.exports = { uploadResume, getMyResumes, getResumeById, deleteResume };
