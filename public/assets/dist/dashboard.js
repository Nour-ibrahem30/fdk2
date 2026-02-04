import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, orderBy, getDoc, addDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
import './toast-types';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let currentSection = 'overview';
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sections = document.querySelectorAll('.dashboard-section');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
async function checkAuth() {
    return new Promise((resolve) => {
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
            const userData = userDoc.data();
            if (userData.role !== 'teacher') {
                window.location.href = '/profile.html';
                resolve(null);
                return;
            }
            currentUser = userData;
            if (userName)
                userName.textContent = userData.name;
            resolve(userData);
        });
    });
}
function switchSection(sectionId) {
    sections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionId}-section`);
    });
    sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });
    currentSection = sectionId;
    loadSectionData(sectionId);
}
async function loadSectionData(sectionId) {
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
        document.getElementById('totalVideos').textContent = videosSnap.size.toString();
        document.getElementById('totalExams').textContent = examsSnap.size.toString();
        document.getElementById('totalNotes').textContent = notesSnap.size.toString();
        document.getElementById('totalStudents').textContent = usersSnap.size.toString();
        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = '<p>لا توجد أنشطة حديثة</p>';
    }
    catch (error) {
        console.error('Error loading overview:', error);
    }
}
async function loadVideosManagement() {
    const container = document.getElementById('videosList');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';
    try {
        const snapshot = await getDocs(query(collection(db, 'lessons'), orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد فيديوهات</p></div>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const video = { id: docSnap.id, ...docSnap.data() };
            const item = createManagementItem(video, 'video');
            container.appendChild(item);
        });
    }
    catch (error) {
        console.error('Error loading videos:', error);
        container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
    }
}
async function loadExamsManagement() {
    const container = document.getElementById('examsList');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';
    try {
        const snapshot = await getDocs(query(collection(db, 'exams'), orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد امتحانات</p></div>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const exam = { id: docSnap.id, ...docSnap.data() };
            const item = createManagementItem(exam, 'exam');
            container.appendChild(item);
        });
    }
    catch (error) {
        console.error('Error loading exams:', error);
        container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
    }
}
async function loadNotesManagement() {
    const container = document.getElementById('notesList');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';
    try {
        const snapshot = await getDocs(query(collection(db, 'notes'), orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد ملاحظات</p></div>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const note = { id: docSnap.id, ...docSnap.data() };
            const item = createManagementItem(note, 'note');
            container.appendChild(item);
        });
    }
    catch (error) {
        console.error('Error loading notes:', error);
        container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
    }
}
async function loadTestimonialsManagement() {
    const container = document.getElementById('testimonialsList');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';
    try {
        const snapshot = await getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد آراء</p></div>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const testimonial = { id: docSnap.id, ...docSnap.data() };
            const item = createManagementItem(testimonial, 'testimonial');
            container.appendChild(item);
        });
    }
    catch (error) {
        console.error('Error loading testimonials:', error);
        container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
    }
}
async function loadStudents() {
    const container = document.getElementById('studentsList');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري التحميل...</span></div>';
    try {
        const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>لا يوجد طلاب</p></div>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const student = docSnap.data();
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
        <div class="student-avatar">👤</div>
        <h3>${student.name}</h3>
        <p>${student.email}</p>
        <span class="student-date">انضم: ${new Date(student.createdAt).toLocaleDateString('ar-EG')}</span>
      `;
            container.appendChild(card);
        });
    }
    catch (error) {
        console.error('Error loading students:', error);
        container.innerHTML = '<div class="error-state"><p>حدث خطأ</p></div>';
    }
}
function createManagementItem(item, type) {
    const div = document.createElement('div');
    div.className = 'management-item';
    let title = '';
    let subtitle = '';
    if (type === 'video') {
        title = item.title;
        subtitle = item.notes || 'لا توجد ملاحظات';
    }
    else if (type === 'exam') {
        title = item.title;
        subtitle = `${item.questions.length} سؤال - ${item.duration} دقيقة`;
    }
    else if (type === 'note') {
        title = item.content.substring(0, 50) + '...';
        subtitle = `الأولوية: ${item.priority || 'متوسطة'}`;
    }
    else if (type === 'testimonial') {
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
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => handleDelete(item.id, type));
    return div;
}
async function handleDelete(id, type) {
    if (!confirm('هل أنت متأكد من الحذف؟'))
        return;
    const collections = {
        video: 'lessons',
        exam: 'exams',
        note: 'notes',
        testimonial: 'testimonials'
    };
    try {
        await deleteDoc(doc(db, collections[type], id));
        loadSectionData(currentSection);
    }
    catch (error) {
        console.error('Error deleting:', error);
        window.showToast('حدث خطأ أثناء الحذف', 'error');
    }
}
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        if (section)
            switchSection(section);
    });
});
logoutBtn?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '/';
    }
    catch (error) {
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
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => showAddVideoModal());
    }
    const addExamBtn = document.getElementById('addExamBtn');
    if (addExamBtn) {
        addExamBtn.addEventListener('click', () => showAddExamModal());
    }
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => showAddNoteModal());
    }
}
function showAddVideoModal() {
    const title = prompt('عنوان الفيديو:');
    if (!title)
        return;
    const videoUrl = prompt('رابط الفيديو (YouTube):');
    if (!videoUrl)
        return;
    const notes = prompt('ملاحظات (اختياري):') || '';
    addVideo(title, videoUrl, notes);
}
async function addVideo(title, videoUrl, notes) {
    try {
        await addDoc(collection(db, 'lessons'), {
            title,
            videoUrl,
            notes,
            createdBy: currentUser?.uid,
            createdAt: new Date().toISOString()
        });
        window.showToast('تم إضافة الفيديو بنجاح!', 'success');
        loadVideosManagement();
    }
    catch (error) {
        console.error('Error adding video:', error);
        window.showToast('حدث خطأ أثناء إضافة الفيديو', 'error');
    }
}
function showAddExamModal() {
    const title = prompt('عنوان الامتحان:');
    if (!title)
        return;
    const durationStr = prompt('مدة الامتحان (بالدقائق):');
    if (!durationStr)
        return;
    const duration = parseInt(durationStr);
    addExam(title, duration);
}
async function addExam(title, duration) {
    try {
        await addDoc(collection(db, 'exams'), {
            title,
            duration,
            questions: [],
            type: 'mixed',
            createdBy: currentUser?.uid,
            createdAt: new Date().toISOString()
        });
        window.showToast('تم إضافة الامتحان بنجاح!', 'success');
        loadExamsManagement();
    }
    catch (error) {
        console.error('Error adding exam:', error);
        window.showToast('حدث خطأ أثناء إضافة الامتحان', 'error');
    }
}
function showAddNoteModal() {
    const title = prompt('عنوان الملاحظة:');
    if (!title)
        return;
    const content = prompt('محتوى الملاحظة:');
    if (!content)
        return;
    addNote(title, content);
}
async function addNote(title, content) {
    try {
        await addDoc(collection(db, 'notes'), {
            title,
            content,
            createdBy: currentUser?.uid,
            createdAt: new Date().toISOString()
        });
        window.showToast('تم إضافة الملاحظة بنجاح!', 'success');
        loadNotesManagement();
    }
    catch (error) {
        console.error('Error adding note:', error);
        window.showToast('حدث خطأ أثناء إضافة الملاحظة', 'error');
    }
}
