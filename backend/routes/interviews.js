const express = require('express');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  startSession, submitAnswer, completeSession,
  getSessions, getSessionById, getFollowUp
} = require('../controllers/interviewController');

const router = express.Router();

router.use(protect); // All interview routes require auth

router.post('/start', startSession);
router.post('/:sessionId/answer', aiLimiter, submitAnswer);
router.post('/:sessionId/complete', completeSession);
router.post('/followup', aiLimiter, getFollowUp);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getSessionById);

module.exports = router;
