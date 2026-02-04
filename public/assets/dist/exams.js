import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
import './toast-types';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let currentExam = null;
let examTimer = null;
let timeRemaining = 0;
const examsGrid = document.getElementById('examsGrid');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const authBtn = document.getElementById('authBtn');
const emptyState = document.getElementById('emptyState');
async function loadExams() {
    if (!examsGrid)
        return;
    try {
        examsGrid.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري تحميل الامتحانات...</span></div>';
        const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(examsQuery);
        if (snapshot.empty) {
            examsGrid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        examsGrid.innerHTML = '';
        examsGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        snapshot.forEach((docSnap) => {
            const exam = { id: docSnap.id, ...docSnap.data() };
            const card = createExamCard(exam);
            examsGrid.appendChild(card);
        });
    }
    catch (error) {
        console.error('Error loading exams:', error);
        examsGrid.innerHTML = '<div class="error-state"><p>حدث خطأ أثناء تحميل الامتحانات</p></div>';
    }
}
function createExamCard(exam) {
    const card = document.createElement('article');
    card.className = 'exam-card';
    card.setAttribute('role', 'listitem');
    const typeLabels = {
        'true-false': 'صح وخطأ',
        'multiple-choice': 'اختيار من متعدد',
        'mixed': 'مزيج'
    };
    card.innerHTML = `
    <div class="exam-header">
      <span class="exam-type">${typeLabels[exam.type]}</span>
      <span class="exam-duration">⏱️ ${exam.duration} دقيقة</span>
    </div>
    <h3 class="exam-title">${exam.title}</h3>
    <div class="exam-info">
      <span>📝 ${exam.questions.length} سؤال</span>
    </div>
    <button class="btn btn-primary btn-block start-exam-btn" data-exam-id="${exam.id}">
      ابدأ الامتحان
    </button>
  `;
    const startBtn = card.querySelector('.start-exam-btn');
    startBtn.addEventListener('click', () => handleStartExam(exam));
    return card;
}
async function handleStartExam(exam) {
    if (!currentUser) {
        window.showToast('يجب تسجيل الدخول لبدء الامتحان', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }
    currentExam = exam;
    timeRemaining = exam.duration * 60;
    showExamModal(exam);
    startTimer();
}
function showExamModal(exam) {
    const modal = document.createElement('div');
    modal.className = 'modal active exam-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'exam-title');
    const questionsHTML = exam.questions.map((q, index) => {
        if (q.type === 'true-false') {
            return `
        <div class="question-item" data-question-index="${index}">
          <h4 class="question-text">${index + 1}. ${q.question}</h4>
          <div class="question-options">
            <label class="option-label">
              <input type="radio" name="q${index}" value="true" required>
              <span>صح</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q${index}" value="false" required>
              <span>خطأ</span>
            </label>
          </div>
        </div>
      `;
        }
        else {
            return `
        <div class="question-item" data-question-index="${index}">
          <h4 class="question-text">${index + 1}. ${q.question}</h4>
          <div class="question-options">
            ${q.options?.map((opt, i) => `
              <label class="option-label">
                <input type="radio" name="q${index}" value="${i}" required>
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
        }
    }).join('');
    modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content modal-exam">
      <div class="exam-header-bar">
        <h2 id="exam-title">${exam.title}</h2>
        <div class="exam-timer" id="examTimer">
          <span aria-hidden="true">⏱️</span>
          <span id="timerDisplay">${formatTime(timeRemaining)}</span>
        </div>
      </div>
      <form id="examForm" class="exam-form">
        ${questionsHTML}
        <button type="submit" class="btn btn-primary btn-lg">إنهاء الامتحان</button>
      </form>
    </div>
  `;
    document.body.appendChild(modal);
    const form = modal.querySelector('#examForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmitExam(exam, form);
    });
}
function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    examTimer = window.setInterval(() => {
        timeRemaining--;
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeRemaining);
            if (timeRemaining <= 60) {
                timerDisplay.style.color = '#ff4444';
            }
        }
        if (timeRemaining <= 0) {
            stopTimer();
            autoSubmitExam();
        }
    }, 1000);
}
function stopTimer() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
}
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
async function handleSubmitExam(exam, form) {
    stopTimer();
    const answers = [];
    let score = 0;
    exam.questions.forEach((q, index) => {
        const selected = form.querySelector(`input[name="q${index}"]:checked`);
        if (selected) {
            const answer = q.type === 'true-false' ? selected.value === 'true' : parseInt(selected.value);
            answers.push(answer);
            if (answer === q.correctAnswer) {
                score += q.points;
            }
        }
        else {
            answers.push(q.type === 'true-false' ? false : -1);
        }
    });
    const result = {
        id: `${currentUser.uid}_${exam.id}_${Date.now()}`,
        examId: exam.id,
        studentId: currentUser.uid,
        answers,
        score,
        totalQuestions: exam.questions.length,
        completedAt: new Date().toISOString()
    };
    try {
        await setDoc(doc(db, 'examResults', result.id), result);
        showResultModal(result, exam);
    }
    catch (error) {
        console.error('Error saving exam result:', error);
        window.showToast('حدث خطأ أثناء حفظ النتيجة', 'error');
    }
}
function autoSubmitExam() {
    const form = document.getElementById('examForm');
    if (form && currentExam) {
        window.showToast('انتهى الوقت! سيتم إرسال إجاباتك تلقائياً', 'warning', 3000);
        setTimeout(() => {
            if (currentExam) {
                handleSubmitExam(currentExam, form);
            }
        }, 1000);
    }
}
function showResultModal(result, exam) {
    const modal = document.querySelector('.exam-modal');
    if (!modal)
        return;
    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((result.score / totalPoints) * 100);
    const passed = percentage >= 50;
    modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content modal-result">
      <div class="result-icon ${passed ? 'success' : 'fail'}" aria-hidden="true">
        ${passed ? '🎉' : '😔'}
      </div>
      <h2 class="result-title">${passed ? 'مبروك! لقد نجحت' : 'للأسف، لم تنجح'}</h2>
      <div class="result-stats">
        <div class="result-stat">
          <span class="stat-value">${percentage}%</span>
          <span class="stat-label">النسبة المئوية</span>
        </div>
        <div class="result-stat">
          <span class="stat-value">${result.score}/${totalPoints}</span>
          <span class="stat-label">النقاط</span>
        </div>
        <div class="result-stat">
          <span class="stat-value">${result.totalQuestions}</span>
          <span class="stat-label">عدد الأسئلة</span>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn btn-primary" onclick="window.location.reload()">العودة للامتحانات</button>
        <a href="/profile.html" class="btn btn-secondary">الملف الشخصي</a>
      </div>
    </div>
  `;
}
searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = examsGrid.querySelectorAll('.exam-card');
    cards.forEach((card) => {
        const title = card.querySelector('.exam-title')?.textContent?.toLowerCase() || '';
        card.classList.toggle('hidden', !title.includes(searchTerm));
    });
});
typeFilter?.addEventListener('change', (e) => {
    const filterValue = e.target.value;
    const cards = examsGrid.querySelectorAll('.exam-card');
    cards.forEach((card) => {
        if (filterValue === 'all') {
            card.classList.remove('hidden');
        }
        else {
            const type = card.querySelector('.exam-type')?.textContent;
            const typeMap = {
                'صح وخطأ': 'true-false',
                'اختيار من متعدد': 'multiple-choice',
                'مزيج': 'mixed'
            };
            card.classList.toggle('hidden', typeMap[type || ''] !== filterValue);
        }
    });
});
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            currentUser = userDoc.data();
            authBtn.textContent = 'الملف الشخصي';
            authBtn.href = currentUser.role === 'teacher' ? '/dashboard.html' : '/profile.html';
        }
    }
});
document.addEventListener('DOMContentLoaded', loadExams);
