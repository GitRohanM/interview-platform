const Session = require('../models/Session');
const Question = require('../models/Question');
const { evaluateAnswer, generateFollowUp } = require('../services/aiService');
const logger = require('../config/logger');

// ── POST /api/interviews/start
// Create a new session and fetch questions
const startSession = async (req, res) => {
  const { role, difficulty, count = 5, mode = 'text' } = req.body;

  if (!role) {
    return res.status(400).json({ success: false, message: 'Role is required.' });
  }

  // Build query for questions
  const query = { role, isActive: true };
  if (difficulty && difficulty !== 'Mixed') query.difficulty = difficulty;

  // Fetch questions and randomize
  let questions = await Question.find(query).lean();

  if (questions.length === 0) {
    // Fallback: any questions for similar roles
    questions = await Question.find({ isActive: true }).limit(count * 2).lean();
  }

  // Shuffle and limit
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, Math.min(count, questions.length));

  // Create session
  const session = await Session.create({
    user: req.user._id,
    role,
    difficulty: difficulty || 'Mixed',
    mode,
    answers: shuffled.map(q => ({
      questionId: q._id,
      questionText: q.text,
      category: q.category,
      difficulty: q.difficulty,
    })),
  });

  logger.info(`Interview session started: ${session._id} by user ${req.user._id}`);

  res.status(201).json({
    success: true,
    sessionId: session._id,
    questions: shuffled.map(q => ({
      _id: q._id,
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
      followUp: q.followUp,
    })),
    totalQuestions: shuffled.length,
  });
};

// ── POST /api/interviews/:sessionId/answer
// Submit and evaluate a single answer using Claude AI
const submitAnswer = async (req, res) => {
  const { sessionId } = req.params;
  const { questionIndex, answer, timeSpent = 0, mode = 'text' } = req.body;

  const session = await Session.findOne({ _id: sessionId, user: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  if (session.status !== 'in_progress') {
    return res.status(400).json({ success: false, message: 'Session already completed.' });
  }

  const answerDoc = session.answers[questionIndex];
  if (!answerDoc) {
    return res.status(400).json({ success: false, message: 'Invalid question index.' });
  }

  // Fetch key concepts from Question model for better AI evaluation
  const questionDoc = await Question.findById(answerDoc.questionId).lean();
  const keyConcepts = questionDoc?.keyConcepts || [];

  // ── Call Claude AI to evaluate the answer
  const evaluation = await evaluateAnswer(
    answerDoc.questionText,
    answer,
    session.role,
    keyConcepts
  );

  // Update answer in session
  session.answers[questionIndex].userAnswer = answer;
  session.answers[questionIndex].answerMode = mode;
  session.answers[questionIndex].timeSpent = timeSpent;
  session.answers[questionIndex].evaluation = evaluation;

  await session.save();

  // Update question usage stats (fire and forget)
  if (questionDoc) {
    Question.findByIdAndUpdate(answerDoc.questionId, {
      $inc: { timesAsked: 1 },
      $set: { avgScore: Math.round((questionDoc.avgScore * questionDoc.timesAsked + evaluation.score) / (questionDoc.timesAsked + 1)) },
    }).exec().catch(() => {});
  }

  res.json({
    success: true,
    evaluation,
    questionIndex,
  });
};

// ── POST /api/interviews/:sessionId/complete
// Finalize session, compute summary, update user stats
const completeSession = async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findOne({ _id: sessionId, user: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  // Compute summary using model method
  session.computeSummary();
  await session.save();

  // Update user's aggregate stats
  await req.user.updateStats(session.summary.avgScore, session.summary.answeredQuestions);

  logger.info(`Session completed: ${sessionId}, Score: ${session.summary.avgScore}`);

  res.json({
    success: true,
    summary: session.summary,
    sessionId: session._id,
  });
};

// ── GET /api/interviews/sessions
// Get all sessions for current user
const getSessions = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const sessions = await Session.find({ user: req.user._id, status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-answers') // Don't send full answer data in list view
    .lean();

  const total = await Session.countDocuments({ user: req.user._id, status: 'completed' });

  res.json({
    success: true,
    sessions,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
};

// ── GET /api/interviews/sessions/:sessionId
// Get full session details with all answers
const getSessionById = async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  res.json({ success: true, session });
};

// ── POST /api/interviews/followup
// Generate AI follow-up question
const getFollowUp = async (req, res) => {
  const { question, answer } = req.body;
  const followUp = await generateFollowUp(question, answer, req.user.role);
  res.json({ success: true, followUp });
};

module.exports = { startSession, submitAnswer, completeSession, getSessions, getSessionById, getFollowUp };
