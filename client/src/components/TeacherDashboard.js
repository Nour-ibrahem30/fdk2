import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const TeacherDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await ApiService.getTeacherDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('خطأ في جلب بيانات لوحة التحكم');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        جاري تحميل لوحة التحكم...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="empty-state">
        <p>خطأ في تحميل البيانات</p>
        <button onClick={fetchDashboardData} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { stats, recentResults } = dashboardData;

  return (
    <div>
      <div className="page-hero">
        <h1>مرحباً أستاذ محمد ناصر "الفيلسوف" 👨‍🏫</h1>
        <p>لوحة تحكم المدرس — إدارة المنصة التعليمية</p>
      </div>

      {/* الإحصائيات */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">إجمالي الطلاب</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeStudents}</div>
          <div className="stat-label">طلاب نشطين</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalVideos}</div>
          <div className="stat-label">الفيديوهات</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalExams}</div>
          <div className="stat-label">الامتحانات</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalNotes}</div>
          <div className="stat-label">الملاحظات</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.averageScore.toFixed(1)}%</div>
          <div className="stat-label">متوسط الدرجات</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.passRate.toFixed(1)}%</div>
          <div className="stat-label">معدل النجاح</div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">الإجراءات السريعة</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/videos/create" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center' }}>
            🎥 إضافة فيديو جديد
          </Link>
          <Link to="/exams/create" className="btn btn-success" style={{ padding: '1rem', textAlign: 'center' }}>
            📋 إنشاء امتحان
          </Link>
          <Link to="/notes/create" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center' }}>
            📝 كتابة ملاحظة
          </Link>
          <Link to="/teacher/students" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center' }}>
            👥 إدارة الطلاب
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* آخر نتائج الامتحانات */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">آخر نتائج الامتحانات</h3>
          </div>
          {recentResults.length > 0 ? (
            <div>
              {recentResults.map((result, index) => (
                <div key={index} style={{ 
                  padding: '1rem', 
                  borderBottom: index < recentResults.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{result.student.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {result.exam.title} - {result.student.grade}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: result.percentage >= 70 ? '#28a745' : '#dc3545' 
                    }}>
                      {result.percentage.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(result.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <Link to="/teacher/results" className="btn btn-primary">
                  عرض جميع النتائج
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              لا توجد نتائج حديثة
            </div>
          )}
        </div>

        {/* إحصائيات الأداء */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">تحليل الأداء</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>معدل النشاط</span>
                <span>{((stats.activeStudents / stats.totalStudents) * 100).toFixed(1)}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(stats.activeStudents / stats.totalStudents) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>معدل النجاح</span>
                <span>{stats.passRate.toFixed(1)}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${stats.passRate}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>متوسط الدرجات</span>
                <span>{stats.averageScore.toFixed(1)}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${stats.averageScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نصائح وإرشادات */}
      <div className="card" style={{ marginTop: '2rem', background: '#f8f9fa' }}>
        <div className="card-header">
          <h3 className="card-title">💡 نصائح لتحسين الأداء</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>📊 تتبع التقدم</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              راقب أداء الطلاب بانتظام وقدم التغذية الراجعة المناسبة
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>🎯 محتوى متنوع</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              نوع في طرق التدريس بين الفيديوهات والامتحانات والملاحظات
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>🔔 التواصل الفعال</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              استخدم الإشعارات والملاحظات للتواصل المستمر مع الطلاب
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;