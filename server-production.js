// خادم الإنتاج - منصة الفيلسوف التعليمية
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// قراءة الملفات
let loginHTML = '';
let dashboardHTML = '';
let videosHTML = '';
let examsHTML = '';
let notesHTML = '';

try {
    loginHTML = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');
} catch (err) {
    console.log('⚠️ ملف login.html غير موجود');
}

try {
    dashboardHTML = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');
} catch (err) {
    console.log('⚠️ ملف dashboard.html غير موجود');
}

try {
    videosHTML = fs.readFileSync(path.join(__dirname, 'videos.html'), 'utf8');
} catch (err) {
    console.log('⚠️ ملف videos.html غير موجود');
}

try {
    examsHTML = fs.readFileSync(path.join(__dirname, 'exams.html'), 'utf8');
} catch (err) {
    console.log('⚠️ ملف exams.html غير موجود');
}

try {
    notesHTML = fs.readFileSync(path.join(__dirname, 'notes.html'), 'utf8');
} catch (err) {
    console.log('⚠️ ملف notes.html غير موجود');
}

// HTML للصفحة الرئيسية - تصميم احترافي حديث
const indexHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>الأستاذ محمد ناصر "الفيلسوف" - منصة تعليمية</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>">
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8f9fa;
            color: #333;
            direction: rtl;
            line-height: 1.6;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .logo-avatar {
            width: 60px;
            height: 60px;
            background: url('/logo-philosopher.png') center/cover no-repeat, rgba(255,255,255,0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 3px solid rgba(255,255,255,0.3);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .logo-info h1 {
            font-size: 1.8rem;
            margin-bottom: 0.2rem;
        }
        .logo-info p {
            font-size: 1rem;
            opacity: 0.9;
        }
        .nav {
            display: flex;
            gap: 2rem;
        }
        .nav a {
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        .nav a:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        /* Wave Animation */
        .hero::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E");
            background-size: cover;
            animation: wave 10s linear infinite;
        }
        
        .hero::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E");
            background-size: cover;
            animation: wave 15s linear infinite reverse;
        }
        
        @keyframes wave {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        
        .hero-content {
            position: relative;
            z-index: 1;
        }
        .hero-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        .hero h2 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 3rem;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            display: block;
        }
        .stat-label {
            font-size: 1rem;
            opacity: 0.8;
        }
        
        /* Main Content */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* About Section */
        .about-section {
            padding: 4rem 0;
            background: white;
        }
        .about-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 3rem;
            align-items: center;
        }
        .about-image {
            width: 300px;
            height: 300px;
            background: url('/logo-philosopher.png') center/contain no-repeat, linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin: 0 auto;
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }
        .about-text h3 {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 1rem;
        }
        .about-text p {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.8;
        }
        .specialties {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .specialty-tag {
            background: #667eea;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        
        /* Courses Section */
        .courses-section {
            padding: 4rem 0;
            background: #f8f9fa;
        }
        .section-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .section-header h3 {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 1rem;
        }
        .section-header p {
            font-size: 1.1rem;
            color: #666;
        }
        .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }
        .course-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .course-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .course-image {
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
        }
        .course-content {
            padding: 2rem;
        }
        .course-title {
            font-size: 1.4rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 0.5rem;
        }
        .course-description {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        .course-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        .course-level {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.9rem;
        }
        .course-duration {
            color: #666;
            font-size: 0.9rem;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .btn-outline {
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
        }
        .btn-outline:hover {
            background: #667eea;
            color: white;
        }
        
        /* Features Section */
        .features-section {
            padding: 4rem 0;
            background: white;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .feature-card {
            text-align: center;
            padding: 2rem;
            border-radius: 15px;
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        .feature-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            margin: 0 auto 1.5rem;
        }
        .feature-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 1rem;
        }
        .feature-description {
            color: #666;
            line-height: 1.6;
        }
        
        /* CTA Section */
        .cta-section {
            padding: 4rem 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .cta-content h3 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .cta-content p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn-white {
            background: white;
            color: #667eea;
        }
        .btn-white:hover {
            background: #f8f9fa;
        }
        
        /* Footer */
        .footer {
            background: #333;
            color: white;
            padding: 3rem 0 1rem;
        }
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .footer-section h4 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: #667eea;
        }
        .footer-section p, .footer-section a {
            color: #ccc;
            text-decoration: none;
            line-height: 1.8;
        }
        .footer-section a:hover {
            color: white;
        }
        .footer-bottom {
            border-top: 1px solid #555;
            padding-top: 1rem;
            text-align: center;
            color: #999;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h2 { font-size: 2rem; }
            .hero p { font-size: 1.1rem; }
            .hero-stats { flex-direction: column; gap: 1rem; }
            .about-content { grid-template-columns: 1fr; text-align: center; }
            .about-image { width: 200px; height: 200px; font-size: 5rem; }
            .nav { display: none; }
            .courses-grid { grid-template-columns: 1fr; }
            .cta-buttons { flex-direction: column; align-items: center; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <div class="logo-avatar"></div>
                <div class="logo-info">
                    <h1>الأستاذ محمد ناصر</h1>
                    <p>"الفيلسوف" - مدرس فلسفة ومنطق</p>
                </div>
            </div>
            <nav class="nav">
                <a href="#about">نبذة عني</a>
                <a href="#courses">الكورسات</a>
                <a href="/videos">الفيديوهات</a>
                <a href="/exams">الامتحانات</a>
                <a href="/login">تسجيل الدخول</a>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h2>مرحباً بكم في عالم الفلسفة والمنطق</h2>
            <p>انضموا إلى رحلة تعليمية ممتعة مع الأستاذ محمد ناصر "الفيلسوف" واكتشفوا أسرار التفكير النقدي والفلسفة العملية</p>
            
            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-number">500+</span>
                    <span class="stat-label">طالب نشط</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">50+</span>
                    <span class="stat-label">فيديو تعليمي</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">25+</span>
                    <span class="stat-label">امتحان تفاعلي</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">95%</span>
                    <span class="stat-label">معدل النجاح</span>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about-section" id="about">
        <div class="container">
            <div class="about-content">
                <div class="about-image"></div>
                <div class="about-text">
                    <h3>الأستاذ محمد ناصر "الفيلسوف"</h3>
                    <p>مدرس متخصص في الفلسفة والمنطق مع خبرة تزيد عن 15 عاماً في التدريس. أؤمن بأن الفلسفة ليست مجرد مادة دراسية، بل أسلوب حياة يساعدنا على فهم العالم من حولنا بشكل أعمق.</p>
                    <p>هدفي هو جعل الفلسفة والمنطق مفهومين وممتعين لجميع الطلاب، من خلال أساليب تدريس حديثة وتفاعلية تربط بين النظرية والتطبيق العملي.</p>
                    <div class="specialties">
                        <span class="specialty-tag">الفلسفة اليونانية</span>
                        <span class="specialty-tag">المنطق الرياضي</span>
                        <span class="specialty-tag">الفلسفة الإسلامية</span>
                        <span class="specialty-tag">علم النفس الفلسفي</span>
                        <span class="specialty-tag">الأخلاق التطبيقية</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Courses Section -->
    <section class="courses-section" id="courses">
        <div class="container">
            <div class="section-header">
                <h3>الكورسات المتاحة</h3>
                <p>اختر الكورس المناسب لمستواك وابدأ رحلتك التعليمية</p>
            </div>
            <div class="courses-grid">
                <div class="course-card">
                    <div class="course-image">🏛️</div>
                    <div class="course-content">
                        <h4 class="course-title">مقدمة في الفلسفة</h4>
                        <p class="course-description">كورس شامل يغطي أساسيات الفلسفة وتاريخها من العصور القديمة حتى اليوم</p>
                        <div class="course-meta">
                            <span class="course-level">مبتدئ</span>
                            <span class="course-duration">⏱️ 20 ساعة</span>
                        </div>
                        <a href="/videos" class="btn">ابدأ التعلم</a>
                    </div>
                </div>
                
                <div class="course-card">
                    <div class="course-image">🧮</div>
                    <div class="course-content">
                        <h4 class="course-title">أساسيات المنطق</h4>
                        <p class="course-description">تعلم قواعد التفكير المنطقي والاستدلال الصحيح مع تطبيقات عملية</p>
                        <div class="course-meta">
                            <span class="course-level">متوسط</span>
                            <span class="course-duration">⏱️ 15 ساعة</span>
                        </div>
                        <a href="/videos" class="btn">ابدأ التعلم</a>
                    </div>
                </div>
                
                <div class="course-card">
                    <div class="course-image">🕌</div>
                    <div class="course-content">
                        <h4 class="course-title">الفلسفة الإسلامية</h4>
                        <p class="course-description">استكشف إسهامات الفلاسفة المسلمين في تطوير الفكر الإنساني</p>
                        <div class="course-meta">
                            <span class="course-level">متقدم</span>
                            <span class="course-duration">⏱️ 25 ساعة</span>
                        </div>
                        <a href="/videos" class="btn">ابدأ التعلم</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
        <div class="container">
            <div class="section-header">
                <h3>لماذا تختار منصتنا؟</h3>
                <p>نوفر لك تجربة تعليمية متكاملة ومتطورة</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🎥</div>
                    <h4 class="feature-title">فيديوهات عالية الجودة</h4>
                    <p class="feature-description">محتوى مرئي واضح ومفصل مع إمكانية المشاهدة بجودات متعددة</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📋</div>
                    <h4 class="feature-title">امتحانات تفاعلية</h4>
                    <p class="feature-description">اختبارات متنوعة مع تصحيح فوري وتقييم شامل لمستواك</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h4 class="feature-title">تتبع التقدم</h4>
                    <p class="feature-description">راقب تقدمك وإنجازاتك مع إحصائيات مفصلة وتقارير دورية</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <h4 class="feature-title">إشعارات ذكية</h4>
                    <p class="feature-description">تنبيهات فورية عند إضافة محتوى جديد أو مواعيد الامتحانات</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💬</div>
                    <h4 class="feature-title">تفاعل مباشر</h4>
                    <p class="feature-description">تواصل مع المدرس والطلاب الآخرين من خلال منصة التفاعل</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h4 class="feature-title">متاح في كل مكان</h4>
                    <p class="feature-description">ادرس من أي مكان وفي أي وقت عبر جميع الأجهزة</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content">
                <h3>ابدأ رحلتك التعليمية اليوم</h3>
                <p>انضم إلى آلاف الطلاب الذين يتعلمون الفلسفة والمنطق معنا</p>
                <div class="cta-buttons">
                    <a href="/login" class="btn btn-white">تسجيل الدخول</a>
                    <a href="/videos" class="btn btn-outline">تصفح الكورسات</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>منصة الفيلسوف</h4>
                    <p>منصة تعليمية متخصصة في الفلسفة والمنطق، نهدف إلى نشر المعرفة وتطوير التفكير النقدي.</p>
                </div>
                <div class="footer-section">
                    <h4>روابط سريعة</h4>
                    <p><a href="/videos">الفيديوهات</a></p>
                    <p><a href="/exams">الامتحانات</a></p>
                    <p><a href="/dashboard">لوحة التحكم</a></p>
                    <p><a href="/login">تسجيل الدخول</a></p>
                </div>
                <div class="footer-section">
                    <h4>تواصل معنا</h4>
                    <p>📧 info@philosopher.edu</p>
                    <p>📱 +20 123 456 7890</p>
                    <p>🌐 www.philosopher.edu</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 منصة الفيلسوف التعليمية. جميع الحقوق محفوظة.</p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.course-card, .feature-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });

        console.log('🎓 منصة الفيلسوف التعليمية - تصميم احترافي');
        console.log('✅ تم تحميل الصفحة بنجاح');
        console.log('🌐 جاهز للاستخدام!');
    </script>
</body>
</html>
`;

// إنشاء الخادم
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    
    // إعداد headers للاستجابة العربية
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // معالجة CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    console.log(`${method} ${url} - ${new Date().toISOString()}`);
    
    if (url === '/' || url === '/index.html') {
        res.writeHead(200);
        res.end(indexHTML);
    } else if (url === '/login') {
        if (loginHTML) {
            res.writeHead(200);
            res.end(loginHTML);
        } else {
            res.writeHead(200);
            res.end(createFallbackPage('تسجيل الدخول', '🔐', 'صفحة تسجيل الدخول'));
        }
    } else if (url === '/dashboard') {
        if (dashboardHTML) {
            res.writeHead(200);
            res.end(dashboardHTML);
        } else {
            res.writeHead(200);
            res.end(createFallbackPage('لوحة التحكم', '📊', 'لوحة تحكم المدرس'));
        }
    } else if (url === '/videos') {
        if (videosHTML) {
            res.writeHead(200);
            res.end(videosHTML);
        } else {
            res.writeHead(200);
            res.end(createFallbackPage('الفيديوهات', '🎥', 'مكتبة الفيديوهات التعليمية'));
        }
    } else if (url === '/exams') {
        if (examsHTML) {
            res.writeHead(200);
            res.end(examsHTML);
        } else {
            res.writeHead(200);
            res.end(createFallbackPage('الامتحانات', '📋', 'الامتحانات التفاعلية'));
        }
    } else if (url === '/notes') {
        if (notesHTML) {
            res.writeHead(200);
            res.end(notesHTML);
        } else {
            res.writeHead(200);
            res.end(createFallbackPage('الملاحظات', '📝', 'الملاحظات والإعلانات'));
        }
    } else if (url === '/api/status') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'success',
            message: 'منصة الفيلسوف تعمل بنجاح على الإنترنت!',
            timestamp: new Date().toISOString(),
            server: 'Node.js HTTP Server',
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version,
            features: [
                'الفيديوهات التعليمية',
                'الامتحانات التفاعلية', 
                'الملاحظات والإعلانات',
                'الإشعارات الفورية',
                'تتبع التقدم',
                'الوصول المشروط'
            ],
            urls: {
                home: '/',
                login: '/login',
                dashboard: '/dashboard',
                videos: '/videos',
                exams: '/exams',
                notes: '/notes',
                status: '/api/status'
            }
        }, null, 2));
    } else if (url === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    } else {
        res.writeHead(404);
        res.end(create404Page(url));
    }
});

// دالة إنشاء صفحة احتياطية
function createFallbackPage(title, icon, description) {
    return `
        <html dir="rtl">
        <head>
            <meta charset="utf-8">
            <title>${title} - منصة الفيلسوف</title>
            <style>
                body { 
                    font-family: Arial; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    direction: rtl;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 3rem;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                h1 { font-size: 3rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; margin-bottom: 2rem; }
                a { color: #ffd700; text-decoration: none; font-size: 1.1rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${icon} ${title}</h1>
                <p>${description}</p>
                <p>هذه الصفحة قيد التطوير</p>
                <a href="/">← العودة للصفحة الرئيسية</a>
            </div>
        </body>
        </html>
    `;
}

// دالة إنشاء صفحة 404
function create404Page(url) {
    return `
        <html dir="rtl">
        <head>
            <meta charset="utf-8">
            <title>404 - الصفحة غير موجودة</title>
            <style>
                body { 
                    font-family: Arial; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    direction: rtl;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 3rem;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                h1 { font-size: 4rem; margin-bottom: 1rem; }
                h2 { font-size: 2rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; margin-bottom: 2rem; }
                a { color: #ffd700; text-decoration: none; font-size: 1.1rem; }
                .url { 
                    background: rgba(0,0,0,0.3); 
                    padding: 1rem; 
                    border-radius: 8px; 
                    font-family: monospace; 
                    margin: 1rem 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔍</h1>
                <h2>404 - الصفحة غير موجودة</h2>
                <p>الصفحة المطلوبة غير متوفرة</p>
                <div class="url">${url}</div>
                <p>الصفحات المتاحة:</p>
                <p>
                    <a href="/">الصفحة الرئيسية</a> | 
                    <a href="/login">تسجيل الدخول</a> | 
                    <a href="/dashboard">لوحة التحكم</a>
                </p>
            </div>
        </body>
        </html>
    `;
}

// تشغيل الخادم
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
🎓 منصة الفيلسوف التعليمية - الإنتاج
=====================================
✅ الخادم يعمل على المنفذ: ${PORT}
🌐 البيئة: ${process.env.NODE_ENV || 'development'}
📊 حالة الخادم: نشط ومتاح على الإنترنت
📚 المدرس: teacher@philosopher.com / 123456
👨‍🎓 الطالب: student1@philosopher.com / 123456
=====================================

🚀 الروابط المتاحة:
   الرئيسية: /
   تسجيل الدخول: /login
   لوحة التحكم: /dashboard
   الفيديوهات: /videos
   الامتحانات: /exams
   الملاحظات: /notes
   حالة الخادم: /api/status
=====================================
    `);
});

// معالجة إغلاق الخادم
process.on('SIGINT', () => {
    console.log('\\n🛑 جاري إيقاف الخادم...');
    server.close(() => {
        console.log('✅ تم إيقاف الخادم بنجاح');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('🛑 تم استلام إشارة الإنهاء...');
    server.close(() => {
        console.log('✅ تم إيقاف الخادم بنجاح');
        process.exit(0);
    });
});

// معالجة الأخطاء
process.on('uncaughtException', (err) => {
    console.error('❌ خطأ غير متوقع:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ رفض غير معالج:', reason);
});

module.exports = server;