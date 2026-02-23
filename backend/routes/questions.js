// ─── routes/questions.js ─────────────────────────────────────
const express = require('express');
const { protect } = require('../middleware/auth');
const { getQuestions, getRoles } = require('../controllers/questionController');

const qRouter = express.Router();
qRouter.use(protect);
qRouter.get('/', getQuestions);
qRouter.get('/roles', getRoles);

module.exports = qRouter;
