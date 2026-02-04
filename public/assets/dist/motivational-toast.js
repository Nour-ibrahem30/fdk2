// Motivational Toast Notification System
(function() {
    'use strict';

    // Toast notification function
    function showMotivationalToast(message) {
        // Remove existing toast if any
        const existingToast = document.getElementById('motivationalToast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.id = 'motivationalToast';
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: -400px;
            max-width: 380px;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(168, 85, 247, 0.95));
            backdrop-filter: blur(20px);
            border: 2px solid rgba(139, 92, 246, 0.5);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
            z-index: 9999;
            transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            animation: pulse 2s ease-in-out infinite;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: start; gap: 1rem;">
                <div style="font-size: 2rem; flex-shrink: 0;">💬</div>
                <div style="flex: 1;">
                    <h4 style="color: white; font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem 0;">المستر بيقولك:</h4>
                    <p style="color: rgba(255, 255, 255, 0.95); font-size: 0.95rem; line-height: 1.6; margin: 0;">${message}</p>
                </div>
                <button id="closeToast" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; flex-shrink: 0; opacity: 0.7; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">✕</button>
            </div>
        `;

        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4); }
                50% { box-shadow: 0 10px 50px rgba(139, 92, 246, 0.6); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.style.right = '2rem';
        }, 100);

        // Close button
        const closeBtn = toast.querySelector('#closeToast');
        closeBtn.addEventListener('click', () => {
            toast.style.right = '-400px';
            setTimeout(() => toast.remove(), 500);
        });

        // Auto hide after 10 seconds
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.style.right = '-400px';
                setTimeout(() => {
                    if (toast && toast.parentElement) {
                        toast.remove();
                    }
                }, 500);
            }
        }, 10000);
    }

    // Get random message from localStorage or default messages
    function getRandomMessage() {
        let messages = [];
        
        // Try to get from localStorage first (updated by dashboard)
        const storedMessages = localStorage.getItem('motivationalMessages');
        if (storedMessages) {
            try {
                const parsed = JSON.parse(storedMessages);
                messages = parsed.map(m => m.message);
            } catch (e) {
                console.error('Error parsing motivational messages:', e);
            }
        }

        // Fallback to default messages
        if (messages.length === 0) {
            messages = [
                "النجاح ليس نهاية المطاف، والفشل ليس قاتلاً، إنما الشجاعة للاستمرار هي ما يهم",
                "التعليم هو السلاح الأقوى الذي يمكنك استخدامه لتغيير العالم",
                "لا تدع ما لا تستطيع فعله يتعارض مع ما تستطيع فعله",
                "المستقبل ينتمي لأولئك الذين يؤمنون بجمال أحلامهم",
                "التعلم رحلة وليس وجهة، استمتع بكل خطوة في طريقك",
                "العقل ليس وعاءً يُملأ، بل ناراً تُشعل",
                "كل إنجاز عظيم بدأ بقرار المحاولة",
                "الطريق إلى النجاح دائماً قيد الإنشاء",
                "التعليم هو جواز السفر إلى المستقبل",
                "لا تتوقف عن التعلم، فالحياة لا تتوقف عن التعليم",
                "النجاح هو مجموع الجهود الصغيرة المتكررة يوماً بعد يوم",
                "أنت أقوى مما تعتقد وأذكى مما تظن",
                "كل يوم هو فرصة جديدة للتعلم والنمو",
                "الفشل هو مجرد فرصة للبدء من جديد بذكاء أكبر",
                "اجعل اليوم أفضل من الأمس وغداً أفضل من اليوم"
            ];
        }

        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Show message on page load (after 3 seconds)
    function showInitialMessage() {
        setTimeout(() => {
            const message = getRandomMessage();
            showMotivationalToast(message);
        }, 3000);
    }

    // Show message every hour
    function startHourlyMessages() {
        setInterval(() => {
            const message = getRandomMessage();
            showMotivationalToast(message);
        }, 3600000); // 1 hour = 3600000 milliseconds
    }

    // Check if user is a student (not teacher/admin)
    function isStudent() {
        const currentUserEmail = localStorage.getItem('currentUserEmail') || '';
        const isTeacher = currentUserEmail.includes('teacher') || 
                         currentUserEmail.includes('admin') || 
                         currentUserEmail === 'mohamednaser@gmail.com';
        return !isTeacher;
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Only show for students
            if (isStudent()) {
                showInitialMessage();
                startHourlyMessages();
            }
        });
    } else {
        // Only show for students
        if (isStudent()) {
            showInitialMessage();
            startHourlyMessages();
        }
    }

    // Expose function globally for manual triggering
    window.showMotivationalToast = showMotivationalToast;
})();
