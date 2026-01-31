// خادم مبسط بدون تبعيات خارجية
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// قراءة ملف تسجيل الدخول
let loginHTML = '';
let dashboardHTML = '';
try {
    loginHTML = fs.readFileSync('login.html', 'utf8');
} catch (err) {
    console.log('⚠️ ملف login.html غير موجود');
}

try {
    dashboardHTML = fs.readFileSync('dashboard.html', 'utf8');
} catch (err) {
    console.log('⚠️ ملف dashboard.html غير موجود');
}

// HTML للصفحة الرئيسية
const indexHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>منصة الفيلسوف التعليمية</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            direction: rtl;
        }
        .container { 
            background: rgba(255,255,255,0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 90%;
        }
        h1 { 
            font-size: 3rem; 
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        h2 { 
            font-size: 1.5rem; 
            margin-bottom: 2rem; 
            opacity: 0.9; 
        }
        .status { 
            background: rgba(40, 167, 69, 0.3);
            padding: 1.5rem;
            border-radius: 15px;
            margin: 2rem 0;
            border: 2px solid #28a745;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .feature {
            background: rgba(255,255,255,0.15);
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            transition: transform 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .feature:hover {
            transform: translateY(-5px);
            background: rgba(255,255,255,0.2);
        }
        .icon { 
            font-size: 3rem; 
            margin-bottom: 1rem;
            display: block;
        }
        .accounts {
            margin-top: 2rem; 
            padding: 1.5rem; 
            background: rgba(255,255,255,0.1); 
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .accounts h3 {
            margin-bottom: 1rem;
            color: #ffd700;
        }
        .account {
            background: rgba(0,0,0,0.2);
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
        }
        .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 2rem;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            border: 3px solid rgba(255,255,255,0.3);
        }
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.2);
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎓</div>
        <h1>منصة الفيلسوف التعليمية</h1>
        <h2>الأستاذ محمد ناصر "الفيلسوف"</h2>
        <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9;">
            مدرس فلسفة ومنطق
        </p>
        
        <div class="status">
            <h3>✅ الخادم يعمل بنجاح!</h3>
            <p>المنصة التعليمية جاهزة للاستخدام</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                🌐 http://localhost:${PORT}
            </p>
        </div>

        <div class="features">
            <div class="feature">
                <span class="icon">🎥</span>
                <h4>الفيديوهات التعليمية</h4>
                <p>مكتبة شاملة من الفيديوهات التعليمية في الفلسفة والمنطق</p>
            </div>
            <div class="feature">
                <span class="icon">📋</span>
                <h4>الامتحانات التفاعلية</h4>
                <p>نظام امتحانات متقدم مع تصحيح تلقائي</p>
            </div>
            <div class="feature">
                <span class="icon">📝</span>
                <h4>الملاحظات والإعلانات</h4>
                <p>تواصل مباشر وفعال مع الطلاب</p>
            </div>
            <div class="feature">
                <span class="icon">🔔</span>
                <h4>الإشعارات الفورية</h4>
                <p>تنبيهات لحظية عند إضافة محتوى جديد</p>
            </div>
            <div class="feature">
                <span class="icon">📊</span>
                <h4>تتبع التقدم</h4>
                <p>إحصائيات مفصلة عن أداء الطلاب</p>
            </div>
            <div class="feature">
                <span class="icon">🎯</span>
                <h4>الوصول المشروط</h4>
                <p>محتوى مرتبط بأداء الطلاب في الامتحانات</p>
            </div>
        </div>

        <div class="accounts">
            <h3>🔑 الحسابات التجريبية</h3>
            <div class="account">
                <strong>👨‍🏫 المدرس:</strong><br>
                البريد: teacher@philosopher.com<br>
                كلمة المرور: 123456
            </div>
            <div class="account">
                <strong>👨‍🎓 الطالب:</strong><br>
                البريد: student1@philosopher.com<br>
                كلمة المرور: 123456
            </div>
            <div style="margin-top: 1rem;">
                <a href="/login" style="
                    display: inline-block;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    border: 2px solid rgba(255,255,255,0.3);
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🔐 تسجيل الدخول
                </a>
            </div>
        </div>

        <div class="footer">
            <p>🚀 تم تطوير هذه المنصة خصيصاً للأستاذ محمد ناصر "الفيلسوف"</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                لتوفير تجربة تعليمية متميزة وتفاعلية في الفلسفة والمنطق
            </p>
        </div>
    </div>

    <script>
        // إضافة بعض التفاعل
        document.querySelectorAll('.feature').forEach(feature => {
            feature.addEventListener('click', () => {
                feature.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    feature.style.transform = 'translateY(-5px)';
                }, 150);
            });
        });

        // عرض معلومات إضافية
        console.log('🎓 منصة الفيلسوف التعليمية');
        console.log('✅ تم تحميل الصفحة بنجاح');
        console.log('📚 جاهز للاستخدام!');
    </script>
</body>
</html>
`;

// إنشاء الخادم
const server = http.createServer((req, res) => {
    const url = req.url;
    
    // إعداد headers للاستجابة العربية
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (url === '/' || url === '/index.html') {
        res.writeHead(200);
        res.end(indexHTML);
    } else if (url === '/login') {
        if (loginHTML) {
            res.writeHead(200);
            res.end(loginHTML);
        } else {
            res.writeHead(200);
            res.end(`
                <html dir="rtl">
                <head><meta charset="utf-8"><title>تسجيل الدخول</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h1>🔐 تسجيل الدخول</h1>
                    <p>صفحة تسجيل الدخول قيد التطوير</p>
                    <a href="/" style="color: white;">العودة للصفحة الرئيسية</a>
                </body>
                </html>
            `);
        }
    } else if (url === '/dashboard') {
        if (dashboardHTML) {
            res.writeHead(200);
            res.end(dashboardHTML);
        } else {
            res.writeHead(200);
            res.end(`
                <html dir="rtl">
                <head><meta charset="utf-8"><title>لوحة التحكم</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5;">
                    <h1>📊 لوحة التحكم</h1>
                    <p>لوحة التحكم قيد التطوير</p>
                    <a href="/">العودة للصفحة الرئيسية</a>
                </body>
                </html>
            `);
        }
    } else if (url === '/api/status') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'success',
            message: 'منصة الفيلسوف تعمل بنجاح!',
            timestamp: new Date().toISOString(),
            server: 'Node.js HTTP Server',
            features: [
                'الفيديوهات التعليمية',
                'الامتحانات التفاعلية', 
                'الملاحظات والإعلانات',
                'الإشعارات الفورية',
                'تتبع التقدم',
                'الوصول المشروط'
            ]
        }, null, 2));
    } else {
        res.writeHead(404);
        res.end(`
            <html dir="rtl">
            <head><meta charset="utf-8"><title>404 - الصفحة غير موجودة</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5;">
                <h1>404 - الصفحة غير موجودة</h1>
                <p>الصفحة المطلوبة غير متوفرة</p>
                <a href="/" style="color: #667eea;">العودة للصفحة الرئيسية</a>
            </body>
            </html>
        `);
    }
});

// تشغيل الخادم
server.listen(PORT, () => {
    console.log(`
🎓 منصة الفيلسوف التعليمية
================================
✅ الخادم يعمل على المنفذ: ${PORT}
🌐 الرابط: http://localhost:${PORT}
📊 حالة الخادم: نشط
📚 المدرس: teacher@philosopher.com / 123456
👨‍🎓 الطالب: student1@philosopher.com / 123456
================================

🚀 افتح المتصفح واذهب إلى: http://localhost:${PORT}
    `);
});

// معالجة إغلاق الخادم
process.on('SIGINT', () => {
    console.log('\n🛑 جاري إيقاف الخادم...');
    server.close(() => {
        console.log('✅ تم إيقاف الخادم بنجاح');
        process.exit(0);
    });
});