// Load and display materials from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const emptyState = document.getElementById('emptyState');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    let materials = JSON.parse(localStorage.getItem('materials') || '[]');
    
    const gradeLabels = {
        '1': 'الصف الأول الثانوي',
        '2': 'الصف الثاني الثانوي',
        '3': 'الصف الثالث الثانوي'
    };
    
    function renderMaterials() {
        let hasAnyMaterials = false;
        
        ['1', '2', '3'].forEach(grade => {
            const container = document.getElementById(`materialsGrade${grade}`);
            if (!container) return;
            
            const gradeMaterials = materials.filter(m => m.grade === grade);
            
            if (gradeMaterials.length === 0) {
                container.innerHTML = `<p style="text-align: center; color: #94a3b8; padding: 2rem; grid-column: 1 / -1;">لا توجد مذكرات لـ ${gradeLabels[grade]}</p>`;
            } else {
                hasAnyMaterials = true;
                container.innerHTML = gradeMaterials.map(material => `
                    <article class="material-card" role="listitem">
                        <div class="material-icon">📚</div>
                        <h3 class="material-title">${material.title}</h3>
                        <p class="material-description">${material.description || 'لا يوجد وصف'}</p>
                        <div class="material-meta">
                            <span>📦 ${material.fileSize}</span>
                            <span>📅 ${formatDate(material.createdAt)}</span>
                        </div>
                        <button class="btn-download" onclick="downloadMaterial('${material.fileUrl}', '${material.fileName}')">
                            <span>📥</span> تحميل المذكرة
                        </button>
                    </article>
                `).join('');
            }
        });
        
        if (!hasAnyMaterials && emptyState) {
            emptyState.style.display = 'block';
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ar-EG', options);
    }
    
    // Download material function
    window.downloadMaterial = function(fileUrl, fileName) {
        // Open in new tab for viewing
        window.open(fileUrl, '_blank');
        
        // Also trigger download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const grade = this.getAttribute('data-grade');
            document.querySelectorAll('.materials-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(`materialsGrade${grade}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Initial render
    renderMaterials();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'materials') {
            materials = JSON.parse(e.newValue || '[]');
            renderMaterials();
        }
    });
});
