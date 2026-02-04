// Load and display notes from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const notesGrid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const priorityFilter = document.getElementById('priorityFilter');
    
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    const categoryLabels = {
        'general': 'عام',
        'important': 'مهم',
        'exam': 'متعلق بالامتحان'
    };
    
    const categoryColors = {
        'general': '#3b82f6',
        'important': '#f59e0b',
        'exam': '#ef4444'
    };
    
    const categoryIcons = {
        'general': '📝',
        'important': '⭐',
        'exam': '📋'
    };
    
    function renderNotes(filteredNotes = notes) {
        if (!notesGrid) return;
        
        if (filteredNotes.length === 0) {
            notesGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        notesGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        notesGrid.innerHTML = filteredNotes.map(note => `
            <article class="note-card" role="listitem" style="border-right: 4px solid ${categoryColors[note.category]};">
                <div class="note-header">
                    <div class="note-icon">${categoryIcons[note.category]}</div>
                    <div class="note-badge" style="background: ${categoryColors[note.category]}20; color: ${categoryColors[note.category]};">
                        ${categoryLabels[note.category]}
                    </div>
                </div>
                <div class="note-content">
                    <h3 class="note-title">${note.title}</h3>
                    <p class="note-text">${note.content}</p>
                    <div class="note-meta">
                        <span class="note-date">📅 ${formatDate(note.createdAt)}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ar-EG', options);
    }
    
    function filterAndRender() {
        let filtered = notes;
        
        // Search filter
        const searchTerm = searchInput?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        // Priority filter (using category as priority)
        const priorityValue = priorityFilter?.value || 'all';
        if (priorityValue !== 'all') {
            // Map priority to category
            const categoryMap = {
                'high': 'important',
                'medium': 'exam',
                'low': 'general'
            };
            filtered = filtered.filter(note => note.category === categoryMap[priorityValue]);
        }
        
        // Sort by newest
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        renderNotes(filtered);
    }
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterAndRender);
    }
    
    // Initial render
    filterAndRender();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'notes') {
            notes = JSON.parse(e.newValue || '[]');
            filterAndRender();
        }
    });
});
