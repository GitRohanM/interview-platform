const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendTokenResponse, verifyRefreshToken, clearRefreshCookie, generateAccessToken } = require('../services/tokenService');
const logger = require('../config/logger');

// ── POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, role });
  logger.info(`New user registered: ${email}`);
  sendTokenResponse(user, 201, res);
};

// ── POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  // Explicitly select password (hidden by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);
  sendTokenResponse(user, 200, res);
};

// ── POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token.', code: 'NO_REFRESH' });
  }

  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'Refresh token expired. Please login again.', code: 'REFRESH_EXPIRED' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'User not found.', code: 'USER_NOT_FOUND' });
  }

  const newAccessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken: newAccessToken });
};

// ── POST /api/auth/logout
const logout = async (req, res) => {
  clearRefreshCookie(res);
  logger.info(`User logged out: ${req.user?.email}`);
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ── GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

module.exports = { register, login, refreshToken, logout, getMe };
