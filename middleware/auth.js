const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'لا يوجد رمز مصادقة' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'رمز المصادقة غير صالح' });
    }

    req.user = decoded;
    req.userDoc = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'رمز المصادقة غير صالح' });
  }
};

// التحقق من صلاحية المدرس
const teacherAuth = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
  }
  next();
};

module.exports = { auth, teacherAuth };