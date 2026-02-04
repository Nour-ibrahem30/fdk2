// Load and display videos from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const videosGrid = document.getElementById('videosGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    let videos = JSON.parse(localStorage.getItem('videos') || '[]');
    
    function renderVideos(filteredVideos = videos) {
        if (!videosGrid) return;
        
        if (filteredVideos.length === 0) {
            videosGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        videosGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        videosGrid.innerHTML = filteredVideos.map(video => `
            <article class="video-card" role="listitem">
                <div class="video-thumbnail">
                    ${video.type === 'youtube' ? 
                        `<img src="https://img.youtube.com/vi/${extractYouTubeId(video.url)}/mqdefault.jpg" alt="${video.title}" loading="lazy">` :
                        `<div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; height: 200px; border-radius: 12px;">
                            <span style="font-size: 4rem;">🎥</span>
                        </div>`
                    }
                    <div class="video-duration">${video.duration || '0'} دقيقة</div>
                </div>
                <div class="video-content">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description || 'لا يوجد وصف'}</p>
                    <div class="video-meta">
                        <span class="video-type">${video.type === 'youtube' ? '🔗 YouTube' : '📁 ملف محلي'}</span>
                        ${video.fileSize ? `<span class="video-size">📦 ${video.fileSize}</span>` : ''}
                    </div>
                    <button class="btn btn-primary btn-watch" onclick="watchVideo(${video.id})">
                        <span>▶️</span> مشاهدة الآن
                    </button>
                </div>
            </article>
        `).join('');
    }
    
    function extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
    }
    
    function sortVideos(videos, sortType) {
        const sorted = [...videos];
        switch(sortType) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'title':
                return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
            default:
                return sorted;
        }
    }
    
    function filterAndRender() {
        let filtered = videos;
        
        // Search filter
        const searchTerm = searchInput?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(video => 
                video.title.toLowerCase().includes(searchTerm) ||
                (video.description && video.description.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort
        const sortType = sortSelect?.value || 'newest';
        filtered = sortVideos(filtered, sortType);
        
        renderVideos(filtered);
    }
    
    // Watch video function
    window.watchVideo = function(id) {
        const video = videos.find(v => v.id === id);
        if (!video) return;
        
        // Mark video as watched for current user
        const currentUserEmail = localStorage.getItem('currentUserEmail');
        if (currentUserEmail) {
            const userProgress = JSON.parse(localStorage.getItem(`userProgress_${currentUserEmail}`) || '{"watchedVideos": [], "completedExams": [], "examScores": {}}');
            if (!userProgress.watchedVideos.includes(id)) {
                userProgress.watchedVideos.push(id);
                localStorage.setItem(`userProgress_${currentUserEmail}`, JSON.stringify(userProgress));
            }
        }
        
        // Create modal to watch video
        const modal = document.createElement('div');
        modal.className = 'video-modal-overlay';
        modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 1000; align-items: center; justify-content: center; padding: 2rem;';
        
        if (video.type === 'youtube') {
            const videoId = extractYouTubeId(video.url);
            modal.innerHTML = `
                <div style="width: 100%; max-width: 1200px; position: relative;">
                    <button class="close-video-btn" style="position: absolute; top: -40px; right: 0; background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 2rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.3s ease;">✕</button>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                        <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;" allowfullscreen></iframe>
                    </div>
                    <div style="background: rgba(30, 41, 59, 0.9); padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
                        <h2 style="color: #f1f5f9; margin-bottom: 0.5rem;">${video.title}</h2>
                        <p style="color: #94a3b8;">${video.description || ''}</p>
                    </div>
                </div>
            `;
        } else {
            modal.innerHTML = `
                <div style="width: 100%; max-width: 1200px; position: relative;">
                    <button class="close-video-btn" style="position: absolute; top: -40px; right: 0; background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 2rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.3s ease;">✕</button>
                    <video controls autoplay style="width: 100%; border-radius: 12px; background: #000; max-height: 70vh;">
                        <source src="${video.url}" type="video/mp4">
                        المتصفح لا يدعم تشغيل الفيديو
                    </video>
                    <div style="background: rgba(30, 41, 59, 0.9); padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
                        <h2 style="color: #f1f5f9; margin-bottom: 0.5rem;">${video.title}</h2>
                        <p style="color: #94a3b8;">${video.description || ''}</p>
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(modal);
        
        // Close button handler
        const closeBtn = modal.querySelector('.close-video-btn');
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // ESC key to close
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndRender);
    }
    
    // Initial render
    filterAndRender();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'videos') {
            videos = JSON.parse(e.newValue || '[]');
            filterAndRender();
        }
    });
});
