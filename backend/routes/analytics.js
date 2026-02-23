// ─── routes/analytics.js ─────────────────────────────────────
const express = require('express');
const { protect } = require('../middleware/auth');
const { getOverview, getSessionHistory } = require('../controllers/analyticsController');

const aRouter = express.Router();
aRouter.use(protect);
aRouter.get('/overview', getOverview);
aRouter.get('/sessions', getSessionHistory);

module.exports = aRouter;
