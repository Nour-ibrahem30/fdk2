const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB متصل: ${conn.connection.host}`);
    
    // إعداد معالجات الأحداث
    mongoose.connection.on('error', (err) => {
      console.error('خطأ في قاعدة البيانات:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('تم قطع الاتصال بقاعدة البيانات');
    });

    // إغلاق الاتصال عند إنهاء التطبيق
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('تم إغلاق اتصال قاعدة البيانات');
      process.exit(0);
    });

  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

module.exports = connectDB;