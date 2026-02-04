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

window.showToast = showToast;