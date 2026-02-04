import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';
import './toast-types';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
const videosGrid = document.getElementById('videosGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const authBtn = document.getElementById('authBtn');
const emptyState = document.getElementById('emptyState');
async function loadVideos() {
    if (!videosGrid)
        return;
    try {
        videosGrid.innerHTML = '<div class="loading"><div class="spinner"></div><span>جاري تحميل الفيديوهات...</span></div>';
        const videosQuery = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(videosQuery);
        if (snapshot.empty) {
            videosGrid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        videosGrid.innerHTML = '';
        videosGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        snapshot.forEach((docSnap) => {
            const video = { id: docSnap.id, ...docSnap.data() };
            const card = createVideoCard(video);
            videosGrid.appendChild(card);
        });
    }
    catch (error) {
        console.error('Error loading videos:', error);
        videosGrid.innerHTML = '<div class="error-state"><p>حدث خطأ أثناء تحميل الفيديوهات</p></div>';
    }
}
function createVideoCard(video) {
    const card = document.createElement('article');
    card.className = 'video-card';
    card.setAttribute('role', 'listitem');
    const thumbnailUrl = getYoutubeThumbnail(video.videoUrl);
    const duration = video.duration ? formatDuration(video.duration) : '';
    card.innerHTML = `
    <div class="video-thumbnail">
      <img src="${thumbnailUrl}" alt="${video.title}" loading="lazy">
      ${duration ? `<span class="video-duration">${duration}</span>` : ''}
    </div>
    <div class="video-content">
      <h3 class="video-title">${video.title}</h3>
      ${video.notes ? `<p class="video-description">${video.notes.substring(0, 100)}...</p>` : ''}
      <button class="btn btn-primary btn-sm watch-btn" data-video-id="${video.id}" data-video-url="${video.videoUrl}">
        <span aria-hidden="true">▶️</span> مشاهدة
      </button>
    </div>
  `;
    const watchBtn = card.querySelector('.watch-btn');
    watchBtn.addEventListener('click', () => handleWatchVideo(video));
    return card;
}
function getYoutubeThumbnail(url) {
    const videoId = extractYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/assets/images/video-placeholder.jpg';
}
function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
async function handleWatchVideo(video) {
    if (!currentUser) {
        window.showToast('يجب تسجيل الدخول لمشاهدة الفيديوهات', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }
    showVideoModal(video);
    try {
        const progressRef = doc(db, 'progress', `${currentUser.uid}_${video.courseId}`);
        await updateDoc(progressRef, {
            lessonsCompleted: arrayUnion(video.id),
            lastAccessed: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error updating progress:', error);
    }
}
function showVideoModal(video) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    const videoId = extractYoutubeId(video.videoUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : video.videoUrl;
    modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content modal-video">
      <button class="modal-close" aria-label="إغلاق">&times;</button>
      <h2 id="modal-title" class="modal-title">${video.title}</h2>
      <div class="video-wrapper">
        <iframe 
          src="${embedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          title="${video.title}"
        ></iframe>
      </div>
      ${video.notes ? `<div class="video-notes"><h3>ملاحظات:</h3><p>${video.notes}</p></div>` : ''}
    </div>
  `;
    document.body.appendChild(modal);
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    closeBtn.addEventListener('click', () => modal.remove());
    overlay.addEventListener('click', () => modal.remove());
}
searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = videosGrid.querySelectorAll('.video-card');
    cards.forEach((card) => {
        const title = card.querySelector('.video-title')?.textContent?.toLowerCase() || '';
        card.classList.toggle('hidden', !title.includes(searchTerm));
    });
});
sortSelect?.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    const cards = Array.from(videosGrid.querySelectorAll('.video-card'));
    cards.sort((a, b) => {
        const titleA = a.querySelector('.video-title')?.textContent || '';
        const titleB = b.querySelector('.video-title')?.textContent || '';
        if (sortValue === 'title') {
            return titleA.localeCompare(titleB, 'ar');
        }
        return 0;
    });
    videosGrid.innerHTML = '';
    cards.forEach(card => videosGrid.appendChild(card));
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
document.addEventListener('DOMContentLoaded', loadVideos);
