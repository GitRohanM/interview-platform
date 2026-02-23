const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: { type: String, required: true },
  category: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  userAnswer: { type: String, default: '' },
  answerMode: { type: String, enum: ['text', 'voice'], default: 'text' },
  // AI Evaluation results
  evaluation: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    clarity: { type: Number, min: 0, max: 100, default: 0 },
    depth: { type: Number, min: 0, max: 100, default: 0 },
    relevance: { type: Number, min: 0, max: 100, default: 0 },
    sentiment: { type: String, default: 'Not evaluated' },
    feedback: { type: String, default: '' },
    strengths: [String],
    improvements: [String],
    keywordsMatched: [String],
    keywordsMissed: [String],
    modelUsed: { type: String, default: 'claude-haiku-4-5-20251001' },
    evaluatedAt: { type: Date },
  },
  timeSpent: { type: Number, default: 0 }, // seconds
  skipped: { type: Boolean, default: false },
});

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
    default: 'Mixed',
  },
  mode: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
  answers: [answerSchema],
  // Computed on completion
  summary: {
    totalQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    avgClarity: { type: Number, default: 0 },
    avgDepth: { type: Number, default: 0 },
    avgRelevance: { type: Number, default: 0 },
    topCategory: { type: String, default: '' },
    weakestCategory: { type: String, default: '' },
    grade: { type: String, default: '' }, // A, B, C, D, F
    passed: { type: Boolean, default: false },
    totalTimeSpent: { type: Number, default: 0 },
  },
  completedAt: { type: Date },
}, {
  timestamps: true,
});

// ── Compute summary before saving completed session
sessionSchema.methods.computeSummary = function () {
  const answered = this.answers.filter(a => !a.skipped && a.userAnswer);
  if (!answered.length) return;

  const scores = answered.map(a => a.evaluation.score);
  const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  this.summary.totalQuestions = this.answers.length;
  this.summary.answeredQuestions = answered.length;
  this.summary.avgScore = avg(scores);
  this.summary.avgClarity = avg(answered.map(a => a.evaluation.clarity));
  this.summary.avgDepth = avg(answered.map(a => a.evaluation.depth));
  this.summary.avgRelevance = avg(answered.map(a => a.evaluation.relevance));
  this.summary.totalTimeSpent = this.answers.reduce((a, b) => a + (b.timeSpent || 0), 0);
  this.summary.passed = this.summary.avgScore >= 60;

  const s = this.summary.avgScore;
  this.summary.grade = s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 70 ? 'B' : s >= 60 ? 'C' : s >= 50 ? 'D' : 'F';

  // Find top and weakest categories
  const catScores = {};
  answered.forEach(a => {
    if (!catScores[a.category]) catScores[a.category] = [];
    catScores[a.category].push(a.evaluation.score);
  });
  const catAvgs = Object.entries(catScores).map(([cat, scores]) => ({ cat, avg: avg(scores) }));
  if (catAvgs.length) {
    catAvgs.sort((a, b) => b.avg - a.avg);
    this.summary.topCategory = catAvgs[0].cat;
    this.summary.weakestCategory = catAvgs[catAvgs.length - 1].cat;
  }

  this.status = 'completed';
  this.completedAt = new Date();
};

module.exports = mongoose.model('Session', sessionSchema);
