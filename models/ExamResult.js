const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed, // يمكن أن يكون نص أو رقم أو مصفوفة
    isCorrect: Boolean,
    points: Number
  }],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // بالثواني
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// فهرس مركب لضمان عدم تكرار النتائج
examResultSchema.index({ student: 1, exam: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', examResultSchema);