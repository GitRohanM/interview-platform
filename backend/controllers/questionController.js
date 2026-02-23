const Question = require('../models/Question');
const { coachResponse } = require('../services/aiService');

// ── GET /api/questions
const getQuestions = async (req, res) => {
  const { role, difficulty, category, search, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  if (role) query.role = role;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const questions = await Question.find(query)
    .sort({ difficulty: 1, timesAsked: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-sampleAnswer -__v')
    .lean();

  const total = await Question.countDocuments(query);

  // Get unique categories for filters
  const categories = await Question.distinct('category', { isActive: true, ...(role && { role }) });

  res.json({
    success: true,
    questions,
    categories,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
};

// ── GET /api/questions/roles
const getRoles = async (req, res) => {
  const roles = await Question.distinct('role', { isActive: true });
  res.json({ success: true, roles });
};

module.exports = { getQuestions, getRoles };
