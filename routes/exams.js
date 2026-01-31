const express = require('express');
const { auth, teacherAuth } = require('../middleware/auth');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// الحصول على جميع الامتحانات
router.get('/', auth, async (req, res) => {
  try {
    const { grade, subject, available } = req.query;
    
    let query = { isActive: true };
    
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.userId);
      query.grade = student.grade;
      
      if (available === 'true') {
        query.startDate = { $lte: new Date() };
        query.endDate = { $gte: new Date() };
      }
    }
    
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;

    const exams = await Exam.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // للطلاب: إضافة معلومات المحاولات
    if (req.user.role === 'student') {
      const examsWithAttempts = await Promise.all(
        exams.map(async (exam) => {
          const attempts = await ExamResult.find({
            student: req.user.userId,
            exam: exam._id
          }).sort({ attemptNumber: -1 });

          const bestResult = attempts.find(a => a.passed) || attempts[0];

          return {
            ...exam.toObject(),
            attempts: attempts.length,
            remainingAttempts: Math.max(0, exam.attempts - attempts.length),
            bestScore: bestResult?.percentage || null,
            passed: !!attempts.find(a => a.passed),
            canTake: attempts.length < exam.attempts && 
                    new Date() >= exam.startDate && 
                    new Date() <= exam.endDate
          };
        })
      );
      
      return res.json(examsWithAttempts);
    }

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على امتحان محدد
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!exam) {
      return res.status(404).json({ message: 'الامتحان غير موجود' });
    }

    // للطلاب: التحقق من إمكانية دخول الامتحان
    if (req.user.role === 'student') {
      const now = new Date();
      if (now < exam.startDate || now > exam.endDate) {
        return res.status(403).json({ message: 'الامتحان غير متاح حالياً' });
      }

      const attempts = await ExamResult.countDocuments({
        student: req.user.userId,
        exam: exam._id
      });

      if (attempts >= exam.attempts) {
        return res.status(403).json({ message: 'تم استنفاد عدد المحاولات المسموحة' });
      }

      // إخفاء الإجابات الصحيحة عن الطلاب
      const examForStudent = {
        ...exam.toObject(),
        questions: exam.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options ? q.options.map(opt => ({ text: opt.text })) : [],
          points: q.points
        }))
      };

      return res.json(examForStudent);
    }

    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إنشاء امتحان جديد (للمدرس فقط)
router.post('/', auth, teacherAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      grade,
      chapter,
      questions,
      duration,
      passingScore,
      attempts,
      startDate,
      endDate
    } = req.body;

    // حساب إجمالي النقاط
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    const exam = new Exam({
      title,
      description,
      subject,
      grade,
      chapter,
      questions,
      duration,
      totalPoints,
      passingScore: passingScore || 70,
      attempts: attempts || 3,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user.userId
    });

    await exam.save();

    // إرسال إشعارات للطلاب
    const targetStudents = await User.find({
      role: 'student',
      grade: grade,
      'notificationSettings.newNote': true
    });

    const notifications = targetStudents.map(student => ({
      recipient: student._id,
      title: 'امتحان جديد متاح',
      message: `تم إضافة امتحان جديد: ${title}`,
      type: 'exam',
      data: { examId: exam._id }
    }));

    await Notification.insertMany(notifications);

    // إرسال إشعارات فورية
    const io = req.app.get('io');
    targetStudents.forEach(student => {
      io.to(student._id.toString()).emit('notification', {
        title: 'امتحان جديد متاح',
        message: `تم إضافة امتحان جديد: ${title}`,
        type: 'exam'
      });
    });

    res.status(201).json({
      message: 'تم إنشاء الامتحان بنجاح',
      exam
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تقديم إجابات الامتحان (للطلاب فقط)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'غير مصرح لك بدخول الامتحانات' });
    }

    const { answers, startedAt, timeSpent } = req.body;
    
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'الامتحان غير موجود' });
    }

    // التحقق من صحة التوقيت
    const now = new Date();
    if (now < exam.startDate || now > exam.endDate) {
      return res.status(403).json({ message: 'الامتحان غير متاح حالياً' });
    }

    // التحقق من عدد المحاولات
    const attemptCount = await ExamResult.countDocuments({
      student: req.user.userId,
      exam: exam._id
    });

    if (attemptCount >= exam.attempts) {
      return res.status(403).json({ message: 'تم استنفاد عدد المحاولات المسموحة' });
    }

    // تصحيح الإجابات
    let totalScore = 0;
    const correctedAnswers = answers.map(answer => {
      const question = exam.questions.id(answer.questionId);
      if (!question) return { ...answer, isCorrect: false, points: 0 };

      let isCorrect = false;
      
      if (question.type === 'multiple_choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && answer.answer === correctOption.text;
      } else if (question.type === 'true_false') {
        isCorrect = answer.answer === question.correctAnswer;
      }
      // للأسئلة المقالية، يتم التصحيح يدوياً

      const points = isCorrect ? question.points : 0;
      totalScore += points;

      return {
        ...answer,
        isCorrect,
        points
      };
    });

    const percentage = (totalScore / exam.totalPoints) * 100;
    const passed = percentage >= exam.passingScore;

    // حفظ النتيجة
    const result = new ExamResult({
      student: req.user.userId,
      exam: exam._id,
      answers: correctedAnswers,
      score: totalScore,
      percentage,
      passed,
      timeSpent,
      attemptNumber: attemptCount + 1,
      startedAt: new Date(startedAt),
      submittedAt: now
    });

    await result.save();

    // تحديث إحصائيات الطالب
    const student = await User.findById(req.user.userId);
    student.stats.totalExamsTaken += 1;
    
    // إعادة حساب المتوسط
    const allResults = await ExamResult.find({ student: req.user.userId });
    const avgScore = allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length;
    student.stats.averageScore = avgScore;

    await student.save();

    // إرسال إشعار بالنتيجة
    const notification = new Notification({
      recipient: req.user.userId,
      title: 'نتيجة الامتحان',
      message: `حصلت على ${percentage.toFixed(1)}% في امتحان ${exam.title}`,
      type: 'result',
      data: { examId: exam._id, resultId: result._id, passed }
    });

    await notification.save();

    res.json({
      message: 'تم تقديم الامتحان بنجاح',
      result: {
        score: totalScore,
        percentage,
        passed,
        totalQuestions: exam.questions.length,
        correctAnswers: correctedAnswers.filter(a => a.isCorrect).length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على نتائج امتحان محدد
router.get('/:id/results', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'الامتحان غير موجود' });
    }

    if (req.user.role === 'student') {
      // الطلاب يرون نتائجهم فقط
      const results = await ExamResult.find({
        student: req.user.userId,
        exam: req.params.id
      }).sort({ attemptNumber: -1 });

      return res.json(results);
    } else {
      // المدرس يرى جميع النتائج
      const results = await ExamResult.find({ exam: req.params.id })
        .populate('student', 'name grade')
        .sort({ percentage: -1 });

      return res.json(results);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;