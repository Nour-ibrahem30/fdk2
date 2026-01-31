import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const Header = ({ user, onLogout }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await ApiService.getUnreadNotificationsCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('خطأ في جلب عدد الإشعارات:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to={user ? "/dashboard" : "/"} className="logo-link">
            <img
              src="/logo.png"
              alt="للفيلسوف - مدرس فلسفة ومنطق"
              className="logo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo-philosopher.png';
              }}
            />
            <div>
              <div className="logo-text">للفيلسوف</div>
              <div className="logo-sub">مدرس فلسفة ومنطق</div>
            </div>
          </Link>

          {user ? (
            <nav>
              <ul className="nav-menu">
                <li>
                  <Link to="/dashboard">لوحة التحكم</Link>
                </li>
                <li>
                  <Link to="/videos">الفيديوهات</Link>
                </li>
                <li>
                  <Link to="/exams">الامتحانات</Link>
                </li>
                <li>
                  <Link to="/notes">الملاحظات</Link>
                </li>
                <li style={{ position: 'relative' }}>
                  <Link to="/notifications">
                    🔔 الإشعارات
                    {unreadCount > 0 && (
                      <span className="badge badge-danger" style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-4px',
                        minWidth: '20px',
                        height: '20px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px'
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link to="/profile">الملف الشخصي</Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}
                  >
                    تسجيل الخروج
                  </button>
                </li>
              </ul>
            </nav>
          ) : (
            <nav>
              <ul className="nav-menu">
                <li>
                  <Link to="/login" className="nav-cta">تسجيل الدخول</Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    إنشاء حساب
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
