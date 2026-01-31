# إعداد قاعدة البيانات السحابية - MongoDB Atlas

## خطوات إعداد قاعدة البيانات

### 1. إعداد كلمة المرور
قم بتحديث ملف `.env` واستبدل `<db_password>` بكلمة المرور الفعلية:

```env
MONGODB_URI=mongodb+srv://nouribrahem207_db_user:YOUR_ACTUAL_PASSWORD@cluster0.8q2ioti.mongodb.net/philosopher_platform?retryWrites=true&w=majority
```

### 2. التحقق من الاتصال
```bash
# اختبار الاتصال بقاعدة البيانات
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('اتصال ناجح')).catch(err => console.error('خطأ:', err))"
```

### 3. إعداد البيانات التجريبية
```bash
# تشغيل سكريبت الإعداد
npm run setup
```

## إعدادات الأمان في MongoDB Atlas

### 1. إعدادات الشبكة (Network Access):
- تأكد من إضافة عنوان IP الخاص بك
- أو استخدم `0.0.0.0/0` للسماح من جميع العناوين (للتطوير فقط)

### 2. إعدادات قاعدة البيانات (Database Access):
- المستخدم: `nouribrahem207_db_user`
- الصلاحيات: `Read and write to any database`

### 3. اسم قاعدة البيانات:
- `philosopher_platform`

## استكشاف الأخطاء الشائعة

### خطأ المصادقة:
```
MongoServerError: bad auth: Authentication failed
```
**الحل:** تأكد من صحة كلمة المرور في ملف `.env`

### خطأ الشبكة:
```
MongoNetworkError: connection timed out
```
**الحل:** تحقق من إعدادات Network Access في MongoDB Atlas

### خطأ اسم قاعدة البيانات:
```
MongoServerError: user is not allowed to do action
```
**الحل:** تأكد من صلاحيات المستخدم في Database Access

## اختبار الاتصال

### طريقة 1: من خلال Node.js
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ اتصال ناجح بقاعدة البيانات');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ خطأ في الاتصال:', err.message);
  });
```

### طريقة 2: من خلال MongoDB Compass
استخدم نفس رابط الاتصال في MongoDB Compass للتحقق من البيانات.

## البيانات التجريبية

بعد تشغيل `npm run setup` ستجد:

### المستخدمين:
- **المدرس:** teacher@philosopher.com / 123456
- **الطلاب:** student1@philosopher.com إلى student5@philosopher.com / 123456

### المحتوى:
- 2 امتحان تجريبي
- 2 فيديو تعليمي
- 2 ملاحظة
- إحصائيات وبيانات أداء

## النسخ الاحتياطي والاستعادة

### إنشاء نسخة احتياطية:
```bash
mongodump --uri="mongodb+srv://nouribrahem207_db_user:PASSWORD@cluster0.8q2ioti.mongodb.net/philosopher_platform"
```

### استعادة النسخة الاحتياطية:
```bash
mongorestore --uri="mongodb+srv://nouribrahem207_db_user:PASSWORD@cluster0.8q2ioti.mongodb.net/philosopher_platform" dump/
```

## مراقبة الأداء

في MongoDB Atlas يمكنك مراقبة:
- عدد الاتصالات
- استخدام التخزين
- أداء الاستعلامات
- الأخطاء والتحذيرات

---

**ملاحظة مهمة:** لا تشارك كلمة مرور قاعدة البيانات مع أحد واحتفظ بها آمنة في ملف `.env`