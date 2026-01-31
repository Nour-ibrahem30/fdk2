import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    grade: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const grades = [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await AuthService.register(registerData);
      toast.success(response.message || 'تم إنشاء الحساب بنجاح');
      onRegister(response.user);
    } catch (error) {
      toast.error(error.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="page-hero" style={{ marginBottom: '1.5rem' }}>
        <h1>إنشاء حساب</h1>
        <p>انضم لمنصة الفيلسوف — مدرس فلسفة ومنطق</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ textAlign: 'center' }}>
            إنشاء حساب جديد
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            انضم إلى منصة الأستاذ محمد ناصر "الفيلسوف"
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="أدخل رقم هاتفك"
            />
          </div>

          <div className="form-group">
            <label className="form-label">نوع الحساب</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">طالب</option>
              <option value="teacher">مدرس</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div className="form-group">
              <label className="form-label">الصف الدراسي</label>
              <select
                name="grade"
                className="form-control"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <option value="">اختر الصف</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">تأكيد كلمة المرور</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: 'var(--gold)' }}>
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;