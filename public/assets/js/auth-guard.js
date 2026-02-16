/**
 * Auth Guard - Protect pages from unauthorized access
 */

(function() {
    'use strict';

    // Check if user is authenticated
    function checkAuth() {
        const currentUserEmail = localStorage.getItem('currentUserEmail');
        const currentUser = localStorage.getItem('currentUser');
        
        if (!currentUserEmail || !currentUser) {
            console.log('⚠️ User not authenticated, redirecting to login...');
            
            // Hide page content
            if (document.body) {
                document.body.style.visibility = 'hidden';
            }
            
            // Show toast notification
            showToast('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 'warning');
            
            // Redirect to login immediately
            setTimeout(() => {
                window.location.replace('/public/pages/login.html');
            }, 800);
            
            return false;
        }
        
        console.log('✅ User authenticated:', currentUserEmail);
        
        // Make sure page is visible
        if (document.body) {
            document.body.style.visibility = 'visible';
        }
        
        return true;
    }

    // Toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `auth-toast auth-toast-${type}`;
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type];
        
        toast.innerHTML = `
            <div class="auth-toast-content">
                <span class="auth-toast-icon">${icon}</span>
                <span class="auth-toast-message">${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('auth-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'auth-toast-styles';
            styles.textContent = `
                .auth-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(30, 41, 59, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid;
                }
                
                .auth-toast-warning { border-left-color: #f59e0b; }
                .auth-toast-error { border-left-color: #ef4444; }
                .auth-toast-success { border-left-color: #10b981; }
                .auth-toast-info { border-left-color: #3b82f6; }
                
                .auth-toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #f1f5f9;
                }
                
                .auth-toast-icon {
                    font-size: 1.2rem;
                }
                
                .auth-toast-message {
                    font-size: 0.95rem;
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
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }

    // Run auth check immediately
    checkAuth();
})();
