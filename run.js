// ملف تشغيل مبسط للمنصة
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// اتصال قاعدة البيانات
const MONGODB_URI = 'mongodb+srv://nouribrahem207_db_user:Nour123456@cluster0.8q2ioti.mongodb.net/philosopher_platform?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  })
  .catch(err => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
  });

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>منصة الفيلسوف التعليمية</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .container { 
                background: rgba(255,255,255,0.1);
                padding: 3rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            h2 { font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9; }
            .status { 
                background: rgba(40, 167, 69, 0.2);
                padding: 1rem;
                border-radius: 10px;
                margin: 2rem 0;
                border: 2px solid #28a745;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-top: 2rem;
            }
            .feature {
                background: rgba(255,255,255,0.1);
                padding: 1.5rem;
                border-radius: 10px;
                text-align: right;
            }
            .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 منصة الفيلسوف التعليمية</h1>
            <h2>الأستاذ محمد ناصر "الفيلسوف"</h2>
            
            <div class="status">
                <h3>✅ الخادم يعمل بنجاح!</h3>
                <p>المنصة جاهزة للاستخدام</p>
            </div>

            <div class="features">
                <div class="feature">
                    <div class="icon">🎥</div>
                    <h4>الفيديوهات التعليمية</h4>
                    <p>مكتبة شاملة من الفيديوهات</p>
                </div>
                <div class="feature">
                    <div class="icon">📋</div>
                    <h4>الامتحانات التفاعلية</h4>
                    <p>نظام امتحانات متقدم</p>
                </div>
                <div class="feature">
                    <div class="icon">📝</div>
                    <h4>الملاحظات والإعلانات</h4>
                    <p>تواصل مباشر مع الطلاب</p>
                </div>
                <div class="feature">
                    <div class="icon">🔔</div>
                    <h4>الإشعارات الفورية</h4>
                    <p>تنبيهات لحظية</p>
                </div>
                <div class="feature">
                    <div class="icon">📊</div>
                    <h4>تتبع التقدم</h4>
                    <p>إحصائيات مفصلة</p>
                </div>
                <div class="feature">
                    <div class="icon">🎯</div>
                    <h4>الوصول المشروط</h4>
                    <p>محتوى مرتبط بالأداء</p>
                </div>
            </div>

            <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 10px;">
                <h3>الحسابات التجريبية:</h3>
                <p><strong>المدرس:</strong> teacher@philosopher.com / 123456</p>
                <p><strong>الطالب:</strong> student1@philosopher.com / 123456</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// API بسيط للاختبار
app.get('/api/test', (req, res) => {
  res.json({
    message: 'منصة الفيلسوف تعمل بنجاح!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'متصل' : 'غير متصل'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🎓 منصة الفيلسوف التعليمية
================================
✅ الخادم يعمل على المنفذ: ${PORT}
🌐 الرابط: http://localhost:${PORT}
📚 المدرس: teacher@philosopher.com / 123456
👨‍🎓 الطالب: student1@philosopher.com / 123456
================================
  `);
});