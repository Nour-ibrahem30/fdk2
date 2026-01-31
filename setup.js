const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Exam = require('./models/Exam');
const Video = require('./models/Video');
const Note = require('./models/Note');

// إعداد قاعدة البيانات مع بيانات تجريبية
async function setupDatabase() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect('mongodb+srv://nouribrahem207_db_user:Nour123456@cluster0.8q2ioti.mongodb.net/philosopher_platform?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    // حذف البيانات الموجودة (اختياري)
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Video.deleteMany({});
    await Note.deleteMany({});

    console.log('تم حذف البيانات القديمة');

    // إنشاء حساب المدرس
    const teacherPassword = await bcrypt.hash('123456', 10);
    const teacher = new User({
      name: 'محمد ناصر الفيلسوف',
      email: 'teacher@philosopher.com',
      password: teacherPassword,
      phone: '01234567890',
      role: 'teacher',
      isActive: true
    });
    await teacher.save();
    console.log('تم إنشاء حساب المدرس');

    // إنشاء حسابات طلاب تجريبية
    const studentPassword = await bcrypt.hash('123456', 10);
    const students = [];
    
    const studentNames = [
      'أحمد محمد علي',
      'فاطمة أحمد حسن',
      'محمود سعد إبراهيم',
      'نور الدين عبدالله',
      'مريم خالد محمد'
    ];

    const grades = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];

    for (let i = 0; i < studentNames.length; i++) {
      const student = new User({
        name: studentNames[i],
        email: `student${i + 1}@philosopher.com`,
        password: studentPassword,
        phone: `0123456789${i}`,
        role: 'student',
        grade: grades[i % grades.length],
        isActive: true,
        stats: {
          totalVideosWatched: Math.floor(Math.random() * 10),
          totalExamsTaken: Math.floor(Math.random() * 5),
          averageScore: 70 + Math.random() * 30,
          totalStudyTime: Math.floor(Math.random() * 500),
          streak: Math.floor(Math.random() * 10)
        }
      });
      await student.save();
      students.push(student);
    }
    console.log('تم إنشاء حسابات الطلاب التجريبية');

    // إنشاء امتحانات تجريبية
    const sampleExams = [
      {
        title: 'امتحان الفلسفة - الوحدة الأولى',
        description: 'امتحان شامل على الوحدة الأولى في مادة الفلسفة',
        subject: 'الفلسفة',
        grade: 'الصف الأول الثانوي',
        chapter: 'الوحدة الأولى',
        questions: [
          {
            question: 'ما هو تعريف الفلسفة؟',
            type: 'multiple_choice',
            options: [
              { text: 'حب الحكمة', isCorrect: true },
              { text: 'علم الرياضيات', isCorrect: false },
              { text: 'دراسة التاريخ', isCorrect: false },
              { text: 'فن الرسم', isCorrect: false }
            ],
            points: 2
          },
          {
            question: 'الفلسفة تهتم بالأسئلة الجوهرية في الحياة',
            type: 'true_false',
            correctAnswer: 'true',
            points: 1
          }
        ],
        duration: 60,
        totalPoints: 3,
        passingScore: 70,
        attempts: 3,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        createdBy: teacher._id
      },
      {
        title: 'امتحان المنطق - الأساسيات',
        description: 'امتحان على أساسيات علم المنطق',
        subject: 'المنطق',
        grade: 'الصف الثاني الثانوي',
        chapter: 'الأساسيات',
        questions: [
          {
            question: 'ما هو القياس المنطقي؟',
            type: 'multiple_choice',
            options: [
              { text: 'استنتاج نتيجة من مقدمات', isCorrect: true },
              { text: 'عملية حسابية', isCorrect: false },
              { text: 'قياس المسافات', isCorrect: false },
              { text: 'تقدير الوقت', isCorrect: false }
            ],
            points: 2
          }
        ],
        duration: 45,
        totalPoints: 2,
        passingScore: 70,
        attempts: 3,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: teacher._id
      }
    ];

    const createdExams = [];
    for (const examData of sampleExams) {
      const exam = new Exam(examData);
      await exam.save();
      createdExams.push(exam);
    }
    console.log('تم إنشاء الامتحانات التجريبية');

    // إنشاء فيديوهات تجريبية
    const sampleVideos = [
      {
        title: 'مقدمة في الفلسفة',
        description: 'شرح مفصل لتعريف الفلسفة وأهميتها في حياتنا',
        videoUrl: '/uploads/videos/sample1.mp4',
        subject: 'الفلسفة',
        grade: 'الصف الأول الثانوي',
        chapter: 'الوحدة الأولى',
        lesson: 'الدرس الأول',
        requiredExam: createdExams[0]._id,
        minimumScore: 70,
        duration: 1800, // 30 دقيقة
        createdBy: teacher._id
      },
      {
        title: 'أساسيات المنطق',
        description: 'شرح القواعد الأساسية لعلم المنطق',
        videoUrl: '/uploads/videos/sample2.mp4',
        subject: 'المنطق',
        grade: 'الصف الثاني الثانوي',
        chapter: 'الأساسيات',
        lesson: 'الدرس الأول',
        requiredExam: createdExams[1]._id,
        minimumScore: 70,
        duration: 2400, // 40 دقيقة
        createdBy: teacher._id
      }
    ];

    for (const videoData of sampleVideos) {
      const video = new Video(videoData);
      await video.save();
    }
    console.log('تم إنشاء الفيديوهات التجريبية');

    // إنشاء ملاحظات تجريبية
    const sampleNotes = [
      {
        title: 'مرحباً بكم في منصة الفيلسوف',
        content: 'أهلاً وسهلاً بكم جميعاً في منصتنا التعليمية. نتمنى لكم تجربة تعليمية مثمرة ومفيدة.',
        type: 'announcement',
        priority: 'high',
        targetAudience: {
          grade: '',
          subject: '',
          specificStudents: []
        },
        createdBy: teacher._id
      },
      {
        title: 'تذكير: امتحان الفلسفة',
        content: 'تذكير بأن امتحان الفلسفة للوحدة الأولى متاح الآن. يرجى الاستعداد جيداً.',
        type: 'reminder',
        priority: 'medium',
        targetAudience: {
          grade: 'الصف الأول الثانوي',
          subject: 'الفلسفة',
          specificStudents: []
        },
        createdBy: teacher._id
      }
    ];

    for (const noteData of sampleNotes) {
      const note = new Note(noteData);
      await note.save();
    }
    console.log('تم إنشاء الملاحظات التجريبية');

    console.log('\n=== تم إعداد قاعدة البيانات بنجاح ===');
    console.log('\nالحسابات التجريبية:');
    console.log('المدرس: teacher@philosopher.com / 123456');
    console.log('الطلاب: student1@philosopher.com إلى student5@philosopher.com / 123456');
    console.log('\nيمكنك الآن تشغيل المشروع باستخدام: npm start');

  } catch (error) {
    console.error('خطأ في إعداد قاعدة البيانات:', error);
  } finally {
    await mongoose.disconnect();
    console.log('تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل الإعداد
setupDatabase();