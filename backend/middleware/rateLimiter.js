const rateLimit = require('express-rate-limit');

// ── General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

// ── Strict limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes.',
    code: 'AUTH_RATE_LIMITED',
  },
});

// ── AI endpoint limiter (expensive operations)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a moment.',
    code: 'AI_RATE_LIMITED',
  },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
