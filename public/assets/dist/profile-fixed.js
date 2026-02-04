// Firebase CDN imports
const { initializeApp } = window.firebase;
const { getAuth, onAuthStateChanged, signOut } = window.firebase.auth;
const { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc } = window.firebase.firestore;

const firebaseConfig = {
    apiKey: "AIzaSyAU0CCiQNrPEYpTNU4rAwmOmPUZnjb2FoU",
    authDomain: "a-platform-for-learning.firebaseapp.com",
    projectId: "a-platform-for-learning",
    storageBucket: "a-platform-for-learning.firebasestorage.app",
    messagingSenderId: "764579707883",
    appId: "1:764579707883:web:5456e2348354cc58fab7ae",
    measurementId: "G-4P972FP416",
    databaseURL: "https://a-platform-for-learning-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentFilter = 'all';

const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const loadingOverlay = document.getElementById('loadingOverlay');

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }[type];
    
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
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(30, 41, 59, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                border-left: 4px solid;
            }
            
            .toast-success { border-left-color: #10b981; }
            .toast-error { border-left-color: #ef4444; }
            .toast-warning { border-left-color: #f59e0b; }
            .toast-info { border-left-color: #3b82f6; }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: #f1f5f9;
            }
            
            .toast-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                font-size: 0.95rem;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .toast-close:hover {
                background: rgba(148, 163, 184, 0.2);
                color: #f1f5f9;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @media (max-width: 640px) {
                .toast {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
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
    }, duration);
}

function showConfirmDialog(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3 class="modal-title">تأكيد العملية</h3>
            </div>
            <div class="modal-body">
                <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 2rem;">${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger confirm-btn">تأكيد</button>
                <button class="btn btn-secondary cancel-btn">إلغاء</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    
    confirmBtn.addEventListener('click', () => {
        modal.remove();
        onConfirm();
    });
    
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    setTimeout(() => confirmBtn.focus(), 100);
}

function showLoading() {
    loadingOverlay?.classList.add('active');
}

function hideLoading() {
    loadingOverlay?.classList.remove('active');
}

function generateInitials(name) {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `منذ ${diffInWeeks} أسبوع`;
    
    return formatDate(dateString);
}

async function checkAuth() {
    const storedEmail = localStorage.getItem('currentUserEmail');
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedEmail || !storedUser) {
        window.location.href = '../login.html';
        return null;
    }
    
    try {
        const userData = JSON.parse(storedUser);
        currentUser = {
            uid: userData.uid || 'local-user',
            name: userData.name,
            email: userData.email,
            role: localStorage.getItem('userRole') || 'student'
        };
        
        updateProfileUI(currentUser.name, currentUser.email);
        return currentUser;
    } catch (error) {
        localStorage.clear();
        window.location.href = '../login.html';
        return null;
    }
}

function updateProfileUI(displayName, userEmail) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userInitialsEl = document.getElementById('userInitials');
    
    if (userNameEl) userNameEl.textContent = displayName;
    if (userEmailEl) userEmailEl.textContent = userEmail;
    if (userInitialsEl) userInitialsEl.textContent = generateInitials(displayName);
}

function extractNameFromEmail(email) {
    const namePart = email.split('@')[0];
    return namePart
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

async function loadProgress() {
    if (!currentUser) return;
    
    try {
        const [videosSnap, examsSnap, progressSnap, todosSnap] = await Promise.all([
            getDocs(collection(db, 'lessons')),
            getDocs(collection(db, 'exams')),
            getDocs(query(collection(db, 'progress'), where('studentId', '==', currentUser.uid))),
            getDocs(query(collection(db, 'todos'), where('userId', '==', currentUser.uid), where('completed', '==', false)))
        ]);
        
        const totalVideos = videosSnap.size;
        const totalExams = examsSnap.size;
        const activeTodos = todosSnap.size;
        
        let completedVideos = 0;
        let completedExams = 0;
        
        progressSnap.forEach((doc) => {
            const progress = doc.data();
            completedVideos += progress.lessonsCompleted?.length || 0;
            completedExams += progress.examsCompleted?.length || 0;
        });
        
        // Update stats
        document.getElementById('completedVideos').textContent = completedVideos.toString();
        document.getElementById('completedExams').textContent = completedExams.toString();
        document.getElementById('totalVideosCount').textContent = totalVideos.toString();
        document.getElementById('totalExamsCount').textContent = totalExams.toString();
        document.getElementById('watchedVideos').textContent = completedVideos.toString();
        document.getElementById('passedExams').textContent = completedExams.toString();
        document.getElementById('totalTodos').textContent = activeTodos.toString();
        
        // Update progress bars
        const videoProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
        const examProgress = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;
        
        document.getElementById('videoProgress').textContent = `${videoProgress}%`;
        document.getElementById('examProgress').textContent = `${examProgress}%`;
        
        const videoBar = document.getElementById('videoProgressBar');
        const examBar = document.getElementById('examProgressBar');
        
        if (videoBar) {
            videoBar.style.width = `${videoProgress}%`;
            videoBar.parentElement?.setAttribute('aria-valuenow', videoProgress.toString());
        }
        
        if (examBar) {
            examBar.style.width = `${examProgress}%`;
            examBar.parentElement?.setAttribute('aria-valuenow', examProgress.toString());
        }
        
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

async function loadTodos() {
    if (!currentUser || !todoList) return;
    
    console.log('Loading todos for user:', currentUser.uid);
    
    try {
        const todosQuery = query(
            collection(db, 'todos'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(todosQuery);
        
        console.log('Todos snapshot size:', snapshot.size);
        
        // If no todos exist, create some sample data
        if (snapshot.empty) {
            console.log('No todos found, creating sample data...');
            await createSampleTodos();
            // Reload after creating sample data
            setTimeout(() => loadTodos(), 1000);
            return;
        }
        
        const todos = [];
        snapshot.forEach((docSnap) => {
            todos.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        console.log('Loaded todos:', todos.length);
        
        const filteredTodos = todos.filter(shouldShowTodo);
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<div class="empty-state"><p>لا توجد مهام تطابق الفلتر المحدد</p></div>';
            return;
        }
        
        todoList.innerHTML = '';
        filteredTodos.forEach((todo) => {
            const item = createTodoItem(todo);
            todoList.appendChild(item);
        });
        
        console.log('Todos rendered successfully');
        
    } catch (error) {
        console.error('Error loading todos:', error);
        todoList.innerHTML = '<div class="error-state"><p>❌ حدث خطأ في تحميل المهام</p></div>';
    }
}

async function createSampleTodos() {
    if (!currentUser) return;
    
    console.log('Creating sample todos...');
    
    const sampleTodos = [
        {
            userId: currentUser.uid,
            title: 'مراجعة الدرس الأول في الرياضيات',
            description: 'مراجعة شاملة للمفاهيم الأساسية والتمارين المهمة',
            completed: false,
            priority: 'high',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            userId: currentUser.uid,
            title: 'حل تمارين الفيزياء - الفصل الثالث',
            description: 'إنجاز جميع التمارين المطلوبة من الكتاب المدرسي',
            completed: true,
            priority: 'medium',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            userId: currentUser.uid,
            title: 'قراءة الفصل الثالث من كتاب التاريخ',
            description: 'قراءة وتلخيص الأحداث التاريخية المهمة',
            completed: false,
            priority: 'low',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    try {
        for (const todo of sampleTodos) {
            await addDoc(collection(db, 'todos'), todo);
        }
        console.log('Sample todos created successfully');
    } catch (error) {
        console.error('Error creating sample todos:', error);
    }
}

function shouldShowTodo(todo) {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'completed') return todo.completed;
    if (currentFilter === 'pending') return !todo.completed;
    return true;
}

function createTodoItem(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
    
    const dueDate = todo.dueDate ? formatDate(todo.dueDate) : '';
    const timeAgo = getTimeAgo(todo.createdAt);
    
    div.innerHTML = `
        <div class="todo-checkbox">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
        </div>
        <div class="todo-content">
            <h4 class="todo-title">${todo.title}</h4>
            ${todo.description ? `<p class="todo-description">${todo.description}</p>` : ''}
            <div class="todo-meta">
                <span class="todo-priority ${todo.priority}">${getPriorityLabel(todo.priority)}</span>
                ${dueDate ? `<span class="todo-due">📅 ${dueDate}</span>` : ''}
                <span class="todo-time">🕒 ${timeAgo}</span>
            </div>
        </div>
        <div class="todo-actions">
            <button class="btn-icon delete-todo" data-id="${todo.id}" aria-label="حذف المهمة" title="حذف المهمة">🗑️</button>
        </div>
    `;
    
    const checkbox = div.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => handleToggleTodo(todo.id, checkbox.checked));
    
    const deleteBtn = div.querySelector('.delete-todo');
    deleteBtn.addEventListener('click', () => handleDeleteTodo(todo.id));
    
    return div;
}

function getPriorityLabel(priority) {
    const labels = {
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة'
    };
    return labels[priority] || 'متوسطة';
}

async function handleToggleTodo(id, completed) {
    try {
        await updateDoc(doc(db, 'todos', id), { 
            completed,
            updatedAt: new Date().toISOString()
        });
        loadTodos();
        loadProgress();
        showToast(completed ? 'تم إكمال المهمة بنجاح!' : 'تم إلغاء إكمال المهمة', 'success');
    } catch (error) {
        console.error('Error toggling todo:', error);
        showToast('حدث خطأ في تحديث المهمة', 'error');
    }
}

async function handleDeleteTodo(id) {
    showConfirmDialog(
        'هل أنت متأكد من حذف هذه المهمة؟\nلا يمكن التراجع عن هذا الإجراء.',
        async () => {
            try {
                await deleteDoc(doc(db, 'todos', id));
                loadTodos();
                loadProgress();
                showToast('تم حذف المهمة بنجاح', 'success');
            } catch (error) {
                console.error('Error deleting todo:', error);
                showToast('حدث خطأ في حذف المهمة', 'error');
            }
        }
    );
}

function showAddTodoModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">➕ إضافة مهمة جديدة</h2>
                <button class="modal-close" aria-label="إغلاق">×</button>
            </div>
            <form id="addTodoForm" class="form">
                <div class="form-group">
                    <label for="todoTitle" class="form-label">عنوان المهمة *</label>
                    <input type="text" id="todoTitle" class="form-input" placeholder="مثال: مراجعة الدرس الأول" required>
                </div>
                <div class="form-group">
                    <label for="todoDescription" class="form-label">وصف المهمة (اختياري)</label>
                    <textarea id="todoDescription" class="form-input" rows="3" placeholder="تفاصيل إضافية عن المهمة..."></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="todoPriority" class="form-label">مستوى الأولوية</label>
                        <select id="todoPriority" class="form-input">
                            <option value="low">منخفضة</option>
                            <option value="medium" selected>متوسطة</option>
                            <option value="high">عالية</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="todoDueDate" class="form-label">تاريخ الاستحقاق (اختياري)</label>
                        <input type="date" id="todoDueDate" class="form-input" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">➕ إضافة المهمة</button>
                    <button type="button" class="btn btn-secondary close-modal">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#addTodoForm');
    const closeBtn = modal.querySelector('.close-modal');
    const modalClose = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('todoTitle').value.trim();
        const description = document.getElementById('todoDescription').value.trim();
        const priority = document.getElementById('todoPriority').value;
        const dueDate = document.getElementById('todoDueDate').value;
        
        if (!title) {
            showToast('يرجى إدخال عنوان المهمة', 'warning');
            return;
        }
        
        const todo = {
            userId: currentUser.uid,
            title,
            description: description || undefined,
            completed: false,
            priority,
            dueDate: dueDate || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            await addDoc(collection(db, 'todos'), todo);
            modal.remove();
            loadTodos();
            loadProgress();
            showToast('تم إضافة المهمة بنجاح!', 'success');
        } catch (error) {
            console.error('Error adding todo:', error);
            showToast('حدث خطأ أثناء إضافة المهمة', 'error');
        }
    });
    
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    setTimeout(() => {
        document.getElementById('todoTitle')?.focus();
    }, 100);
}

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}Tab`) {
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

async function loadExamResults() {
    if (!currentUser) return;
    
    const container = document.getElementById('examResults');
    if (!container) return;
    
    const sampleResults = [
        { title: 'امتحان الرياضيات المتقدمة', score: 17, total: 20, date: '10 فبراير 2026', timeAgo: 'منذ 3 أيام' },
        { title: 'امتحان الفيزياء النووية', score: 23, total: 25, date: '8 فبراير 2026', timeAgo: 'منذ 5 أيام' },
        { title: 'امتحان الكيمياء العضوية', score: 9, total: 20, date: '5 فبراير 2026', timeAgo: 'منذ أسبوع' },
        { title: 'امتحان التاريخ الحديث', score: 39, total: 50, date: '3 فبراير 2026', timeAgo: 'منذ 10 أيام' }
    ];
    
    container.innerHTML = '';
    sampleResults.forEach(result => {
        const percentage = Math.round((result.score / result.total) * 100);
        const passed = percentage >= 50;
        
        const item = document.createElement('div');
        item.className = `result-item ${passed ? 'passed' : 'failed'}`;
        item.innerHTML = `
            <div class="result-info">
                <h4>${result.title}</h4>
                <p>📅 ${result.date}</p>
                <p>🕒 ${result.timeAgo}</p>
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
        container.appendChild(item);
    });
}

async function loadAchievements() {
    if (!currentUser) return;
    
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    const achievements = [
        {
            title: 'أول خطوة',
            description: 'شاهد أول فيديو تعليمي',
            icon: '🎬',
            unlocked: true,
            progress: 1,
            target: 1
        },
        {
            title: 'خبير المشاهدة',
            description: 'شاهد 10 فيديوهات تعليمية',
            icon: '🏆',
            unlocked: false,
            progress: 3,
            target: 10
        },
        {
            title: 'أول امتحان',
            description: 'اجتز أول امتحان بنجاح',
            icon: '📝',
            unlocked: true,
            progress: 1,
            target: 1
        },
        {
            title: 'منظم المهام',
            description: 'أكمل 20 مهمة',
            icon: '✅',
            unlocked: false,
            progress: 5,
            target: 20
        }
    ];
    
    container.innerHTML = '';
    achievements.forEach(achievement => {
        const progressPercentage = achievement.target > 0 ? Math.round((achievement.progress / achievement.target) * 100) : 0;
        
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
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <span class="progress-text">${achievement.progress}/${achievement.target}</span>
            </div>
            ${achievement.unlocked ? '<div class="achievement-badge">مكتمل</div>' : ''}
        `;
        container.appendChild(card);
    });
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Filter buttons
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter') || 'all';
            loadTodos();
        });
    });
    
    // Tab buttons
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const tab = btn.getAttribute('data-tab');
            if (tab) {
                switchTab(tab);
            }
        });
    });
    
    // Add todo button
    if (addTodoBtn) {
        console.log('Adding todo button listener');
        addTodoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add todo clicked');
            showAddTodoModal();
        });
    }
    
    console.log('Event listeners initialized successfully');
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const storedEmail = localStorage.getItem('currentUserEmail');
    if (storedEmail) {
        const fallbackName = extractNameFromEmail(storedEmail);
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userInitialsEl = document.getElementById('userInitials');
        
        if (userNameEl) userNameEl.textContent = fallbackName;
        if (userEmailEl) userEmailEl.textContent = storedEmail;
        if (userInitialsEl) userInitialsEl.textContent = generateInitials(fallbackName);
    }
    
    try {
        await checkAuth();
        if (currentUser) {
            await loadProgress();
            
            setTimeout(() => {
                initializeEventListeners();
                switchTab('todos');
            }, 100);
        }
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
});