const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, teacherAuth } = require('../middleware/auth');
const Note = require('../models/Note');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// إعداد multer للمرفقات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/attachments/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

// الحصول على جميع الملاحظات
router.get('/', auth, async (req, res) => {
  try {
    const { type, grade, unreadOnly } = req.query;
    
    let query = { isActive: true };
    
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.userId);
      
      // فلترة الملاحظات حسب الجمهور المستهدف
      query.$or = [
        { 'targetAudience.grade': student.grade },
        { 'targetAudience.specificStudents': req.user.userId },
        { 'targetAudience.grade': { $exists: false }, 'targetAudience.specificStudents': { $size: 0 } }
      ];

      if (unreadOnly === 'true') {
        query['readBy.student'] = { $ne: req.user.userId };
      }
    }
    
    if (type) query.type = type;
    if (grade && req.user.role === 'teacher') query['targetAudience.grade'] = grade;

    // التحقق من تاريخ انتهاء الصلاحية
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ];

    const notes = await Note.find(query)
      .populate('createdBy', 'name')
      .sort({ priority: -1, createdAt: -1 });

    // للطلاب: إضافة معلومات القراءة
    if (req.user.role === 'student') {
      const notesWithReadStatus = notes.map(note => {
        const isRead = note.readBy.some(
          read => read.student.toString() === req.user.userId
        );
        
        return {
          ...note.toObject(),
          isRead,
          readAt: isRead ? note.readBy.find(
            read => read.student.toString() === req.user.userId
          ).readAt : null
        };
      });
      
      return res.json(notesWithReadStatus);
    }

    // للمدرس: إضافة إحصائيات القراءة
    const notesWithStats = await Promise.all(
      notes.map(async (note) => {
        let targetStudentsCount = 0;
        
        if (note.targetAudience.specificStudents.length > 0) {
          targetStudentsCount = note.targetAudience.specificStudents.length;
        } else if (note.targetAudience.grade) {
          targetStudentsCount = await User.countDocuments({
            role: 'student',
            grade: note.targetAudience.grade
          });
        } else {
          targetStudentsCount = await User.countDocuments({ role: 'student' });
        }

        return {
          ...note.toObject(),
          readCount: note.readBy.length,
          targetStudentsCount,
          readPercentage: targetStudentsCount > 0 
            ? (note.readBy.length / targetStudentsCount) * 100 
            : 0
        };
      })
    );

    res.json(notesWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على ملاحظة محددة
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('targetAudience.specificStudents', 'name grade');

    if (!note) {
      return res.status(404).json({ message: 'الملاحظة غير موجودة' });
    }

    // للطلاب: تسجيل القراءة
    if (req.user.role === 'student') {
      const alreadyRead = note.readBy.some(
        read => read.student.toString() === req.user.userId
      );

      if (!alreadyRead) {
        note.readBy.push({
          student: req.user.userId,
          readAt: new Date()
        });
        await note.save();
      }
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إنشاء ملاحظة جديدة (للمدرس فقط)
router.post('/', auth, teacherAuth, upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetGrade,
      targetSubject,
      specificStudents,
      expiryDate
    } = req.body;

    // معالجة المرفقات
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    const note = new Note({
      title,
      content,
      type: type || 'announcement',
      priority: priority || 'medium',
      targetAudience: {
        grade: targetGrade,
        subject: targetSubject,
        specificStudents: specificStudents ? JSON.parse(specificStudents) : []
      },
      attachments,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      createdBy: req.user.userId
    });

    await note.save();

    // تحديد الطلاب المستهدفين
    let targetStudents = [];
    
    if (note.targetAudience.specificStudents.length > 0) {
      targetStudents = await User.find({
        _id: { $in: note.targetAudience.specificStudents },
        'notificationSettings.newNote': true
      });
    } else {
      let query = { role: 'student', 'notificationSettings.newNote': true };
      if (targetGrade) query.grade = targetGrade;
      
      targetStudents = await User.find(query);
    }

    // إرسال إشعارات
    const notifications = targetStudents.map(student => ({
      recipient: student._id,
      title: 'ملاحظة جديدة',
      message: `${title}`,
      type: 'note',
      priority: priority,
      data: { noteId: note._id }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // إرسال إشعارات فورية
      const io = req.app.get('io');
      targetStudents.forEach(student => {
        io.to(student._id.toString()).emit('notification', {
          title: 'ملاحظة جديدة',
          message: title,
          type: 'note',
          priority: priority
        });
      });
    }

    res.status(201).json({
      message: 'تم إنشاء الملاحظة بنجاح',
      note,
      notificationsSent: notifications.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث ملاحظة (للمدرس فقط)
router.put('/:id', auth, teacherAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'الملاحظة غير موجودة' });
    }

    if (note.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه الملاحظة' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key === 'targetAudience') {
        note.targetAudience = {
          ...note.targetAudience,
          ...updates.targetAudience
        };
      } else {
        note[key] = updates[key];
      }
    });

    await note.save();

    res.json({
      message: 'تم تحديث الملاحظة بنجاح',
      note
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// حذف ملاحظة (للمدرس فقط)
router.delete('/:id', auth, teacherAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'الملاحظة غير موجودة' });
    }

    if (note.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه الملاحظة' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'تم حذف الملاحظة بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تسجيل قراءة ملاحظة (للطلاب)
router.post('/:id/read', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'هذه الوظيفة للطلاب فقط' });
    }

    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'الملاحظة غير موجودة' });
    }

    const alreadyRead = note.readBy.some(
      read => read.student.toString() === req.user.userId
    );

    if (!alreadyRead) {
      note.readBy.push({
        student: req.user.userId,
        readAt: new Date()
      });
      await note.save();
    }

    res.json({ message: 'تم تسجيل القراءة' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;