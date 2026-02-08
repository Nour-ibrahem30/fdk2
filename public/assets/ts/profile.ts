// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBmJJ5_wZ8X9QX9X9X9X9X9X9X9X9X9X9X',
  authDomain: 'philosopher-platform.firebaseapp.com',
  projectId: 'philosopher-platform',
  storageBucket: 'philosopher-platform.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:65ef9206be0'
};

// Firebase variables
let app: any;
let auth: any;
let db: any;

// Initialize Firebase
function initFirebase() {
  if ((window as any).firebase && (window as any).firebase.app) {
    app = (window as any).firebase.initializeApp(firebaseConfig);
    auth = (window as any).firebase.auth(app);
    db = (window as any).firebase.firestore(app);
    console.log('✅ Firebase initialized');
    return true;
  }
  return false;
}

// Retry Firebase initialization
let retries = 0;
const firebaseInitInterval = setInterval(() => {
  if (initFirebase()) {
    clearInterval(firebaseInitInterval);
  } else if (retries++ > 10) {
    clearInterval(firebaseInitInterval);
    console.error('❌ Firebase failed to load');
  }
}, 100);

// Types
interface User {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  createdAt: string;
  updatedAt: string;
}

// State
let currentUser: User | null = null;
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

let todos: Todo[] = [
  { id: '1', title: 'مراجعة الدرس الأول في الرياضيات', description: 'مراجعة شاملة للمفاهيم الأساسية', completed: false, priority: 'high', dueDate: '2024-02-20' },
  { id: '2', title: 'حل تمارين الفيزياء', description: 'إنجاز التمارين المطلوبة', completed: true, priority: 'medium' },
  { id: '3', title: 'قراءة الفصل الثالث من التاريخ', description: 'قراءة وتلخيص الأحداث المهمة', completed: false, priority: 'low', dueDate: '2024-02-25' }
];

// Utils
function generateInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = { success: '✅', error: '❌', info: 'ℹ️' }[type];
  
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  if (!document.getElementById('toast-styles')) {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
      .toast {
        position: fixed; top: 20px; right: 20px;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px; padding: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000; animation: slideInRight 0.3s ease;
        max-width: 400px; border-left: 4px solid;
      }
      .toast-success { border-left-color: #10b981; }
      .toast-error { border-left-color: #ef4444; }
      .toast-info { border-left-color: #3b82f6; }
      .toast-content { display: flex; align-items: center; gap: 0.75rem; color: #f1f5f9; }
      .toast-icon { font-size: 1.2rem; flex-shrink: 0; }
      .toast-message { flex: 1; font-size: 0.95rem; }
      .toast-close {
        background: none; border: none; color: #94a3b8;
        font-size: 1.2rem; cursor: pointer; padding: 0;
        width: 24px; height: 24px; display: flex;
        align-items: center; justify-content: center;
        border-radius: 50%; transition: all 0.3s ease;
      }
      .toast-close:hover { background: rgba(148, 163, 184, 0.2); color: #f1f5f9; }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

function extractNameFromEmail(email: string): string {
  const namePart = email.split('@')[0];
  return namePart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// UI Updates
function updateProfileUI(name: string, email: string) {
  if (!name || name.trim().length < 1) {
    name = extractNameFromEmail(email);
  }

  const attempts = [0, 50, 100, 200, 500];
  attempts.forEach(delay => {
    setTimeout(() => {
      const nameEl = document.getElementById('userName');
      const emailEl = document.getElementById('userEmail');
      const initialsEl = document.getElementById('userInitials');

      if (nameEl) {
        nameEl.textContent = name;
      }
      if (emailEl) {
        emailEl.textContent = email;
      }
      if (initialsEl) {
        initialsEl.textContent = generateInitials(name);
      }
    }, delay);
  });
}

// Auth
async function checkAuth(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (!auth) {
        return;
      }
      clearInterval(checkInterval);

      auth.onAuthStateChanged(async (user: any) => {
        if (!user) {
          const storedEmail = localStorage.getItem('currentUserEmail');
          const storedUser = localStorage.getItem('currentUser');
          
          if (storedEmail && storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              const displayName = userData.name || extractNameFromEmail(storedEmail);
              
              currentUser = {
                uid: userData.uid || 'local-user',
                name: displayName,
                email: storedEmail,
                role: (localStorage.getItem('userRole') as 'student' | 'teacher') || 'student',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              updateProfileUI(displayName, storedEmail);
              showToast(`مرحباً ${displayName.split(' ')[0]}`, 'success');
              resolve();
              return;
            } catch (error) {
              console.error('Error parsing stored user:', error);
            }
          }
          
          showToast('يجب تسجيل الدخول', 'error');
          setTimeout(() => window.location.href = '/public/pages/login.html', 2000);
          resolve();
          return;
        }

        try {
          const userRef = (window as any).firebase.firestore.doc(db, 'users', user.uid);
          const snap = await (window as any).firebase.firestore.getDoc(userRef);

          if (!snap.exists()) {
            const displayName = user.displayName || extractNameFromEmail(user.email || '');
            const newUser: User = {
              uid: user.uid,
              name: displayName,
              email: user.email || '',
              role: 'student',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await (window as any).firebase.firestore.setDoc(userRef, newUser);
            currentUser = newUser;
          } else {
            currentUser = snap.data() as User;
          }

          if (currentUser.role === 'teacher') {
            window.location.href = '/public/pages/dashboard.html';
            resolve();
            return;
          }

          updateProfileUI(currentUser.name, currentUser.email);
          showToast(`مرحباً ${currentUser.name.split(' ')[0]}`, 'success');
          resolve();

        } catch (err) {
          console.error('Auth error:', err);
          showToast('حدث خطأ في المصادقة', 'error');
          resolve();
        }
      });
    }, 100);
  });
}

// Data Loading
async function loadProgress() {
  if (!currentUser) {
    return;
  }
  
  const completedVideos = 5, totalVideos = 20;
  const completedExams = 3, totalExams = 10;
  const activeTodos = 7;
  
  const elements = {
    completedVideos: document.getElementById('completedVideos'),
    completedExams: document.getElementById('completedExams'),
    totalVideosCount: document.getElementById('totalVideosCount'),
    totalExamsCount: document.getElementById('totalExamsCount'),
    watchedVideos: document.getElementById('watchedVideos'),
    passedExams: document.getElementById('passedExams'),
    totalTodos: document.getElementById('totalTodos'),
    videoProgress: document.getElementById('videoProgress'),
    examProgress: document.getElementById('examProgress'),
    videoProgressBar: document.getElementById('videoProgressBar'),
    examProgressBar: document.getElementById('examProgressBar')
  };
  
  if (elements.completedVideos) {
    elements.completedVideos.textContent = completedVideos.toString();
  }
  if (elements.completedExams) {
    elements.completedExams.textContent = completedExams.toString();
  }
  if (elements.totalVideosCount) {
    elements.totalVideosCount.textContent = totalVideos.toString();
  }
  if (elements.totalExamsCount) {
    elements.totalExamsCount.textContent = totalExams.toString();
  }
  if (elements.watchedVideos) {
    elements.watchedVideos.textContent = completedVideos.toString();
  }
  if (elements.passedExams) {
    elements.passedExams.textContent = completedExams.toString();
  }
  if (elements.totalTodos) {
    elements.totalTodos.textContent = activeTodos.toString();
  }
  
  const videoProgress = Math.round((completedVideos / totalVideos) * 100);
  const examProgress = Math.round((completedExams / totalExams) * 100);
  
  if (elements.videoProgress) {
    elements.videoProgress.textContent = videoProgress + '%';
  }
  if (elements.examProgress) {
    elements.examProgress.textContent = examProgress + '%';
  }
  
  if (elements.videoProgressBar) {
    (elements.videoProgressBar as HTMLElement).style.width = videoProgress + '%';
  }
  if (elements.examProgressBar) {
    (elements.examProgressBar as HTMLElement).style.width = examProgress + '%';
  }
}

function loadTodos() {
  const todoList = document.getElementById('todoList');
  if (!todoList) {
    return;
  }
  
  todoList.innerHTML = '';
  
  todos.forEach(todo => {
    const todoElement = document.createElement('div');
    todoElement.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
    
    const priorityLabels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    
    todoElement.innerHTML = `
      <div class="todo-checkbox">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
      </div>
      <div class="todo-content">
        <h4 class="todo-title">${todo.title}</h4>
        ${todo.description ? `<p class="todo-description">${todo.description}</p>` : ''}
        <div class="todo-meta">
          <span class="todo-priority ${todo.priority}">${priorityLabels[todo.priority as keyof typeof priorityLabels]}</span>
          ${todo.dueDate ? `<span class="todo-due">📅 ${todo.dueDate}</span>` : ''}
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-icon delete-todo" data-id="${todo.id}" title="حذف المهمة">🗑️</button>
      </div>
    `;
    
    todoList.appendChild(todoElement);
  });
}

function loadExamResults() {
  const container = document.getElementById('examResults');
  if (!container) {
    return;
  }
  
  const sampleResults = [
    { title: 'امتحان الرياضيات', score: 85, total: 100, date: '2024-02-10' },
    { title: 'امتحان الفيزياء', score: 92, total: 100, date: '2024-02-08' },
    { title: 'امتحان الكيمياء', score: 78, total: 100, date: '2024-02-05' }
  ];
  
  container.innerHTML = '';
  
  sampleResults.forEach(result => {
    const percentage = Math.round((result.score / result.total) * 100);
    const passed = percentage >= 50;
    
    const resultElement = document.createElement('div');
    resultElement.className = `result-item ${passed ? 'passed' : 'failed'}`;
    
    resultElement.innerHTML = `
      <div class="result-info">
        <h4>📝 ${result.title}</h4>
        <p>📅 ${result.date}</p>
      </div>
      <div class="result-score">
        <span class="score-value">${percentage}%</span>
        <span class="score-label">${result.score}/${result.total}</span>
      </div>
      <div class="result-status">
        <span class="${passed ? 'badge-success' : 'badge-danger'}">
          ${passed ? '✅ ناجح' : '❌ راسب'}
        </span>
      </div>
    `;
    
    container.appendChild(resultElement);
  });
}

function loadAchievements() {
  const container = document.getElementById('achievementsList');
  if (!container) {
    return;
  }
  
  const achievements = [
    { title: 'أول خطوة', description: 'شاهد أول فيديو تعليمي', icon: '🎬', unlocked: true, progress: 100 },
    { title: 'خبير المشاهدة', description: 'شاهد 10 فيديوهات تعليمية', icon: '🏆', unlocked: false, progress: 50 },
    { title: 'أول امتحان', description: 'اجتز أول امتحان بنجاح', icon: '📝', unlocked: true, progress: 100 }
  ];
  
  container.innerHTML = '';
  
  achievements.forEach(achievement => {
    const card = document.createElement('div');
    card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    
    card.innerHTML = `
      <div class="achievement-icon ${achievement.unlocked ? 'unlocked' : 'locked'}">
        ${achievement.unlocked ? achievement.icon : '🔒'}
      </div>
      <h3 class="achievement-title">${achievement.title}</h3>
      <p class="achievement-description">${achievement.description}</p>
      <div class="achievement-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${achievement.progress}%"></div>
        </div>
        <span class="progress-text">${achievement.progress}%</span>
      </div>
      ${achievement.unlocked ? '<div class="achievement-badge">مكتمل</div>' : ''}
    `;
    
    container.appendChild(card);
  });
}

// Add Todo Modal
function showAddTodoModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>➕ إضافة مهمة جديدة</h2>
        <button class="modal-close">×</button>
      </div>
      <form id="addTodoForm">
        <div class="form-group">
          <label>عنوان المهمة *</label>
          <input type="text" id="todoTitle" required placeholder="مثال: مراجعة الدرس الأول">
        </div>
        <div class="form-group">
          <label>وصف المهمة</label>
          <textarea id="todoDescription" placeholder="تفاصيل إضافية عن المهمة..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>الأولوية</label>
            <select id="todoPriority">
              <option value="low">🟢 منخفضة</option>
              <option value="medium" selected>🟡 متوسطة</option>
              <option value="high">🔴 عالية</option>
            </select>
          </div>
          <div class="form-group">
            <label>تاريخ الاستحقاق</label>
            <input type="date" id="todoDueDate">
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">✅ إضافة المهمة</button>
          <button type="button" class="btn btn-secondary close-modal">❌ إلغاء</button>
        </div>
      </form>
    </div>
  `;
  
  if (!document.getElementById('modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
      .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; display: flex; align-items: center; justify-content: center; }
      .modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
      .modal-content { background: #1e293b; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; position: relative; }
      .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
      .modal-header h2 { color: #f1f5f9; margin: 0; }
      .modal-close { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
      .form-group { margin-bottom: 1rem; }
      .form-group label { display: block; color: #f1f5f9; margin-bottom: 0.5rem; }
      .form-group input, .form-group textarea, .form-group select {
        width: 100%; padding: 0.75rem; border: 1px solid #475569; border-radius: 8px;
        background: #334155; color: #f1f5f9; font-family: inherit;
      }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
      .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
      .btn-primary { background: #3b82f6; color: white; }
      .btn-secondary { background: #6b7280; color: white; }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(modal);
  
  const form = modal.querySelector('#addTodoForm');
  const closeBtn = modal.querySelector('.modal-close');
  const cancelBtn = modal.querySelector('.close-modal');
  const overlay = modal.querySelector('.modal-overlay');
  
  const closeModal = () => modal.remove();
  
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = (document.getElementById('todoTitle') as HTMLInputElement).value.trim();
    const description = (document.getElementById('todoDescription') as HTMLTextAreaElement).value.trim();
    const priority = (document.getElementById('todoPriority') as HTMLSelectElement).value;
    const dueDate = (document.getElementById('todoDueDate') as HTMLInputElement).value;
    
    if (!title) {
      showToast('يرجى إدخال عنوان المهمة', 'error');
      return;
    }
    
    const newTodo = {
      id: Date.now().toString(),
      title,
      description: description || undefined,
      completed: false,
      priority: priority as 'low' | 'medium' | 'high',
      dueDate: dueDate || undefined
    };
    
    todos.push(newTodo);
    loadTodos();
    closeModal();
    showToast('تم إضافة المهمة بنجاح!', 'success');
  });
  
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  
  setTimeout(() => {
    (document.getElementById('todoTitle') as HTMLInputElement)?.focus();
  }, 100);
}

// Tab Management
function switchTab(tabName: string) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    }
  });
  
  tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === tabName + 'Tab') {
      content.classList.add('active');
    }
  });
  
  if (tabName === 'todos') {
    loadTodos();
  } else if (tabName === 'results') {
    loadExamResults();
  } else if (tabName === 'achievements') {
    loadAchievements();
  }
}

// Event Listeners
function initializeEventListeners() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      if (tabName) {
        switchTab(tabName);
      }
    });
  });
  
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadTodos();
    });
  });
  
  const addTodoBtn = document.getElementById('addTodoBtn');
  if (addTodoBtn) {
    addTodoBtn.addEventListener('click', () => {
      showAddTodoModal();
    });
  }
  
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    if ((target as HTMLInputElement).type === 'checkbox' && target.dataset.id) {
      const todoItem = target.closest('.todo-item');
      const todoId = target.dataset.id;
      if (todoItem && todoId) {
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
          todo.completed = (target as HTMLInputElement).checked;
          todoItem.classList.toggle('completed', todo.completed);
          showToast(todo.completed ? 'تم إكمال المهمة!' : 'تم إلغاء إكمال المهمة', 'success');
        }
      }
    }
    
    if (target.classList.contains('delete-todo')) {
      const todoItem = target.closest('.todo-item');
      const todoId = target.dataset.id;
      if (todoItem && todoId) {
        todos = todos.filter(todo => todo.id !== todoId);
        todoItem.remove();
        showToast('تم حذف المهمة', 'success');
      }
    }
  });
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Profile page loading...');
  
  try {
    await checkAuth();
    
    if (currentUser) {
      console.log('✅ User authenticated:', currentUser.name);
      await loadProgress();
      initializeEventListeners();
      switchTab('todos');
      console.log('🎉 Profile page initialized successfully');
    }
  } catch (error) {
    console.error('❌ Error initializing profile:', error);
    showToast('حدث خطأ في تحميل الصفحة', 'error');
  }
});