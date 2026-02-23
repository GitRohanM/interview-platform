const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/aiService');
const logger = require('../config/logger');

// Role → required skills mapping (used for gap analysis)
const ROLE_SKILLS = {
  'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Redux', 'Webpack', 'Git', 'REST API', 'Performance Optimization'],
  'Backend Engineer': ['Node.js', 'Python', 'Java', 'SQL', 'REST API', 'Microservices', 'Docker', 'Redis', 'MongoDB', 'Git'],
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'SQL', 'MongoDB', 'Docker', 'Git', 'REST API', 'TypeScript', 'AWS'],
  'Data Scientist': ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Statistics', 'NLP', 'PyTorch', 'Scikit-learn'],
  'ML Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes', 'Docker', 'MLflow', 'SQL', 'Spark', 'Scala', 'CI/CD'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'AWS', 'Terraform', 'Linux', 'Python', 'Ansible', 'Git'],
  'Android Developer': ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'MVVM', 'Retrofit', 'Room DB', 'Git', 'Firebase', 'REST API'],
  'Cloud Architect': ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD', 'Security', 'Networking', 'Cost Optimization'],
  'Product Manager': ['Product Strategy', 'Agile', 'Jira', 'Analytics', 'SQL', 'A/B Testing', 'Roadmapping', 'Stakeholder Management', 'User Research', 'PRD'],
  'System Design': ['Distributed Systems', 'Microservices', 'Load Balancing', 'Caching', 'Databases', 'Message Queues', 'API Design', 'Scalability', 'CAP Theorem', 'Kafka'],
};

// ── POST /api/resume/analyze
const analyzeResumeFile = async (req, res) => {
  const { targetRole } = req.body;

  if (!targetRole) {
    return res.status(400).json({ success: false, message: 'Target role is required.' });
  }

  let resumeText = '';
  let fileInfo = {};

  // Handle file upload
  if (req.file) {
    const filePath = req.file.path;
    fileInfo = {
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    try {
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        resumeText = pdfData.text;
      } else {
        // Plain text file
        resumeText = fs.readFileSync(filePath, 'utf-8');
      }
    } finally {
      // Clean up uploaded file after reading
      fs.unlink(filePath, () => {});
    }
  } else if (req.body.resumeText) {
    // Direct text paste
    resumeText = req.body.resumeText;
  } else {
    return res.status(400).json({ success: false, message: 'Please upload a file or paste resume text.' });
  }

  if (!resumeText.trim()) {
    return res.status(400).json({ success: false, message: 'Could not extract text from file. Please paste text directly.' });
  }

  const requiredSkills = ROLE_SKILLS[targetRole] || ROLE_SKILLS['Full Stack Developer'];

  // ── Call Claude AI for deep analysis
  const aiResult = await analyzeResume(resumeText, targetRole, requiredSkills);

  // Save to database
  const resume = await Resume.create({
    user: req.user._id,
    targetRole,
    rawText: resumeText.substring(0, 10000), // Cap stored text
    ...fileInfo,
    extracted: aiResult.extracted,
    scores: aiResult.scores,
    matchedSkills: aiResult.matchedSkills,
    missingSkills: aiResult.missingSkills,
    recommendations: aiResult.recommendations,
    aiSummary: aiResult.aiSummary,
    analyzedAt: new Date(),
  });

  logger.info(`Resume analyzed for user ${req.user._id}, ATS score: ${aiResult.scores.overall}`);

  res.status(201).json({
    success: true,
    analysis: {
      _id: resume._id,
      targetRole,
      scores: aiResult.scores,
      extracted: aiResult.extracted,
      matchedSkills: aiResult.matchedSkills,
      missingSkills: aiResult.missingSkills,
      recommendations: aiResult.recommendations,
      aiSummary: aiResult.aiSummary,
    },
  });
};

// ── GET /api/resume/history
const getResumeHistory = async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-rawText')
    .lean();

  res.json({ success: true, resumes });
};

module.exports = { analyzeResumeFile, getResumeHistory, ROLE_SKILLS };
