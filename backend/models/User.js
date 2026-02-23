const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Never return password in queries by default
  },
  role: {
    type: String,
    enum: [
      'Frontend Developer', 'Backend Engineer', 'Full Stack Developer',
      'Data Scientist', 'ML Engineer', 'DevOps Engineer',
      'Product Manager', 'Android Developer', 'System Design', 'Cloud Architect'
    ],
    default: 'Full Stack Developer',
  },
  bio: { type: String, maxlength: 500, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  targetCompanies: { type: String, default: '' },
  avatar: { type: String, default: '' }, // URL or initials
  refreshToken: { type: String, select: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  // Aggregated stats (updated on session completion)
  stats: {
    totalSessions: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
  },
}, {
  timestamps: true, // adds createdAt, updatedAt automatically
});

// ── Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Update stats helper
userSchema.methods.updateStats = async function (sessionScore, questionsCount) {
  const total = this.stats.totalSessions;
  this.stats.avgScore = Math.round(
    (this.stats.avgScore * total + sessionScore) / (total + 1)
  );
  this.stats.bestScore = Math.max(this.stats.bestScore, sessionScore);
  this.stats.totalSessions += 1;
  this.stats.totalQuestions += questionsCount;
  await this.save();
};

// ── Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
