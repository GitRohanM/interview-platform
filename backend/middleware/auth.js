const User = require('../models/User');
const { verifyAccessToken } = require('../services/tokenService');
const logger = require('../config/logger');

/**
 * Protect routes — verify JWT access token from Authorization header.
 * Usage: router.get('/protected', protect, controller)
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      code: 'NO_TOKEN',
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please login again.',
      code: 'TOKEN_EXPIRED',
    });
  }

  try {
    // Attach full user to request (excluding password)
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

module.exports = { protect };
