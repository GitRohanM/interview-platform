const Session = require('../models/Session');
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// ── GET /api/analytics/overview
const getOverview = async (req, res) => {
  const userId = req.user._id;

  // Aggregate session data
  const sessionStats = await Session.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgScore: { $avg: '$summary.avgScore' },
        bestScore: { $max: '$summary.avgScore' },
        totalQuestions: { $sum: '$summary.answeredQuestions' },
        totalTimeSpent: { $sum: '$summary.totalTimeSpent' },
      }
    }
  ]);

  // Score trend — last 7 sessions
  const recentSessions = await Session.find({ user: userId, status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(7)
    .select('summary.avgScore completedAt role')
    .lean();

  // Score by role
  const rolePerformance = await Session.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$role',
        avgScore: { $avg: '$summary.avgScore' },
        count: { $sum: 1 },
      }
    },
    { $sort: { avgScore: -1 } }
  ]);

  // Score by difficulty
  const difficultyPerformance = await Session.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$difficulty',
        avgScore: { $avg: '$summary.avgScore' },
        count: { $sum: 1 },
      }
    }
  ]);

  // Category performance — from individual answers
  const categoryPerformance = await Session.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    { $unwind: '$answers' },
    { $match: { 'answers.userAnswer': { $ne: '' } } },
    {
      $group: {
        _id: '$answers.category',
        avgScore: { $avg: '$answers.evaluation.score' },
        count: { $sum: 1 },
        avgClarity: { $avg: '$answers.evaluation.clarity' },
        avgDepth: { $avg: '$answers.evaluation.depth' },
      }
    },
    { $sort: { avgScore: -1 } },
    { $limit: 10 }
  ]);

  // Latest resume score
  const latestResume = await Resume.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .select('scores targetRole analyzedAt')
    .lean();

  const stats = sessionStats[0] || {
    totalSessions: 0, avgScore: 0, bestScore: 0, totalQuestions: 0, totalTimeSpent: 0
  };

  res.json({
    success: true,
    overview: {
      totalSessions: stats.totalSessions,
      avgScore: Math.round(stats.avgScore || 0),
      bestScore: Math.round(stats.bestScore || 0),
      totalQuestions: stats.totalQuestions || 0,
      totalTimeSpent: stats.totalTimeSpent || 0,
    },
    scoreTrend: recentSessions.reverse().map(s => ({
      date: new Date(s.completedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      score: Math.round(s.summary.avgScore),
      role: s.role,
    })),
    rolePerformance: rolePerformance.map(r => ({
      role: r._id,
      avgScore: Math.round(r.avgScore),
      count: r.count,
    })),
    difficultyPerformance: difficultyPerformance.map(d => ({
      difficulty: d._id,
      avgScore: Math.round(d.avgScore),
      count: d.count,
    })),
    categoryPerformance: categoryPerformance.map(c => ({
      category: c._id,
      avgScore: Math.round(c.avgScore),
      count: c.count,
      avgClarity: Math.round(c.avgClarity),
      avgDepth: Math.round(c.avgDepth),
    })),
    latestResume,
  });
};

// ── GET /api/analytics/sessions
// Paginated session history with full details
const getSessionHistory = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const sessions = await Session.find({ user: userId, status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('role difficulty summary completedAt createdAt mode')
    .lean();

  const total = await Session.countDocuments({ user: userId, status: 'completed' });

  res.json({
    success: true,
    sessions,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
};

module.exports = { getOverview, getSessionHistory };
