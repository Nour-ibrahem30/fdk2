import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let currentFilter = 'all';
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
        if (onCancel)
            onCancel();
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
    if (diffInHours < 1)
        return 'منذ أقل من ساعة';
    if (diffInHours < 24)
        return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
        return `منذ ${diffInDays} يوم`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4)
        return `منذ ${diffInWeeks} أسبوع`;
    return formatDate(dateString);
}
async function checkAuth() {
    showLoading();
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                const storedEmail = localStorage.getItem('currentUserEmail');
                const storedUser = localStorage.getItem('currentUser');
                if (storedEmail && storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        let displayName = userData.name;
                        if (!displayName || displayName === 'المستخدم') {
                            displayName = extractNameFromEmail(storedEmail);
                        }
                        currentUser = {
                            uid: userData.uid || 'local-user',
                            name: displayName,
                            email: userData.email || storedEmail,
                            role: localStorage.getItem('userRole') || 'student',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        updateProfileUI(displayName, currentUser.email);
                        hideLoading();
                        showToast('مرحباً ' + displayName.split(' ')[0] + '!', 'success');
                        resolve(currentUser);
                        return;
                    }
                    catch (error) {
                        console.error('Error parsing stored user:', error);
                    }
                }
                hideLoading();
                showToast('يجب تسجيل الدخول للوصول إلى الملف الشخصي', 'warning');
                setTimeout(() => {
                    window.location.href = '/public/pages/login.html';
                }, 2000);
                resolve(null);
                return;
            }
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (!userDoc.exists()) {
                    const displayName = user.displayName || extractNameFromEmail(user.email || '');
                    const newUserData = {
                        uid: user.uid,
                        name: displayName,
                        email: user.email || '',
                        role: 'student',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await setDoc(doc(db, 'users', user.uid), newUserData);
                    currentUser = newUserData;
                    showToast('تم إنشاء ملفك الشخصي بنجاح!', 'success');
                }
                else {
                    const userData = userDoc.data();
                    if (userData.role === 'teacher') {
                        hideLoading();
                        showToast('سيتم توجيهك إلى لوحة التحكم', 'info');
                        setTimeout(() => {
                            window.location.href = '/public/pages/dashboard.html';
                        }, 2000);
                        resolve(null);
                        return;
                    }
                    currentUser = userData;
                }
                let displayName = currentUser.name;
                if (!displayName || displayName === 'المستخدم') {
                    displayName = user.displayName || extractNameFromEmail(user.email || '');
                }
                const userEmail = currentUser.email || user.email || 'user@example.com';
                updateProfileUI(displayName, userEmail);
                localStorage.setItem('currentUser', JSON.stringify({
                    name: displayName,
                    email: userEmail,
                    uid: currentUser.uid
                }));
                if (window.updateNavUserInfo) {
                    window.updateNavUserInfo({ name: displayName, email: userEmail });
                }
                window.currentUser = { name: displayName, email: userEmail, uid: currentUser.uid };
                hideLoading();
                showToast('مرحباً ' + displayName.split(' ')[0] + '!', 'success');
                resolve(currentUser);
            }
            catch (error) {
                console.error('Error checking auth:', error);
                hideLoading();
                showToast('حدث خطأ في تحميل بيانات المستخدم', 'error');
                setTimeout(() => {
                    window.location.href = '/public/pages/login.html';
                }, 3000);
                resolve(null);
            }
        });
    });
}
function updateProfileUI(displayName, userEmail) {
    console.log('🔄 Updating Profile UI with:', { displayName, userEmail });
    const doUpdate = () => {
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userInitialsEl = document.getElementById('userInitials');
        console.log('📋 Found elements:', {
            userNameEl: !!userNameEl,
            userEmailEl: !!userEmailEl,
            userInitialsEl: !!userInitialsEl
        });
        if (userNameEl) {
            userNameEl.textContent = displayName;
            userNameEl.style.color = '#f1f5f9';
            console.log('✅ Updated userName:', displayName);
        }
        else {
            console.error('❌ userName element not found!');
        }
        if (userEmailEl) {
            userEmailEl.textContent = userEmail;
            userEmailEl.style.color = '#94a3b8';
            console.log('✅ Updated userEmail:', userEmail);
        }
        else {
            console.error('❌ userEmail element not found!');
        }
        if (userInitialsEl) {
            const initials = generateInitials(displayName);
            userInitialsEl.textContent = initials;
            userInitialsEl.style.color = '#f1f5f9';
            console.log('✅ Updated userInitials:', initials);
        }
        else {
            console.error('❌ userInitials element not found!');
        }
    };
    doUpdate();
    setTimeout(doUpdate, 100);
    setTimeout(doUpdate, 500);
    console.log('🎉 Profile UI update completed');
}
async function saveProfileData(profileData) {
    if (!currentUser) {
        console.error('❌ No current user');
        showToast('لم يتم العثور على المستخدم', 'error');
        return;
    }
    try {
        showLoading();
        await updateDoc(doc(db, 'users', currentUser.uid), {
            name: profileData.name || currentUser.name,
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            country: profileData.country || '',
            updatedAt: new Date().toISOString()
        });
        currentUser = {
            ...currentUser,
            ...profileData,
            updatedAt: new Date().toISOString()
        };
        showToast('تم حفظ البيانات بنجاح!', 'success');
        if (currentUser) {
            updateProfileUI(currentUser.name, currentUser.email);
        }
    }
    catch (error) {
        console.error('❌ Error saving profile:', error);
        showToast('حدث خطأ أثناء حفظ البيانات', 'error');
    }
    finally {
        hideLoading();
    }
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
    if (!currentUser)
        return;
    try {
        const [videosSnap, examsSnap, progressSnap, todosSnap] = await Promise.all([
            getDocs(collection(db, 'lessons')),
            getDocs(collection(db, 'exams')),
            getDocs(query(collection(db, 'progress'), where('studentId', '==', currentUser.uid))),
            getDocs(query(collection(db, 'todos'), where('userId', '==', currentUser.uid)))
        ]);
        const totalVideos = videosSnap.size;
        const totalExams = examsSnap.size;
        const activeTodos = todosSnap.docs.filter((d) => !d.data().completed).length;
        let completedVideos = 0;
        let completedExams = 0;
        progressSnap.forEach((doc) => {
            const progress = doc.data();
            completedVideos += progress.lessonsCompleted?.length || 0;
            completedExams += progress.examsCompleted?.length || 0;
        });
        document.getElementById('completedVideos').textContent = completedVideos.toString();
        document.getElementById('completedExams').textContent = completedExams.toString();
        document.getElementById('totalVideosCount').textContent = totalVideos.toString();
        document.getElementById('totalExamsCount').textContent = totalExams.toString();
        document.getElementById('watchedVideos').textContent = completedVideos.toString();
        document.getElementById('passedExams').textContent = completedExams.toString();
        document.getElementById('totalTodos').textContent = activeTodos.toString();
        const videoProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
        const examProgress = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;
        document.getElementById('videoProgress').textContent = videoProgress + '%';
        document.getElementById('examProgress').textContent = examProgress + '%';
        const videoBar = document.getElementById('videoProgressBar');
        const examBar = document.getElementById('examProgressBar');
        if (videoBar) {
            videoBar.style.width = videoProgress + '%';
            videoBar.parentElement?.setAttribute('aria-valuenow', videoProgress.toString());
        }
        if (examBar) {
            examBar.style.width = examProgress + '%';
            examBar.parentElement?.setAttribute('aria-valuenow', examProgress.toString());
        }
    }
    catch (error) {
        console.error('Error loading progress:', error);
    }
}
async function loadTodos() {
    if (!currentUser)
        return;
    const todoList = document.getElementById('todoList');
    if (!todoList) {
        console.error('Todo list element not found!');
        return;
    }
    console.log('Loading todos for user:', currentUser.uid);
    try {
        const todosQuery = query(collection(db, 'todos'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(todosQuery);
        console.log('Todos snapshot size:', snapshot.size);
        if (snapshot.empty) {
            console.log('No todos found, creating sample data...');
            await createSampleTodos();
            setTimeout(() => loadTodos(), 1000);
            return;
        }
        const todos = [];
        snapshot.forEach((docSnap) => {
            todos.push({ id: docSnap.id, ...docSnap.data() });
        });
        todos.sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return bTime - aTime;
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
    }
    catch (error) {
        console.error('Error loading todos:', error);
        todoList.innerHTML = '<div class="error-state"><p>❌ حدث خطأ في تحميل المهام</p></div>';
    }
}
async function createSampleTodos() {
    if (!currentUser)
        return;
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
        },
        {
            userId: currentUser.uid,
            title: 'إعداد عرض تقديمي للكيمياء',
            description: 'تحضير عرض تقديمي عن التفاعلات الكيميائية',
            completed: false,
            priority: 'medium',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    try {
        for (const todo of sampleTodos) {
            await addDoc(collection(db, 'todos'), todo);
        }
        console.log('Sample todos created successfully');
    }
    catch (error) {
        console.error('Error creating sample todos:', error);
    }
}
function shouldShowTodo(todo) {
    if (currentFilter === 'all')
        return true;
    if (currentFilter === 'completed')
        return todo.completed;
    if (currentFilter === 'pending')
        return !todo.completed;
    return true;
}
function createTodoItem(todo) {
    const div = document.createElement('div');
    div.className = 'todo-item ' + (todo.completed ? 'completed' : '') + ' priority-' + todo.priority;
    const dueDate = todo.dueDate ? formatDate(todo.dueDate) : '';
    const timeAgo = getTimeAgo(todo.createdAt);
    const todoHTML = [
        '<div class="todo-checkbox">',
        '  <input type="checkbox" ' + (todo.completed ? 'checked' : '') + ' data-id="' + todo.id + '">',
        '</div>',
        '<div class="todo-content">',
        '  <h4 class="todo-title">' + todo.title + '</h4>',
        (todo.description ? '  <p class="todo-description">' + todo.description + '</p>' : ''),
        '  <div class="todo-meta">',
        '    <span class="todo-priority ' + todo.priority + '">' + getPriorityLabel(todo.priority) + '</span>',
        (dueDate ? '    <span class="todo-due">📅 ' + dueDate + '</span>' : ''),
        '    <span class="todo-time">⏰ ' + timeAgo + '</span>',
        '  </div>',
        '</div>',
        '<div class="todo-actions">',
        '  <button class="btn-icon delete-todo" data-id="' + todo.id + '" aria-label="حذف المهمة" title="حذف المهمة">',
        '    🗑️',
        '  </button>',
        '</div>'
    ].join('\n');
    div.innerHTML = todoHTML;
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
    }
    catch (error) {
        console.error('Error toggling todo:', error);
        showToast('حدث خطأ في تحديث المهمة', 'error');
    }
}
async function handleDeleteTodo(id) {
    showConfirmDialog('هل أنت متأكد من حذف هذه المهمة؟\nلا يمكن التراجع عن هذا الإجراء.', async () => {
        try {
            await deleteDoc(doc(db, 'todos', id));
            loadTodos();
            loadProgress();
            showToast('تم حذف المهمة بنجاح', 'success');
        }
        catch (error) {
            console.error('Error deleting todo:', error);
            showToast('حدث خطأ في حذف المهمة', 'error');
        }
    });
}
function showAddTodoModal() {
    console.log('🔄 Opening Add Todo Modal...');
    if (!currentUser) {
        console.error('❌ No current user found!');
        showToast('يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    console.log('✅ Current user:', currentUser.uid);
    const modal = document.createElement('div');
    modal.className = 'modal active';
    const modalHTML = [
        '<div class="modal-overlay"></div>',
        '<div class="modal-content">',
        '  <div class="modal-header">',
        '    <h2 class="modal-title">➕ إضافة مهمة جديدة</h2>',
        '    <button class="modal-close" aria-label="إغلاق">✕</button>',
        '  </div>',
        '  <form id="addTodoForm" class="form">',
        '    <div class="form-group">',
        '      <label for="todoTitle" class="form-label">عنوان المهمة *</label>',
        '      <input type="text" id="todoTitle" class="form-input" placeholder="مثال: مراجعة الدرس الأول" required>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="todoDescription" class="form-label">وصف المهمة (اختياري)</label>',
        '      <textarea id="todoDescription" class="form-input" rows="3" placeholder="تفاصيل إضافية عن المهمة..."></textarea>',
        '    </div>',
        '    <div class="form-row">',
        '      <div class="form-group">',
        '        <label for="todoPriority" class="form-label">مستوى الأولوية</label>',
        '        <select id="todoPriority" class="form-input">',
        '          <option value="low">🟢 منخفضة</option>',
        '          <option value="medium" selected>🟡 متوسطة</option>',
        '          <option value="high">🔴 عالية</option>',
        '        </select>',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="todoDueDate" class="form-label">تاريخ الاستحقاق (اختياري)</label>',
        '        <input type="date" id="todoDueDate" class="form-input" min="' + new Date().toISOString().split('T')[0] + '">',
        '      </div>',
        '    </div>',
        '    <div class="form-actions">',
        '      <button type="submit" class="btn btn-primary">',
        '        ✅ إضافة المهمة',
        '      </button>',
        '      <button type="button" class="btn btn-secondary close-modal">',
        '        ❌ إلغاء',
        '      </button>',
        '    </div>',
        '  </form>',
        '</div>'
    ].join('\n');
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    console.log('✅ Modal added to DOM');
    const form = modal.querySelector('#addTodoForm');
    const closeBtn = modal.querySelector('.close-modal');
    const modalClose = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    if (!form) {
        console.error('❌ Form not found in modal!');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Form submitted');
        const titleInput = document.getElementById('todoTitle');
        const descriptionInput = document.getElementById('todoDescription');
        const priorityInput = document.getElementById('todoPriority');
        const dueDateInput = document.getElementById('todoDueDate');
        if (!titleInput || !descriptionInput || !priorityInput || !dueDateInput) {
            console.error('❌ Form inputs not found!');
            showToast('حدث خطأ في النموذج', 'error');
            return;
        }
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value;
        console.log('📋 Form data:', { title, description, priority, dueDate });
        if (!title) {
            showToast('يرجى إدخال عنوان المهمة', 'warning');
            titleInput.focus();
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
            console.log('💾 Saving todo to database...');
            showLoading();
            await addDoc(collection(db, 'todos'), todo);
            console.log('✅ Todo saved successfully');
            hideLoading();
            modal.remove();
            await loadTodos();
            await loadProgress();
            showToast('تم إضافة المهمة بنجاح!', 'success');
        }
        catch (error) {
            console.error('❌ Error adding todo:', error);
            hideLoading();
            showToast('حدث خطأ أثناء إضافة المهمة: ' + error.message, 'error');
        }
    });
    const closeModal = () => {
        console.log('🔄 Closing modal');
        modal.remove();
    };
    if (closeBtn)
        closeBtn.addEventListener('click', closeModal);
    if (modalClose)
        modalClose.addEventListener('click', closeModal);
    if (overlay)
        overlay.addEventListener('click', closeModal);
    setTimeout(() => {
        const titleInput = document.getElementById('todoTitle');
        if (titleInput) {
            titleInput.focus();
            console.log('✅ Focused on title input');
        }
    }, 100);
    console.log('🎉 Add Todo Modal setup completed');
}
async function loadExamResults() {
    if (!currentUser)
        return;
    console.log('Loading exam results...');
    try {
        const resultsQuery = query(collection(db, 'examResults'), where('studentId', '==', currentUser.uid));
        const snapshot = await getDocs(resultsQuery);
        const container = document.getElementById('examResults');
        if (snapshot.empty) {
            console.log('No exam results found, creating sample data...');
            await createSampleExamResults();
            showSampleExamResults(container);
            return;
        }
        const results = [];
        snapshot.forEach((docSnap) => {
            results.push(docSnap.data());
        });
        results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        container.innerHTML = '';
        results.forEach((result) => {
            const percentage = Math.round((result.score / result.totalQuestions) * 100);
            const passed = percentage >= 50;
            const item = document.createElement('div');
            item.className = 'result-item ' + (passed ? 'passed' : 'failed');
            const itemHTML = [
                '<div class="result-info">',
                '  <h4>📝 امتحان</h4>',
                '  <p>📅 ' + formatDate(result.completedAt) + '</p>',
                '  <p>⏱️ ' + getTimeAgo(result.completedAt) + '</p>',
                '</div>',
                '<div class="result-score">',
                '  <span class="score-value">' + percentage + '%</span>',
                '  <span class="score-label">' + result.score + '/' + result.totalQuestions + '</span>',
                '</div>',
                '<div class="result-status">',
                '  <span class="' + (passed ? 'badge-success' : 'badge-danger') + '">',
                '    ' + (passed ? '✅ ناجح' : '❌ راسب'),
                '  </span>',
                '</div>'
            ].join('\n');
            item.innerHTML = itemHTML;
            container.appendChild(item);
        });
        console.log('Exam results loaded successfully');
    }
    catch (error) {
        console.error('Error loading exam results:', error);
        const container = document.getElementById('examResults');
        container.innerHTML = '<div class="error-state"><p>❌ حدث خطأ في تحميل النتائج</p></div>';
    }
}
async function createSampleExamResults() {
    if (!currentUser)
        return;
    console.log('Creating sample exam results...');
    const sampleResults = [
        {
            examId: 'exam1',
            studentId: currentUser.uid,
            answers: [1, 0, 1, 1, 0],
            score: 17,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            examId: 'exam2',
            studentId: currentUser.uid,
            answers: [1, 1, 1, 1, 1],
            score: 23,
            totalQuestions: 25,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            examId: 'exam3',
            studentId: currentUser.uid,
            answers: [0, 1, 0, 1, 0],
            score: 9,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            examId: 'exam4',
            studentId: currentUser.uid,
            answers: [1, 1, 1, 0, 1],
            score: 39,
            totalQuestions: 50,
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    try {
        for (const result of sampleResults) {
            await addDoc(collection(db, 'examResults'), result);
        }
        console.log('Sample exam results created successfully');
    }
    catch (error) {
        console.error('Error creating sample exam results:', error);
    }
}
function showSampleExamResults(container) {
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
        item.className = 'result-item ' + (passed ? 'passed' : 'failed');
        const itemHTML = [
            '<div class="result-info">',
            '  <h4>📝 ' + result.title + '</h4>',
            '  <p>📅 ' + result.date + '</p>',
            '  <p>⏱️ ' + result.timeAgo + '</p>',
            '</div>',
            '<div class="result-score">',
            '  <span class="score-value">' + percentage + '%</span>',
            '  <span class="score-label">' + result.score + '/' + result.total + '</span>',
            '</div>',
            '<div class="result-status">',
            '  <span class="' + (passed ? 'badge-success' : 'badge-danger') + '">',
            '    ' + (passed ? '✅ ناجح' : '❌ راسب'),
            '  </span>',
            '</div>'
        ].join('\n');
        item.innerHTML = itemHTML;
        container.appendChild(item);
    });
}
async function loadAchievements() {
    if (!currentUser)
        return;
    const container = document.getElementById('achievementsList');
    try {
        const [videosSnap, examsSnap, progressSnap, todosSnap] = await Promise.all([
            getDocs(collection(db, 'lessons')),
            getDocs(collection(db, 'exams')),
            getDocs(query(collection(db, 'progress'), where('studentId', '==', currentUser.uid))),
            getDocs(query(collection(db, 'todos'), where('userId', '==', currentUser.uid)))
        ]);
        const totalVideos = videosSnap.size;
        const totalExams = examsSnap.size;
        const completedTodos = todosSnap.docs.filter((d) => d.data().completed).length;
        let completedVideos = 0;
        let completedExams = 0;
        progressSnap.forEach((doc) => {
            const progress = doc.data();
            completedVideos += progress.lessonsCompleted?.length || 0;
            completedExams += progress.examsCompleted?.length || 0;
        });
        const achievements = [
            {
                id: 'first-video',
                title: 'أول خطوة',
                description: 'شاهد أول فيديو تعليمي',
                icon: '🎬',
                unlocked: completedVideos >= 1,
                progress: Math.min(completedVideos, 1),
                target: 1
            },
            {
                id: 'video-master',
                title: 'خبير المشاهدة',
                description: 'شاهد 10 فيديوهات تعليمية',
                icon: '🏆',
                unlocked: completedVideos >= 10,
                progress: Math.min(completedVideos, 10),
                target: 10
            },
            {
                id: 'first-exam',
                title: 'أول امتحان',
                description: 'اجتز أول امتحان بنجاح',
                icon: '📝',
                unlocked: completedExams >= 1,
                progress: Math.min(completedExams, 1),
                target: 1
            },
            {
                id: 'exam-expert',
                title: 'خبير الامتحانات',
                description: 'اجتز 5 امتحانات بنجاح',
                icon: '🎓',
                unlocked: completedExams >= 5,
                progress: Math.min(completedExams, 5),
                target: 5
            },
            {
                id: 'task-manager',
                title: 'منظم المهام',
                description: 'أكمل 20 مهمة',
                icon: '✅',
                unlocked: completedTodos >= 20,
                progress: Math.min(completedTodos, 20),
                target: 20
            },
            {
                id: 'completionist',
                title: 'المكمل',
                description: 'أكمل جميع الفيديوهات والامتحانات',
                icon: '🌟',
                unlocked: completedVideos >= totalVideos && completedExams >= totalExams && totalVideos > 0 && totalExams > 0,
                progress: totalVideos > 0 && totalExams > 0 ? Math.min(completedVideos + completedExams, totalVideos + totalExams) : 0,
                target: totalVideos + totalExams
            }
        ];
        container.innerHTML = '';
        achievements.forEach(achievement => {
            const progressPercentage = achievement.target > 0 ? Math.round((achievement.progress / achievement.target) * 100) : 0;
            const card = document.createElement('div');
            card.className = 'achievement-card ' + (achievement.unlocked ? 'unlocked' : 'locked');
            const cardHTML = [
                '<div class="achievement-icon ' + (achievement.unlocked ? 'unlocked' : 'locked') + '">',
                '  ' + (achievement.unlocked ? achievement.icon : '🔒'),
                '</div>',
                '<h3 class="achievement-title">' + achievement.title + '</h3>',
                '<p class="achievement-description">' + achievement.description + '</p>',
                '<div class="achievement-progress">',
                '  <div class="progress-bar">',
                '    <div class="progress-fill" style="width: ' + progressPercentage + '%"></div>',
                '  </div>',
                '  <span class="progress-text">' + achievement.progress + '/' + achievement.target + '</span>',
                '</div>',
                (achievement.unlocked ? '<div class="achievement-badge">مكتمل</div>' : '')
            ].join('\n');
            card.innerHTML = cardHTML;
            container.appendChild(card);
        });
    }
    catch (error) {
        console.error('Error loading achievements:', error);
        container.innerHTML = '<div class="error-state"><p>❌ حدث خطأ في تحميل الإنجازات</p></div>';
    }
}
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    console.log('Found tab elements:', {
        buttons: tabButtons.length,
        contents: tabContents.length
    });
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
            console.log('Activated tab button:', btn);
        }
    });
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName + 'Tab') {
            content.classList.add('active');
            console.log('Activated tab content:', content.id);
        }
    });
    console.log('Loading content for tab:', tabName);
    if (tabName === 'todos') {
        loadTodos();
    }
    else if (tabName === 'results') {
        loadExamResults();
    }
    else if (tabName === 'achievements') {
        loadAchievements();
    }
    console.log('Tab switch completed for:', tabName);
}
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    setTimeout(() => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const tabButtons = document.querySelectorAll('.tab-btn');
        const addTodoButton = document.getElementById('addTodoBtn');
        console.log('Found elements:', {
            filterButtons: filterButtons.length,
            tabButtons: tabButtons.length,
            addTodoButton: !!addTodoButton
        });
        filterButtons.forEach((btn, index) => {
            console.log('Adding filter listener ' + index + ':', btn);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const filter = btn.getAttribute('data-filter');
                console.log('Filter clicked:', filter);
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = filter || 'all';
                loadTodos();
            });
        });
        tabButtons.forEach((btn, index) => {
            console.log('Adding tab listener ' + index + ':', btn);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tab = btn.getAttribute('data-tab');
                console.log('Tab clicked:', tab);
                if (tab) {
                    switchTab(tab);
                }
            });
        });
        if (addTodoButton) {
            console.log('Adding todo button listener');
            addTodoButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add todo clicked');
                showAddTodoModal();
            });
        }
        else {
            console.warn('Add todo button not found!');
        }
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            console.log('Adding save profile button listener');
            saveProfileBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const nameInput = document.getElementById('editName');
                const bioInput = document.getElementById('editBio');
                const phoneInput = document.getElementById('editPhone');
                const countryInput = document.getElementById('editCountry');
                if (!nameInput?.value.trim()) {
                    showToast('يرجى إدخال الاسم', 'warning');
                    return;
                }
                const profileData = {
                    name: nameInput.value.trim(),
                    bio: bioInput?.value.trim() || '',
                    phone: phoneInput?.value.trim() || '',
                    country: countryInput?.value.trim() || ''
                };
                await saveProfileData(profileData);
            });
        }
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('Adding logout button listener');
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                showConfirmDialog('هل أنت متأكد من تسجيل الخروج؟', async () => {
                    try {
                        showLoading();
                        await signOut(auth);
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('userToken');
                        localStorage.removeItem('currentUserEmail');
                        localStorage.removeItem('userRole');
                        sessionStorage.setItem('fromLogout', 'true');
                        showToast('تم تسجيل الخروج بنجاح', 'success');
                        setTimeout(() => {
                            window.location.href = '/public/pages/login.html';
                        }, 1000);
                    }
                    catch (error) {
                        console.error('Logout error:', error);
                        hideLoading();
                        showToast('حدث خطأ في تسجيل الخروج', 'error');
                    }
                });
            });
        }
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        document.addEventListener('click', (e) => {
            if (navMenu && !navMenu.contains(e.target) && !navToggle?.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle?.classList.remove('active');
            }
        });
        console.log('Event listeners initialized successfully');
    }, 200);
}
let motivationalInterval = null;
const motivationalMessages = [
    'استمر في التعلم! كل خطوة تقربك من هدفك 🌟',
    'أنت تحرز تقدماً رائعاً! لا تتوقف الآن 💪',
    'التعلم رحلة مدى الحياة، واصل المسير 📚',
    'كل مهمة تكملها تجعلك أقوى وأكثر معرفة ✨',
    'النجاح يحتاج إلى صبر ومثابرة، أنت على الطريق الصحيح 🎯',
    'المعرفة قوة، واصل بناء قوتك يوماً بعد يوم 🧠',
    'أنت أقرب إلى أهدافك مما تعتقد، لا تستسلم! 🚀',
    'كل امتحان تجتازه يفتح لك أبواباً جديدة 🔑'
];
function startMotivationalMessages() {
    if (motivationalInterval) {
        clearInterval(motivationalInterval);
    }
    motivationalInterval = setInterval(() => {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        showToast(randomMessage, 'info', 5000);
    }, 1800000);
}
function stopMotivationalMessages() {
    if (motivationalInterval) {
        clearInterval(motivationalInterval);
        motivationalInterval = null;
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM Content Loaded - Starting initialization...');
    try {
        console.log('🔍 Starting authentication check...');
        await checkAuth();
        if (currentUser) {
            console.log('✅ User authenticated, loading data...');
            console.log('🔄 Force updating profile UI...');
            const displayName = currentUser.name || extractNameFromEmail(currentUser.email) || 'المستخدم';
            const userEmail = currentUser.email || 'user@example.com';
            updateProfileUI(displayName, userEmail);
            setTimeout(() => {
                updateProfileUI(displayName, userEmail);
                console.log('🔄 Second UI update completed');
            }, 500);
            setTimeout(() => {
                updateProfileUI(displayName, userEmail);
                console.log('🔄 Third UI update completed');
            }, 1000);
            await loadProgress();
            console.log('🔧 Initializing event listeners...');
            initializeEventListeners();
            console.log('📋 Switching to todos tab...');
            setTimeout(() => {
                switchTab('todos');
            }, 300);
            startMotivationalMessages();
            console.log('🎉 Profile page initialization complete!');
        }
    }
    catch (error) {
        console.error('❌ Error initializing profile page:', error);
        showToast('حدث خطأ في تحميل الصفحة', 'error');
    }
});
window.addEventListener('beforeunload', () => {
    stopMotivationalMessages();
});
