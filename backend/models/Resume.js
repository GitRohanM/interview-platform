const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalFilename: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  rawText: { type: String },
  targetRole: { type: String, required: true },

  // NLP Extraction results
  extracted: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    skills: [String],
    experience: [String],   // list of job titles / companies
    education: [String],
    totalExperienceYears: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    hasBulletPoints: { type: Boolean, default: false },
    hasQuantifiedAchievements: { type: Boolean, default: false },
    actionVerbsUsed: [String],
  },

  // Scoring
  scores: {
    ats: { type: Number, min: 0, max: 100, default: 0 },
    skills: { type: Number, min: 0, max: 100, default: 0 },
    format: { type: Number, min: 0, max: 100, default: 0 },
    content: { type: Number, min: 0, max: 100, default: 0 },
    overall: { type: Number, min: 0, max: 100, default: 0 },
  },

  // Gap analysis
  matchedSkills: [String],
  missingSkills: [String],

  // AI-generated recommendations
  recommendations: [String],
  aiSummary: { type: String },

  analyzedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Resume', resumeSchema);
