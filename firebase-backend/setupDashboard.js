/**
 * Firebase Dashboard Setup Script
 * يقوم بإعداد Collections و Indexes اللازمة للـ Dashboard
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('🔥 Firebase initialized successfully!');

// ==================== CREATE TEACHER ACCOUNT ====================

async function createTeacherAccount() {
  try {
    console.log('\n📝 Creating teacher account...');
    
    const email = 'mohamednaser@gmail.com';
    const password = '16122003';
    const name = 'محمد ناصر';

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: 'teacher',
      photoURL: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Teacher account created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   UID: ${user.uid}`);
    
    return user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Teacher account already exists');
      // Get existing user
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), where('email', '==', 'mohamednaser@gmail.com'))
      );
      if (!usersSnapshot.empty) {
        return usersSnapshot.docs[0].data().uid;
      }
    } else {
      console.error('❌ Error creating teacher account:', error.message);
      throw error;
    }
  }
}

// ==================== CREATE SAMPLE DATA ====================

async function createSampleVideos(teacherUid) {
  try {
    console.log('\n🎥 Creating sample videos...');
    
    const videos = [
      {
        title: 'مقدمة في الفلسفة',
        description: 'شرح مبسط لمفهوم الفلسفة وأهميتها',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: '',
        grade: '1',
        duration: 1800,
        createdBy: teacherUid,
        createdAt: serverTimestamp()
      },
      {
        title: 'الفلسفة اليونانية',
        description: 'نظرة على الفلسفة اليونانية القديمة',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: '',
        grade: '2',
        duration: 2400,
        createdBy: teacherUid,
        createdAt: serverTimestamp()
      },
      {
        title: 'الفلسفة الحديثة',
        description: 'استكشاف الفلسفة في العصر الحديث',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: '',
        grade: '3',
        duration: 2100,
        createdBy: teacherUid,
        createdAt: serverTimestamp()
      }
    ];

    for (const video of videos) {
      await addDoc(collection(db, 'videos'), video);
    }

    console.log(`✅ Created ${videos.length} sample videos`);
  } catch (error) {
    console.error('❌ Error creating sample videos:', error.message);
  }
}

async function createSampleExams(teacherUid) {
  try {
    console.log('\n📋 Creating sample exams...');
    
    const exams = [
      {
        title: 'امتحان الفلسفة - الوحدة الأولى',
        description: 'امتحان شامل على الوحدة الأولى',
        grade: '1',
        type: 'mixed',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'ما هو تعريف الفلسفة؟',
            options: [
              'حب الحكمة',
              'علم الرياضيات',
              'دراسة التاريخ',
              'فن الرسم'
            ],
            correctAnswer: 0,
            points: 5
          },
          {
            id: 'q2',
            type: 'true-false',
            question: 'سقراط هو أبو الفلسفة اليونانية',
            correctAnswer: true,
            points: 3
          }
        ],
        duration: 60,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: teacherUid,
        createdAt: serverTimestamp()
      }
    ];

    for (const exam of exams) {
      await addDoc(collection(db, 'exams'), exam);
    }

    console.log(`✅ Created ${exams.length} sample exams`);
  } catch (error) {
    console.error('❌ Error creating sample exams:', error.message);
  }
}

async function createSampleNotes(teacherUid) {
  try {
    console.log('\n📝 Creating sample notes...');
    
    const notes = [
      {
        title: 'ملاحظة مهمة',
        content: 'يرجى مراجعة الدرس الأول قبل الامتحان',
        category: 'important',
        grade: '1',
        createdBy: teacherUid,
        createdAt: serverTimestamp()
      },
      {
        title: 'تذكير',
        content: 'موعد الامتحان القادم يوم الأحد',
        category: 'exam',
        grade: '2',
        createdBy: teacherUid,
        createdAt: serverTimestamp()
      }
    ];

    for (const note of notes) {
      await addDoc(collection(db, 'notes'), note);
    }

    console.log(`✅ Created ${notes.length} sample notes`);
  } catch (error) {
    console.error('❌ Error creating sample notes:', error.message);
  }
}

async function createSampleTestimonials() {
  try {
    console.log('\n💬 Creating sample testimonials...');
    
    const testimonials = [
      {
        studentName: 'أحمد محمد',
        studentEmail: 'ahmed@example.com',
        rating: 5,
        comment: 'شرح ممتاز ومفيد جداً، استفدت كثيراً من الدروس',
        approved: true,
        createdAt: serverTimestamp()
      },
      {
        studentName: 'فاطمة علي',
        studentEmail: 'fatima@example.com',
        rating: 5,
        comment: 'أفضل منصة تعليمية، المحتوى واضح ومنظم',
        approved: true,
        createdAt: serverTimestamp()
      },
      {
        studentName: 'محمود حسن',
        studentEmail: 'mahmoud@example.com',
        rating: 4,
        comment: 'جيد جداً، أتمنى المزيد من الفيديوهات',
        approved: false,
        createdAt: serverTimestamp()
      }
    ];

    for (const testimonial of testimonials) {
      await addDoc(collection(db, 'testimonials'), testimonial);
    }

    console.log(`✅ Created ${testimonials.length} sample testimonials`);
  } catch (error) {
    console.error('❌ Error creating sample testimonials:', error.message);
  }
}

async function createSampleStudents() {
  try {
    console.log('\n👥 Creating sample students...');
    
    const students = [
      {
        email: 'student1@example.com',
        password: 'student123',
        name: 'أحمد محمد',
        grade: '1'
      },
      {
        email: 'student2@example.com',
        password: 'student123',
        name: 'فاطمة علي',
        grade: '2'
      },
      {
        email: 'student3@example.com',
        password: 'student123',
        name: 'محمود حسن',
        grade: '3'
      }
    ];

    for (const student of students) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          student.email, 
          student.password
        );
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: student.name,
          email: student.email,
          role: 'student',
          grade: student.grade,
          photoURL: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log(`   ✅ Created student: ${student.name}`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ℹ️  Student ${student.email} already exists`);
        } else {
          console.error(`   ❌ Error creating student ${student.email}:`, error.message);
        }
      }
    }

    console.log(`✅ Sample students setup complete`);
  } catch (error) {
    console.error('❌ Error creating sample students:', error.message);
  }
}

// ==================== MAIN SETUP FUNCTION ====================

async function setupDashboard() {
  try {
    console.log('\n🚀 Starting Dashboard Setup...\n');
    console.log('=' .repeat(50));

    // 1. Create teacher account
    const teacherUid = await createTeacherAccount();

    // 2. Create sample data
    await createSampleVideos(teacherUid);
    await createSampleExams(teacherUid);
    await createSampleNotes(teacherUid);
    await createSampleTestimonials();
    await createSampleStudents();

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Dashboard setup completed successfully!\n');
    console.log('📌 Teacher Login:');
    console.log('   Email: mohamednaser@gmail.com');
    console.log('   Password: 16122003');
    console.log('\n📌 Student Login (example):');
    console.log('   Email: student1@example.com');
    console.log('   Password: student123');
    console.log('\n🌐 Access Dashboard:');
    console.log('   http://localhost:8000/pages/dashboard-firebase.html');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDashboard();
