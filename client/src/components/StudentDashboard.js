import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const StudentDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await ApiService.getStudentDashboard();
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

  const { student, recentResults, availableVideos, unreadNotifications } = dashboardData;

  return (
    <div>
      <div className="page-hero">
        <h1>مرحباً {student.name} 👋</h1>
        <p>{student.grade} — منصة الأستاذ محمد ناصر "الفيلسوف"</p>
      </div>

      {/* الإحصائيات */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{student.stats.totalVideosWatched}</div>
          <div className="stat-label">فيديو مشاهد</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{student.stats.totalExamsTaken}</div>
          <div className="stat-label">امتحان مكتمل</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{student.stats.averageScore.toFixed(1)}%</div>
          <div className="stat-label">متوسط الدرجات</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.floor(student.stats.totalStudyTime / 60)}</div>
          <div className="stat-label">ساعة دراسة</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* آخر النتائج */}
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
                    <div style={{ fontWeight: 'bold' }}>{result.exam.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{result.exam.subject}</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: result.percentage >= 70 ? 'var(--success)' : 'var(--danger)' 
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
                <Link to="/exams" className="btn btn-primary">
                  عرض جميع النتائج
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>لم تقم بأي امتحانات بعد</p>
            </div>
          )}
        </div>

        {/* الفيديوهات المتاحة */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">الفيديوهات المتاحة</h3>
          </div>
          {availableVideos.length > 0 ? (
            <div>
              {availableVideos.slice(0, 5).map((video, index) => (
                <div key={index} style={{ 
                  padding: '1rem', 
                  borderBottom: index < Math.min(availableVideos.length, 5) - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{video.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {video.subject} - {video.chapter}
                    </div>
                  </div>
                  <div>
                    {video.canWatch ? (
                      <Link to={`/videos/${video._id}`} className="btn btn-success" style={{ fontSize: '0.9rem' }}>
                        مشاهدة
                      </Link>
                    ) : (
                      <span className="badge badge-warning" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        يتطلب امتحان
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <Link to="/videos" className="btn btn-primary">
                  عرض جميع الفيديوهات
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>لا توجد فيديوهات متاحة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* الإشعارات غير المقروءة */}
      {unreadNotifications.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">إشعارات جديدة ({unreadNotifications.length})</h3>
          </div>
          <div>
            {unreadNotifications.slice(0, 3).map((notification, index) => (
              <div key={index} className={`notification ${notification.type}`} style={{ margin: '0.5rem' }}>
                <div style={{ fontWeight: 'bold' }}>{notification.title}</div>
                <div>{notification.message}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  {new Date(notification.createdAt).toLocaleString('ar-EG')}
                </div>
              </div>
            ))}
            {unreadNotifications.length > 3 && (
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <Link to="/notifications" className="btn btn-primary">
                  عرض جميع الإشعارات ({unreadNotifications.length})
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;