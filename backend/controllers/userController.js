const User = require('../models/User');
const { coachResponse } = require('../services/aiService');

// ── PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, role, bio, github, linkedin, targetCompanies } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, role, bio, github, linkedin, targetCompanies },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
};

// ── PUT /api/users/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully.' });
};

// ── POST /api/users/coach
const askCoach = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  const reply = await coachResponse(message, history, req.user.role);
  res.json({ success: true, reply });
};

module.exports = { updateProfile, changePassword, askCoach };
