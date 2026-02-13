/**
 * تحميل وتوحيد Navbar و Footer في كل الصفحات
 * Unified Components Loader - Navbar & Footer
 */
(function() {
    'use strict';

    function getBasePaths() {
        var pathname = window.location.pathname || '';
        var isInPages = pathname.indexOf('/pages/') !== -1;
        
        // استخدام absolute paths من الـ root
        return {
            base: '/public/pages/',
            home: '/index.html',
            componentsBase: isInPages ? '../components/' : 'public/components/'
        };
    }

    function loadComponent(url, placeholderId, replaceVars) {
        var placeholder = document.getElementById(placeholderId);
        if (!placeholder) return Promise.resolve();

        return fetch(url)
            .then(function(res) { return res.text(); })
            .then(function(html) {
                var out = html;
                Object.keys(replaceVars).forEach(function(key) {
                    out = out.split(key).join(replaceVars[key]);
                });
                placeholder.innerHTML = out;
                return placeholder;
            })
            .catch(function(err) {
                console.error('Component load error:', placeholderId, err);
            });
    }

    function initNavigation() {
        var navToggle = document.getElementById('navToggle');
        var navMenu = document.getElementById('navMenu');
        var userMenuBtn = document.getElementById('userMenuBtn');
        var userDropdown = document.getElementById('userDropdown');
        var logoutBtn = document.getElementById('navLogoutBtn') || document.getElementById('logoutBtn');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
        }

        document.addEventListener('click', function(e) {
            if (navMenu && !navMenu.contains(e.target) && navToggle && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
            }
            if (userDropdown && !userDropdown.contains(e.target) && userMenuBtn && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (window.handleGlobalLogout) {
                    window.handleGlobalLogout();
                } else {
                    // Use toast confirmation instead of confirm
                    if (window.showConfirmDialog) {
                        window.showConfirmDialog('هل أنت متأكد من تسجيل الخروج؟', function() {
                            try {
                                localStorage.removeItem('currentUser');
                                localStorage.removeItem('currentUserEmail');
                                localStorage.removeItem('userRole');
                                localStorage.removeItem('userToken');
                            } catch (e) {}
                            window.location.href = getBasePaths().base + 'login.html';
                        });
                    } else {
                        // Fallback to toast
                        if (window.showToast) {
                            window.showToast('اضغط مرة أخرى للتأكيد من تسجيل الخروج', 'warning');
                            setTimeout(function() {
                                try {
                                    localStorage.removeItem('currentUser');
                                    localStorage.removeItem('currentUserEmail');
                                    localStorage.removeItem('userRole');
                                    localStorage.removeItem('userToken');
                                } catch (e) {}
                                window.location.href = getBasePaths().base + 'login.html';
                            }, 2000);
                        } else {
                            // Final fallback
                            try {
                                localStorage.removeItem('currentUser');
                                localStorage.removeItem('currentUserEmail');
                                localStorage.removeItem('userRole');
                                localStorage.removeItem('userToken');
                            } catch (e) {}
                            window.location.href = getBasePaths().base + 'login.html';
                        }
                    }
                }
            });
        }

        setActivePage();
        loadUserInfo();
        initProfileLinkCheck();
    }

    function initProfileLinkCheck() {
        document.querySelectorAll('a[data-page="profile"], a[href*="profile.html"]').forEach(function(link) {
            if (link.getAttribute('data-page') === 'profile' || (link.getAttribute('href') || '').indexOf('profile.html') !== -1) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    var hasSession = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser');
                    if (!hasSession) {
                        if (window.showToast) {
                            window.showToast('يجب تسجيل الدخول أولاً للوصول إلى الملف الشخصي', 'warning');
                            setTimeout(function() {
                                var base = getBasePaths().base;
                                window.location.href = base + 'login.html';
                            }, 2000);
                        } else {
                            var base = getBasePaths().base;
                            window.location.href = base + 'login.html';
                        }
                        return;
                    }
                    
                    // Check user role
                    var userRole = localStorage.getItem('userRole');
                    var base = getBasePaths().base;
                    
                    if (userRole === 'teacher') {
                        window.location.href = base + 'dashboard.html';
                    } else {
                        window.location.href = base + 'profile.html';
                    }
                });
            }
        });
    }

    function setActivePage() {
        var pathname = window.location.pathname || '';
        var navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.classList.remove('active');
            var href = link.getAttribute('href') || '';
            var page = link.getAttribute('data-page');
            if (!page) return;
            if (pathname.indexOf('dashboard') !== -1 && page === 'dashboard') link.classList.add('active');
            else if (pathname.indexOf('videos') !== -1 && page === 'videos') link.classList.add('active');
            else if (pathname.indexOf('materials') !== -1 && page === 'materials') link.classList.add('active');
            else if (pathname.indexOf('exams') !== -1 && page === 'exams') link.classList.add('active');
            else if (pathname.indexOf('notes') !== -1 && page === 'notes') link.classList.add('active');
            else if (pathname.indexOf('profile') !== -1 && page === 'profile') link.classList.add('active');
            else if ((pathname === '/' || pathname.endsWith('/index.html') || pathname === '') && (page === 'home' || href === 'index.html')) link.classList.add('active');
        });
    }

    function loadUserInfo() {
        var userMenu = document.getElementById('userMenu');
        var loginLink = document.getElementById('navLoginLink');
        try {
            var userJson = localStorage.getItem('currentUser');
            var email = localStorage.getItem('currentUserEmail');
            if (userJson) {
                var user = JSON.parse(userJson);
                if (window.updateNavUserInfo) window.updateNavUserInfo(user);
                else updateNavUserInfo(user);
                if (userMenu) userMenu.style.display = '';
                if (loginLink) loginLink.style.display = 'none';
            } else if (email) {
                var name = email.split('@')[0].replace(/[._]/g, ' ');
                if (window.updateNavUserInfo) window.updateNavUserInfo({ name: name, email: email });
                else updateNavUserInfo({ name: name, email: email });
                if (userMenu) userMenu.style.display = '';
                if (loginLink) loginLink.style.display = 'none';
            } else {
                if (userMenu) userMenu.style.display = 'none';
                if (loginLink) loginLink.style.display = '';
            }
        } catch (e) {
            if (userMenu) userMenu.style.display = 'none';
            if (loginLink) loginLink.style.display = '';
        }
    }

    function updateNavUserInfo(user) {
        var navUserName = document.getElementById('navUserName');
        var navUserAvatar = document.getElementById('navUserAvatar');
        if (navUserName && user && user.name) navUserName.textContent = user.name.split(' ')[0];
        if (navUserAvatar && user && user.name) navUserAvatar.textContent = generateInitials(user.name);
    }

    function generateInitials(name) {
        return name.split(' ').map(function(w) { return w.charAt(0); }).join('').toUpperCase().slice(0, 2);
    }

    function initFooter() {
        var form = document.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var input = form.querySelector('input[type="email"]');
                var btn = form.querySelector('.newsletter-btn');
                if (!btn) return;
                var orig = btn.textContent;
                btn.textContent = '✅ تم الاشتراك';
                btn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
                setTimeout(function() {
                    btn.textContent = orig;
                    btn.style.background = '';
                    form.reset();
                }, 2000);
            });
        }
    }

    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', function() {
            btn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
        });
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.updateNavUserInfo = updateNavUserInfo;
    window.setActivePage = setActivePage;
    window.handleNewsletter = function(event) {
        event.preventDefault();
        var btn = event.target.querySelector('.newsletter-btn');
        if (btn) {
            var orig = btn.textContent;
            btn.textContent = '✅ تم الاشتراك';
            btn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
            setTimeout(function() {
                btn.textContent = orig;
                btn.style.background = '';
                event.target.reset();
            }, 2000);
        }
    };

    function run() {
        var paths = getBasePaths();
        var base = paths.base;
        var home = paths.home;
        var compBase = paths.componentsBase;

        var navUrl = compBase + 'navbar.html';
        var footUrl = compBase + 'footer.html';

        var vars = {
            '{{BASE}}': base,
            '{{HOME}}': home
        };

        // Load toast system first
        var toastScript = document.createElement('script');
        toastScript.src = (paths.base ? '../' : 'public/') + 'assets/js/toast-system.js';
        toastScript.onerror = function() {
            console.warn('Toast system not found, continuing without it');
        };
        document.head.appendChild(toastScript);

        Promise.all([
            loadComponent(navUrl, 'navbar-placeholder', vars),
            loadComponent(footUrl, 'footer-placeholder', vars)
        ]).then(function() {
            initNavigation();
            initFooter();
            initBackToTop();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
