const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, teacherAuth } = require('../middleware/auth');
const Video = require('../models/Video');
const ExamResult = require('../models/ExamResult');
const Notification = require('../models/Notification');
const User = require('../models/User');

const router = express.Router();

// إعداد multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

// الحصول على جميع الفيديوهات (للطلاب)
router.get('/', auth, async (req, res) => {
  try {
    const { grade, subject, chapter } = req.query;
    
    let query = { isActive: true };
    
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.userId);
      query.grade = student.grade;
    }
    
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;
    if (chapter) query.chapter = chapter;

    const videos = await Video.find(query)
      .populate('requiredExam', 'title passingScore')
      .sort({ createdAt: -1 });

    // للطلاب: التحقق من إمكانية المشاهدة
    if (req.user.role === 'student') {
      const videosWithAccess = await Promise.all(
        videos.map(async (video) => {
          const examResult = await ExamResult.findOne({
            student: req.user.userId,
            exam: video.requiredExam._id,
            passed: true
          });

          const watchStat = video.watchStats.find(
            w => w.student.toString() === req.user.userId
          );

          return {
            ...video.toObject(),
            canWatch: !!examResult,
            examScore: examResult?.percentage || null,
            watchProgress: watchStat ? {
              watchTime: watchStat.watchTime,
              completed: watchStat.completed,
              lastWatched: watchStat.lastWatched
            } : null
          };
        })
      );
      
      return res.json(videosWithAccess);
    }

    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على فيديو محدد
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('requiredExam', 'title passingScore')
      .populate('createdBy', 'name');

    if (!video) {
      return res.status(404).json({ message: 'الفيديو غير موجود' });
    }

    // للطلاب: التحقق من إمكانية المشاهدة
    if (req.user.role === 'student') {
      const examResult = await ExamResult.findOne({
        student: req.user.userId,
        exam: video.requiredExam._id,
        passed: true
      });

      if (!examResult) {
        return res.status(403).json({ 
          message: 'يجب اجتياز الامتحان أولاً',
          requiredExam: video.requiredExam
        });
      }

      // زيادة عدد المشاهدات
      video.views += 1;
      await video.save();
    }

    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إضافة فيديو جديد (للمدرس فقط)
router.post('/', auth, teacherAuth, upload.single('video'), async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      grade,
      chapter,
      lesson,
      requiredExam,
      minimumScore,
      duration
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'يجب رفع ملف الفيديو' });
    }

    const video = new Video({
      title,
      description,
      videoUrl: req.file.path,
      subject,
      grade,
      chapter,
      lesson,
      requiredExam,
      minimumScore: minimumScore || 70,
      duration,
      createdBy: req.user.userId
    });

    await video.save();

    // إرسال إشعارات للطلاب المناسبين
    const targetStudents = await User.find({
      role: 'student',
      grade: grade,
      'notificationSettings.newVideo': true
    });

    const notifications = targetStudents.map(student => ({
      recipient: student._id,
      title: 'فيديو جديد متاح',
      message: `تم إضافة فيديو جديد: ${title}`,
      type: 'video',
      data: { videoId: video._id }
    }));

    await Notification.insertMany(notifications);

    // إرسال إشعارات فورية
    const io = req.app.get('io');
    targetStudents.forEach(student => {
      io.to(student._id.toString()).emit('notification', {
        title: 'فيديو جديد متاح',
        message: `تم إضافة فيديو جديد: ${title}`,
        type: 'video'
      });
    });

    res.status(201).json({
      message: 'تم إضافة الفيديو بنجاح',
      video
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث فيديو (للمدرس فقط)
router.put('/:id', auth, teacherAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'الفيديو غير موجود' });
    }

    if (video.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الفيديو' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      video[key] = updates[key];
    });

    await video.save();

    res.json({
      message: 'تم تحديث الفيديو بنجاح',
      video
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// حذف فيديو (للمدرس فقط)
router.delete('/:id', auth, teacherAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'الفيديو غير موجود' });
    }

    if (video.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا الفيديو' });
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'تم حذف الفيديو بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;