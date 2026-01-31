const express = require('express');
const { auth, teacherAuth } = require('../middleware/auth');
const User = require('../models/User');
const Video = require('../models/Video');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Note = require('../models/Note');
const Notification = require('../models/Notification');

const router = express.Router();

// لوحة تحكم المدرس
router.get('/dashboard', auth, teacherAuth, async (req, res) => {
  try {
    // إحصائيات عامة
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalVideos = await Video.countDocuments({ createdBy: req.user.userId });
    const totalExams = await Exam.countDocuments({ createdBy: req.user.userId });
    const totalNotes = await Note.countDocuments({ createdBy: req.user.userId });

    // الطلاب النشطين (دخلوا خلال آخر 7 أيام)
    const activeStudents = await User.countDocuments({
      role: 'student',
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // آخر نتائج الامتحانات
    const recentResults = await ExamResult.find()
      .populate('student', 'name grade')
      .populate('exam', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // إحصائيات الأداء
    const performanceStats = await ExamResult.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          passedAttempts: {
            $sum: { $cond: ['$passed', 1, 0] }
          }
        }
      }
    ]);

    res.json({
      stats: {
        totalStudents,
        activeStudents,
        totalVideos,
        totalExams,
        totalNotes,
        averageScore: performanceStats[0]?.averageScore || 0,
        passRate: performanceStats[0] 
          ? (performanceStats[0].passedAttempts / performanceStats[0].totalAttempts) * 100 
          : 0
      },
      recentResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على قائمة الطلاب
router.get('/students', auth, teacherAuth, async (req, res) => {
  try {
    const { grade, search, page = 1, limit = 20 } = req.query;
    
    let query = { role: 'student' };
    
    if (grade) query.grade = grade;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // إضافة إحصائيات لكل طالب
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const examResults = await ExamResult.find({ student: student._id });
        const videosWatched = await Video.countDocuments({
          'watchStats.student': student._id,
          'watchStats.completed': true
        });

        return {
          ...student.toObject(),
          examStats: {
            totalExams: examResults.length,
            averageScore: examResults.length > 0 
              ? examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length 
              : 0,
            passedExams: examResults.filter(r => r.passed).length
          },
          videosWatched
        };
      })
    );

    res.json({
      students: studentsWithStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على تفاصيل طالب محدد
router.get('/students/:studentId', auth, teacherAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'الطالب غير موجود' });
    }

    // نتائج الامتحانات
    const examResults = await ExamResult.find({ student: student._id })
      .populate('exam', 'title subject totalPoints')
      .sort({ createdAt: -1 });

    // الفيديوهات المشاهدة
    const watchedVideos = await Video.find({
      'watchStats.student': student._id
    }).select('title subject watchStats');

    const videoProgress = watchedVideos.map(video => {
      const watchStat = video.watchStats.find(
        w => w.student.toString() === student._id.toString()
      );
      return {
        title: video.title,
        subject: video.subject,
        watchTime: watchStat.watchTime,
        completed: watchStat.completed,
        lastWatched: watchStat.lastWatched
      };
    });

    res.json({
      student,
      examResults,
      videoProgress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إرسال إشعار لطالب محدد
router.post('/students/:studentId/notify', auth, teacherAuth, async (req, res) => {
  try {
    const { title, message, type = 'system' } = req.body;
    
    const notification = new Notification({
      recipient: req.params.studentId,
      title,
      message,
      type
    });

    await notification.save();

    // إرسال إشعار فوري عبر Socket.io
    const io = req.app.get('io');
    io.to(req.params.studentId).emit('notification', {
      title,
      message,
      type,
      createdAt: notification.createdAt
    });

    res.json({ message: 'تم إرسال الإشعار بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;