@echo off
echo ========================================
echo    منصة الأستاذ محمد ناصر "الفيلسوف"
echo         التعليمية
echo ========================================
echo.

echo تحذير مهم: تأكد من تحديث كلمة مرور قاعدة البيانات في ملف .env
echo استبدل ^<db_password^> بكلمة المرور الفعلية
echo.
pause

echo جاري تثبيت التبعيات...
call npm run install-all

echo.
echo جاري إعداد قاعدة البيانات...
call npm run setup

echo.
echo تشغيل الخادم...
start cmd /k "npm run server"

echo.
echo انتظار 5 ثوان...
timeout /t 5 /nobreak > nul

echo تشغيل الواجهة الأمامية...
start cmd /k "npm run client"

echo.
echo ========================================
echo تم تشغيل المنصة بنجاح!
echo.
echo الخادم: http://localhost:5000
echo الواجهة: http://localhost:3000
echo.
echo الحسابات التجريبية:
echo المدرس: teacher@philosopher.com / 123456
echo الطالب: student1@philosopher.com / 123456
echo ========================================
pause