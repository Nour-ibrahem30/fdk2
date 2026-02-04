import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
const notesGrid = document.getElementById('notesGrid');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const authBtn = document.getElementById('authBtn');
const emptyState = document.getElementById('emptyState');
async function loadNotes() {
    if (!notesGrid)
        return;
    try {
        notesGrid.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري تحميل الملاحظات...</span></div>';
        const notesQuery = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(notesQuery);
        if (snapshot.empty) {
            notesGrid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        notesGrid.innerHTML = '';
        notesGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        snapshot.forEach((docSnap) => {
            const note = { id: docSnap.id, ...docSnap.data() };
            const card = createNoteCard(note);
            notesGrid.appendChild(card);
        });
    }
    catch (error) {
        console.error('Error loading notes:', error);
        notesGrid.innerHTML = '<div class="error-state"><p>حدث خطأ أثناء تحميل الملاحظات</p></div>';
    }
}
function createNoteCard(note) {
    const card = document.createElement('article');
    card.className = 'note-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-priority', note.priority || 'medium');
    const priorityLabels = {
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة'
    };
    const priorityColors = {
        high: '#ff4444',
        medium: '#ffaa00',
        low: '#00d4ff'
    };
    const priority = note.priority || 'medium';
    const date = new Date(note.createdAt).toLocaleDateString('ar-EG');
    card.innerHTML = `
    <div class="note-header">
      <span class="note-priority" style="background: ${priorityColors[priority]}">
        ${priorityLabels[priority]}
      </span>
      <span class="note-date">${date}</span>
    </div>
    <div class="note-content">
      <p>${note.content}</p>
    </div>
  `;
    return card;
}
searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = notesGrid.querySelectorAll('.note-card');
    cards.forEach((card) => {
        const content = card.querySelector('.note-content')?.textContent?.toLowerCase() || '';
        card.classList.toggle('hidden', !content.includes(searchTerm));
    });
});
priorityFilter?.addEventListener('change', (e) => {
    const filterValue = e.target.value;
    const cards = notesGrid.querySelectorAll('.note-card');
    cards.forEach((card) => {
        if (filterValue === 'all') {
            card.classList.remove('hidden');
        }
        else {
            const priority = card.getAttribute('data-priority');
            card.classList.toggle('hidden', priority !== filterValue);
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
document.addEventListener('DOMContentLoaded', loadNotes);
