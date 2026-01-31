const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  phone: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // إحصائيات الطالب
  stats: {
    totalVideosWatched: { type: Number, default: 0 },
    totalExamsTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 }, // بالدقائق
    streak: { type: Number, default: 0 }, // أيام متتالية من الدراسة
    lastStudyDate: { type: Date }
  },
  // الإشعارات
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    newVideo: { type: Boolean, default: true },
    newNote: { type: Boolean, default: true },
    examReminder: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);