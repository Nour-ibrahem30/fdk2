import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(formData.email, formData.password);
      toast.success(response.message || 'تم تسجيل الدخول بنجاح');
      onLogin(response.user);
    } catch (error) {
      toast.error(error.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <div className="page-hero" style={{ marginBottom: '1.5rem' }}>
        <h1>تسجيل الدخول</h1>
        <p>مرحباً بك في منصة الأستاذ محمد ناصر "الفيلسوف"</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ textAlign: 'center' }}>
            أدخل بياناتك
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">كلمة المرور</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            ليس لديك حساب؟{' '}
            <Link to="/register" style={{ color: 'var(--gold)' }}>
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>حسابات تجريبية:</h4>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p><strong>المدرس:</strong></p>
          <p>البريد: teacher@philosopher.com</p>
          <p>كلمة المرور: 123456</p>
          
          <p style={{ marginTop: '1rem' }}><strong>الطالب:</strong></p>
          <p>البريد: student@philosopher.com</p>
          <p>كلمة المرور: 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;