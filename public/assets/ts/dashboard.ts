import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, orderBy, getDoc, addDoc } from 'firebase/firestore';
import { firebaseConfig, User, Lesson, Exam, Note, Testimonial } from './firebase-config';
import './toast-types';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser: User | null = null;
let currentSection = 'overview';

const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sections = document.querySelectorAll('.dashboard-section');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

async function checkAuth() {
  // Support legacy/localStorage-based teacher session (fallback)
  const storedRole = localStorage.getItem('userRole');
  const storedUser = localStorage.getItem('currentUser');
  if (storedRole === 'teacher' && storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as User;
      currentUser = parsed;
      if (userName) {
        userName.textContent = parsed.name;
      }
      return Promise.resolve(parsed);
    } catch (e) {
      // fall through to normal auth check
      console.warn('Invalid stored currentUser, falling back to Firebase auth');
    }
  }

  return new Promise<User | null>((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login.html';
        resolve(null);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        window.location.href = '/login.html';
        resolve(null);
        return;
      }

      const userData = userDoc.data() as User;
      if (userData.role !== 'teacher') {
        window.location.href = '/profile.html';
        resolve(null);
        return;
      }

      currentUser = userData;
      if (userName) {
        userName.textContent = userData.name;
      }
      resolve(userData);
    });
  });
}

function switchSection(sectionId: string) {
  sections.forEach(section => {
    section.classList.toggle('active', section.id === `${sectionId}-section`);
  });

  sidebarLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
  });

  currentSection = sectionId;
  loadSectionData(sectionId);
}

async function loadSectionData(sectionId: string) {
  switch (sectionId) {
  case 'overview':
    await loadOverview();
    break;
  case 'videos':
    await loadVideosManagement();
    break;
  case 'exams':
    await loadExamsManagement();
    break;
  case 'notes':
    await loadNotesManagement();
    break;
  case 'testimonials':
    await loadTestimonialsManagement();
    break;
  case 'students':
    await loadStudents();
    break;
  }
}

async function loadOverview() {
  try {
    const [videosSnap, examsSnap, notesSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'lessons')),
      getDocs(collection(db, 'exams')),
      getDocs(collection(db, 'notes')),
      getDocs(query(collection(db, 'users'), where('role', '==', 'student')))
    ]);

    document.getElementById('totalVideos')!.textContent = videosSnap.size.toString();
    document.getElementById('totalExams')!.textContent = examsSnap.size.toString();
    document.getElementById('totalNotes')!.textContent = notesSnap.size.toString();
    document.getElementById('totalStudents')!.textContent = usersSnap.size.toString();

    const activityContainer = document.getElementById('recentActivity')!;
    activityContainer.innerHTML = '<p>لا توجد أنشطة حديثة</p>';
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

async function loadVideosManagement() {
  const container = document.getElementById('videosList')!;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';

  try {
    const snapshot = await getDocs(query(collection(db, 'lessons'), orderBy('createdAt', 'desc')));
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="empty-state"><p>لا توجد فيديوهات</p></div>';
      // Update global videos array
      (window as any).videos = [];
      return;
    }

    // Update global videos array with Firebase data
    const videosData: any[] = [];
    snapshot.forEach((docSnap) => {
      const video = { id: docSnap.id, ...docSnap.data() } as Lesson;
      videosData.push({
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        notes: video.notes,
        source: 'youtube',
        duration: 0,
        createdAt: video.createdAt
      });
      const item = createManagementItem(video, 'video');
      container.appendChild(item);
    });
    
    // Update global scope
    (window as any).videos = videosData;
    console.log('Videos loaded from Firebase:', videosData.length);
  } catch (error) {
    console.error('Error loading videos:', error);
    container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
  }
}

async function loadExamsManagement() {
  const container = document.getElementById('examsList')!;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';

  try {
    const snapshot = await getDocs(query(collection(db, 'exams'), orderBy('createdAt', 'desc')));
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="empty-state"><p>لا توجد امتحانات</p></div>';
      (window as any).exams = [];
      return;
    }

    // Update global exams array with Firebase data
    const examsData: any[] = [];
    snapshot.forEach((docSnap) => {
      const exam = { id: docSnap.id, ...docSnap.data() } as Exam;
      examsData.push({
        id: exam.id,
        title: exam.title,
        duration: exam.duration || 0,
        questions: exam.questions?.length || 0,
        createdAt: exam.createdAt
      });
      const item = createManagementItem(exam, 'exam');
      container.appendChild(item);
    });

    // Update global scope
    (window as any).exams = examsData;
    console.log('Exams loaded from Firebase:', examsData.length);
  } catch (error) {
    console.error('Error loading exams:', error);
    container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
  }
}

async function loadNotesManagement() {
  const container = document.getElementById('notesList')!;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';

  try {
    const snapshot = await getDocs(query(collection(db, 'notes'), orderBy('createdAt', 'desc')));
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="empty-state"><p>لا توجد ملاحظات</p></div>';
      (window as any).notes = [];
      return;
    }

    // Update global notes array with Firebase data
    const notesData: any[] = [];
    snapshot.forEach((docSnap) => {
      const note = { id: docSnap.id, ...docSnap.data() } as Note;
      notesData.push({
        id: note.id,
        title: note.content.substring(0, 50),
        content: note.content,
        priority: note.priority || 'medium',
        createdAt: note.createdAt
      });
      const item = createManagementItem(note, 'note');
      container.appendChild(item);
    });

    // Update global scope
    (window as any).notes = notesData;
    console.log('Notes loaded from Firebase:', notesData.length);
  } catch (error) {
    console.error('Error loading notes:', error);
    container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
  }
}

async function loadTestimonialsManagement() {
  const container = document.getElementById('testimonialsList')!;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';

  try {
    const snapshot = await getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')));
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="empty-state"><p>لا توجد آراء</p></div>';
      return;
    }

    container.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const testimonial = { id: docSnap.id, ...docSnap.data() } as Testimonial;
      const item = createManagementItem(testimonial, 'testimonial');
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading testimonials:', error);
    container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
  }
}

async function loadStudents() {
  const container = document.getElementById('studentsList')!;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';

  try {
    const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="empty-state"><p>لا يوجد طلاب</p></div>';
      return;
    }

    container.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const student = docSnap.data() as User;
      const card = document.createElement('div');
      card.className = 'student-card';
      card.setAttribute('data-uid', docSnap.id);
      const studentName = student.name || student.email || 'طالب';
      const initials = (studentName || '').split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
      card.innerHTML = `
        <div class="student-avatar">${initials}</div>
        <div class="student-body">
          <h4 class="student-name">${student.name || 'طالب'}</h4>
          <div class="student-email">${student.email || ''}</div>
        </div>
        <div class="student-meta">انضم: ${student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-EG') : '-'}</div>
      `;
      container.appendChild(card);
    });

    // Attach click handler (event delegation) to open student detail modal
    container.addEventListener('click', async (ev) => {
      const target = ev.target as HTMLElement;
      const card = target.closest('.student-card') as HTMLElement | null;
      if (!card) {
        return;
      }
      const uid = card.getAttribute('data-uid');
      if (!uid) {
        return;
      }
      openStudentModal(uid);
    });
  } catch (error) {
    console.error('Error loading students:', error);
    container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
  }
}

async function openStudentModal(uid: string) {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (!docSnap.exists()) {
      (window as any).showToast && (window as any).showToast('لم يتم العثور على بيانات الطالب', 'error');
      return;
    }
    const s = docSnap.data() as any;
    const modal = document.getElementById('studentModal');
    if (!modal) {
      return;
    }
    (document.getElementById('modalStudentName') as HTMLElement).textContent = s.name || s.email || 'طالب';
    (document.getElementById('modalStudentEmail') as HTMLElement).textContent = s.email || '';
    (document.getElementById('modalStudentJoined') as HTMLElement).textContent = s.createdAt ? new Date(s.createdAt).toLocaleString('ar-EG') : '-';
    (document.getElementById('modalStudentDetails') as HTMLElement).textContent = s.bio || s.note || '';
    modal.classList.add('open');
  } catch (e) {
    console.error('openStudentModal error', e);
  }
}

function createManagementItem(item: any, type: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'management-item';
  
  let title = '';
  let subtitle = '';
  
  if (type === 'video') {
    title = item.title;
    subtitle = item.notes || 'لا توجد ملاحظات';
  } else if (type === 'exam') {
    title = item.title;
    subtitle = `${item.questions.length} سؤال - ${item.duration} دقيقة`;
  } else if (type === 'note') {
    title = item.content.substring(0, 50) + '...';
    subtitle = `الأولوية: ${item.priority || 'متوسطة'}`;
  } else if (type === 'testimonial') {
    title = item.studentName;
    subtitle = item.comment.substring(0, 50) + '...';
  }
  
  div.innerHTML = `
    <div class="item-content">
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </div>
    <div class="item-actions">
      <button class="btn btn-sm btn-secondary edit-btn" data-id="${item.id}" data-type="${type}">تعديل</button>
      <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}" data-type="${type}">حذف</button>
    </div>
  `;
  
  const deleteBtn = div.querySelector('.delete-btn') as HTMLButtonElement;
  deleteBtn.addEventListener('click', () => handleDelete(item.id, type));
  
  return div;
}

async function handleDelete(id: string, type: string) {
  if (!confirm('هل أنت متأكد من الحذف؟')) {
    return;
  }

  const collections: { [key: string]: string } = {
    video: 'lessons',
    exam: 'exams',
    note: 'notes',
    testimonial: 'testimonials'
  };

  try {
    await deleteDoc(doc(db, collections[type], id));
    loadSectionData(currentSection);
  } catch (error) {
    console.error('Error deleting:', error);
    (window as any).showToast('حدث خطأ أثناء الحذف', 'error');
  }
}

sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.getAttribute('data-section');
    if (section) {
      switchSection(section);
    }
  });
});

logoutBtn?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  if (currentUser) {
    loadOverview();
    setupEventListeners();
  }
});

async function setupEventListeners() {
  // Add Video Button
  const addVideoBtn = document.getElementById('addVideoBtn') as HTMLButtonElement;
  if (addVideoBtn) {
    addVideoBtn.addEventListener('click', () => showAddVideoModal());
  }

  // Add Exam Button
  const addExamBtn = document.getElementById('addExamBtn') as HTMLButtonElement;
  if (addExamBtn) {
    addExamBtn.addEventListener('click', () => showAddExamModal());
  }

  // Add Note Button
  const addNoteBtn = document.getElementById('addNoteBtn') as HTMLButtonElement;
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => showAddNoteModal());
  }
}

function showAddVideoModal() {
  const title = prompt('عنوان الفيديو:');
  if (!title) {
    return;
  }

  const videoUrl = prompt('رابط الفيديو (YouTube):');
  if (!videoUrl) {
    return;
  }

  const notes = prompt('ملاحظات (اختياري):') || '';

  addVideo(title, videoUrl, notes);
}

async function addVideo(title: string, videoUrl: string, notes: string) {
  try {
    // Ensure currentUser is set
    if (!currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          currentUser = JSON.parse(stored) as User; 
        } catch (e) {}
      }
    }

    if (!currentUser || !currentUser.uid) {
      (window as any).showToast('خطأ: لم يتم تعيين المستخدم', 'error');
      return;
    }

    const docRef = await addDoc(collection(db, 'lessons'), {
      title,
      videoUrl,
      notes,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString()
    });

    // Update global array if available
    const newVideo = {
      id: docRef.id,
      title,
      videoUrl,
      notes,
      source: 'youtube',
      duration: 0,
      createdAt: new Date().toISOString()
    };

    if ((window as any).videos) {
      (window as any).videos.unshift(newVideo);
      // Call renderVideos if it exists
      if (typeof (window as any).renderVideos === 'function') {
        (window as any).renderVideos();
      }
    } else {
      // If global videos array doesn't exist, reload
      await loadVideosManagement();
    }

    (window as any).showToast('تم إضافة الفيديو بنجاح!', 'success');
  } catch (error) {
    console.error('Error adding video:', error);
    (window as any).showToast('حدث خطأ أثناء إضافة الفيديو', 'error');
  }
}

function showAddExamModal() {
  const title = prompt('عنوان الامتحان:');
  if (!title) {
    return;
  }

  const durationStr = prompt('مدة الامتحان (بالدقائق):');
  if (!durationStr) {
    return;
  }

  const duration = parseInt(durationStr);

  addExam(title, duration);
}

async function addExam(title: string, duration: number) {
  try {
    // Ensure currentUser is set
    if (!currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          currentUser = JSON.parse(stored) as User; 
        } catch (e) {}
      }
    }

    if (!currentUser || !currentUser.uid) {
      (window as any).showToast('خطأ: لم يتم تعيين المستخدم', 'error');
      return;
    }

    const docRef = await addDoc(collection(db, 'exams'), {
      title,
      duration,
      questions: [],
      type: 'mixed',
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString()
    });

    // Update global array if available
    const newExam = {
      id: docRef.id,
      title,
      duration,
      questions: 0,
      description: '',
      createdAt: new Date().toISOString()
    };

    if ((window as any).exams) {
      (window as any).exams.unshift(newExam);
      // Call renderExams if it exists
      if (typeof (window as any).renderExams === 'function') {
        (window as any).renderExams();
      }
    } else {
      // If global exams array doesn't exist, reload
      await loadExamsManagement();
    }

    (window as any).showToast('تم إضافة الامتحان بنجاح!', 'success');
  } catch (error) {
    console.error('Error adding exam:', error);
    (window as any).showToast('حدث خطأ أثناء إضافة الامتحان', 'error');
  }
}

function showAddNoteModal() {
  const title = prompt('عنوان الملاحظة:');
  if (!title) {
    return;
  }

  const content = prompt('محتوى الملاحظة:');
  if (!content) {
    return;
  }

  addNote(title, content);
}

async function addNote(title: string, content: string) {
  try {
    // Ensure currentUser is set
    if (!currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          currentUser = JSON.parse(stored) as User; 
        } catch (e) {}
      }
    }

    if (!currentUser || !currentUser.uid) {
      (window as any).showToast('خطأ: لم يتم تعيين المستخدم', 'error');
      return;
    }

    const docRef = await addDoc(collection(db, 'notes'), {
      title,
      content,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString()
    });

    // Update global array if available
    const newNote = {
      id: docRef.id,
      title,
      content,
      priority: 'متوسطة',
      createdAt: new Date().toISOString()
    };

    if ((window as any).notes) {
      (window as any).notes.unshift(newNote);
      // Call renderNotes if it exists
      if (typeof (window as any).renderNotes === 'function') {
        (window as any).renderNotes();
      }
    } else {
      // If global notes array doesn't exist, reload
      await loadNotesManagement();
    }

    (window as any).showToast('تم إضافة الملاحظة بنجاح!', 'success');
  } catch (error) {
    console.error('Error adding note:', error);
    (window as any).showToast('حدث خطأ أثناء إضافة الملاحظة', 'error');
  }
}
