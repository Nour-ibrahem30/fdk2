const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // بالثواني
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  lesson: {
    type: String,
    required: true
  },
  // الامتحان المطلوب لمشاهدة الفيديو
  requiredExam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  // الحد الأدنى للدرجة لمشاهدة الفيديو
  minimumScore: {
    type: Number,
    default: 70
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  // إحصائيات المشاهدة
  watchStats: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    watchTime: { type: Number, default: 0 }, // الوقت المشاهد بالثواني
    completed: { type: Boolean, default: false },
    lastWatched: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);