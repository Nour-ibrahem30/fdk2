const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Video = require('../models/Video');
const ExamResult = require('../models/ExamResult');
const Notification = require('../models/Notification');

const router = express.Router();

// الحصول على لوحة تحكم الطالب
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const student = await User.findById(req.user.userId);
    
    // الحصول على آخر النتائج
    const recentResults = await ExamResult.find({ student: req.user.userId })
      .populate('exam', 'title subject')
      .sort({ createdAt: -1 })
      .limit(5);

    // الحصول على الفيديوهات المتاحة للمشاهدة
    const availableVideos = await Video.find({
      grade: student.grade,
      isActive: true
    }).populate('requiredExam', 'title');

    // فلترة الفيديوهات بناءً على نتائج الامتحانات
    const accessibleVideos = [];
    for (const video of availableVideos) {
      const examResult = await ExamResult.findOne({
        student: req.user.userId,
        exam: video.requiredExam._id,
        passed: true
      });
      
      if (examResult) {
        accessibleVideos.push({
          ...video.toObject(),
          canWatch: true,
          examScore: examResult.percentage
        });
      } else {
        accessibleVideos.push({
          ...video.toObject(),
          canWatch: false,
          examScore: null
        });
      }
    }

    // الحصول على الإشعارات غير المقروءة
    const unreadNotifications = await Notification.find({
      recipient: req.user.userId,
      isRead: false
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      student: {
        name: student.name,
        grade: student.grade,
        stats: student.stats
      },
      recentResults,
      availableVideos: accessibleVideos,
      unreadNotifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على إحصائيات الطالب التفصيلية
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const student = await User.findById(req.user.userId);
    
    // إحصائيات الامتحانات
    const examResults = await ExamResult.find({ student: req.user.userId })
      .populate('exam', 'title subject totalPoints');
    
    const examStats = {
      totalExams: examResults.length,
      passedExams: examResults.filter(r => r.passed).length,
      averageScore: examResults.length > 0 
        ? examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length 
        : 0,
      bestScore: examResults.length > 0 
        ? Math.max(...examResults.map(r => r.percentage)) 
        : 0,
      recentPerformance: examResults.slice(-10).map(r => ({
        examTitle: r.exam.title,
        score: r.percentage,
        date: r.createdAt
      }))
    };

    // إحصائيات الفيديوهات
    const watchedVideos = await Video.find({
      'watchStats.student': req.user.userId
    });

    const videoStats = {
      totalVideosWatched: student.stats.totalVideosWatched,
      totalWatchTime: student.stats.totalStudyTime,
      completedVideos: watchedVideos.filter(v => 
        v.watchStats.find(w => w.student.toString() === req.user.userId && w.completed)
      ).length
    };

    res.json({
      examStats,
      videoStats,
      overallStats: student.stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث وقت المشاهدة للفيديو
router.post('/video/:videoId/watch', auth, async (req, res) => {
  try {
    const { watchTime, completed } = req.body;
    const video = await Video.findById(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'الفيديو غير موجود' });
    }

    // التحقق من إمكانية مشاهدة الفيديو
    const examResult = await ExamResult.findOne({
      student: req.user.userId,
      exam: video.requiredExam,
      passed: true
    });

    if (!examResult) {
      return res.status(403).json({ message: 'يجب اجتياز الامتحان أولاً' });
    }

    // تحديث إحصائيات المشاهدة
    const existingWatch = video.watchStats.find(
      w => w.student.toString() === req.user.userId
    );

    if (existingWatch) {
      existingWatch.watchTime = Math.max(existingWatch.watchTime, watchTime);
      existingWatch.completed = completed || existingWatch.completed;
      existingWatch.lastWatched = new Date();
    } else {
      video.watchStats.push({
        student: req.user.userId,
        watchTime,
        completed,
        lastWatched: new Date()
      });
    }

    await video.save();

    // تحديث إحصائيات الطالب
    const student = await User.findById(req.user.userId);
    if (completed && !existingWatch?.completed) {
      student.stats.totalVideosWatched += 1;
    }
    student.stats.totalStudyTime += Math.max(0, watchTime - (existingWatch?.watchTime || 0));
    await student.save();

    res.json({ message: 'تم تحديث إحصائيات المشاهدة' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;