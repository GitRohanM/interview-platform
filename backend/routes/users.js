const express = require('express');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { updateProfile, changePassword, askCoach } = require('../controllers/userController');

const router = express.Router();
router.use(protect);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/coach', aiLimiter, askCoach);

module.exports = router;
