const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  role: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true,
  },
  followUp: { type: String, default: '' },
  // Key concepts the AI should look for in answers
  keyConcepts: [String],
  // Sample strong answer for reference (not shown to users)
  sampleAnswer: { type: String, default: '' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  // Usage stats
  timesAsked: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Text index for search
questionSchema.index({ text: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);
