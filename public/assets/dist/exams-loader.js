// Load and display exams from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const examsGrid = document.getElementById('examsGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    
    let exams = JSON.parse(localStorage.getItem('exams') || '[]');
    
    const typeLabels = {
        'true-false': 'صح/خطأ',
        'multiple-choice': 'اختيار متعدد',
        'mixed': 'مختلط',
        'pdf': 'ملف PDF'
    };
    
    const typeIcons = {
        'true-false': '✓✗',
        'multiple-choice': '🔘',
        'mixed': '📝',
        'pdf': '📄'
    };
    
    function renderExams(filteredExams = exams) {
        if (!examsGrid) return;
        
        if (filteredExams.length === 0) {
            examsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        examsGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        examsGrid.innerHTML = filteredExams.map(exam => `
            <article class="exam-card" role="listitem">
                <div class="exam-header">
                    <div class="exam-icon">${typeIcons[exam.type] || '📋'}</div>
                    <div class="exam-badge">${typeLabels[exam.type]}</div>
                </div>
                <div class="exam-content">
                    <h3 class="exam-title">${exam.title}</h3>
                    <p class="exam-description">${exam.description || 'لا يوجد وصف'}</p>
                    <div class="exam-meta">
                        <span class="exam-duration">⏱️ ${exam.duration} دقيقة</span>
                        <span class="exam-score">🎯 ${exam.totalScore || 100} درجة</span>
                    </div>
                    ${exam.fileSize ? `<div class="exam-file-info">📦 ${exam.fileSize}</div>` : ''}
                    <button class="btn btn-primary btn-start" onclick="startExam(${exam.id})">
                        <span>📝</span> ${exam.type === 'pdf' ? 'عرض الامتحان' : 'ابدأ الامتحان'}
                    </button>
                </div>
            </article>
        `).join('');
    }
    
    function filterAndRender() {
        let filtered = exams;
        
        // Search filter
        const searchTerm = searchInput?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(exam => 
                exam.title.toLowerCase().includes(searchTerm) ||
                (exam.description && exam.description.toLowerCase().includes(searchTerm))
            );
        }
        
        // Type filter
        const typeValue = typeFilter?.value || 'all';
        if (typeValue !== 'all') {
            filtered = filtered.filter(exam => exam.type === typeValue);
        }
        
        // Sort by newest
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        renderExams(filtered);
    }
    
    // Start exam function
    window.startExam = function(id) {
        const exam = exams.find(e => e.id === id);
        if (!exam) return;
        
        if (exam.type === 'pdf' && exam.fileUrl) {
            // Create modal to view PDF
            const modal = document.createElement('div');
            modal.className = 'exam-modal-overlay';
            modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 1000; align-items: center; justify-content: center; padding: 2rem;';
            modal.innerHTML = `
                <div style="width: 100%; max-width: 1200px; height: 90vh; position: relative; display: flex; flex-direction: column;">
                    <button class="close-exam-btn" style="position: absolute; top: -40px; right: 0; background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 2rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.3s ease; z-index: 10;">✕</button>
                    <iframe src="${exam.fileUrl}" style="width: 100%; height: 100%; border: none; border-radius: 12px; background: white;"></iframe>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close-exam-btn');
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                modal.remove();
            });
            
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            const escHandler = function(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        } else {
            // Show exam modal
            const modal = document.createElement('div');
            modal.className = 'exam-modal-overlay';
            modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 1000; align-items: center; justify-content: center; padding: 2rem;';
            modal.innerHTML = `
                <div style="background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; padding: 2rem; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="font-size: 1.5rem; color: #f1f5f9;">${exam.title}</h2>
                        <button class="close-exam-btn" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.3s ease;">✕</button>
                    </div>
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; color: #f1f5f9; margin-bottom: 1rem;">
                            <span>⏱️ المدة: ${exam.duration} دقيقة</span>
                            <span>🎯 الدرجة: ${exam.totalScore || 100}</span>
                        </div>
                        <p style="color: #94a3b8;">${exam.description || ''}</p>
                    </div>
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
                        <p style="font-size: 1.2rem; margin-bottom: 2rem;">الامتحان قيد الإنشاء</p>
                        <p>سيتم إضافة الأسئلة قريباً</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close-exam-btn');
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                modal.remove();
            });
            
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            const escHandler = function(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
    };
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterAndRender);
    }
    
    // Initial render
    filterAndRender();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'exams') {
            exams = JSON.parse(e.newValue || '[]');
            filterAndRender();
        }
    });
});
