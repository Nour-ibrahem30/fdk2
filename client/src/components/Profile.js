import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';

const Profile = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    notificationSettings: user?.notificationSettings || {
      email: true,
      push: true,
      newVideo: true,
      newNote: true,
      examReminder: true
    }
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'student') {
      fetchStats();
    }
  }, [user.role]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await ApiService.getStudentStats();
      setStats(data);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const settingName = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [settingName]: checked
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.updateProfile(profileData);
      setUser(response.user);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      toast.error(error.message || 'خطأ في تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ساعة و ${remainingMinutes} دقيقة`;
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">الملف الشخصي</h2>
        </div>
        
        {/* تبويبات */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '2rem', padding: '0 1rem' }}>
            <button
              onClick={() => setActiveTab('info')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                borderBottom: activeTab === 'info' ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeTab === 'info' ? 'var(--gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              المعلومات الشخصية
            </button>
            
            {user.role === 'student' && (
              <button
                onClick={() => setActiveTab('stats')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  borderBottom: activeTab === 'stats' ? '2px solid var(--gold)' : '2px solid transparent',
                  color: activeTab === 'stats' ? 'var(--gold)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                الإحصائيات والتقدم
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                borderBottom: activeTab === 'notifications' ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeTab === 'notifications' ? 'var(--gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              إعدادات الإشعارات
            </button>
          </div>
        </div>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">المعلومات الشخصية</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <div className="form-group">
                  <label className="form-label">الاسم الكامل</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email}
                    disabled
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    لا يمكن تغيير البريد الإلكتروني
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="form-group">
                  <label className="form-label">نوع الحساب</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.role === 'teacher' ? 'مدرس' : 'طالب'}
                    disabled
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                  />
                </div>

                {user.role === 'student' && (
                  <div className="form-group">
                    <label className="form-label">الصف الدراسي</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user.grade}
                      disabled
                      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">تاريخ التسجيل</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(user.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                    disabled
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">آخر تسجيل دخول</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(user.lastLogin || Date.now()).toLocaleString('ar-EG')}
                    disabled
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0.75rem 2rem' }}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'stats' && user.role === 'student' && (
        <div>
          {statsLoading ? (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                جاري تحميل الإحصائيات...
              </div>
            </div>
          ) : stats ? (
            <>
              {/* الإحصائيات العامة */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                  <h3 className="card-title">الإحصائيات العامة</h3>
                </div>
                
                <div className="dashboard-grid">
                  <div className="stat-card">
                    <div className="stat-number">{stats.overallStats.totalVideosWatched}</div>
                    <div className="stat-label">فيديو مشاهد</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.overallStats.totalExamsTaken}</div>
                    <div className="stat-label">امتحان مكتمل</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.overallStats.averageScore.toFixed(1)}%</div>
                    <div className="stat-label">متوسط الدرجات</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{Math.floor(stats.overallStats.totalStudyTime / 60)}</div>
                    <div className="stat-label">ساعة دراسة</div>
                  </div>
                </div>
              </div>

              {/* إحصائيات الامتحانات */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                  <h3 className="card-title">أداء الامتحانات</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>📊 الإحصائيات</h4>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>إجمالي الامتحانات:</strong> {stats.examStats.totalExams}
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>الامتحانات المجتازة:</strong> {stats.examStats.passedExams}
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>متوسط الدرجات:</strong> {stats.examStats.averageScore.toFixed(1)}%
                      </div>
                      <div>
                        <strong>أفضل درجة:</strong> {stats.examStats.bestScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>📈 الأداء الحديث</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {stats.examStats.recentPerformance.map((result, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            borderBottom: '1px solid var(--border)',
                            fontSize: '0.9rem'
                          }}
                        >
                          <span>{result.examTitle}</span>
                          <span style={{ 
                            color: result.score >= 70 ? '#28a745' : '#dc3545',
                            fontWeight: 'bold'
                          }}>
                            {result.score.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* إحصائيات الفيديوهات */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">نشاط المشاهدة</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>🎥 الفيديوهات</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                      {stats.videoStats.totalVideosWatched}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>فيديو مشاهد</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>⏱️ وقت الدراسة</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                      {Math.floor(stats.videoStats.totalWatchTime / 60)}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>ساعة</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>✅ مكتمل</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                      {stats.videoStats.completedVideos}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>فيديو مكتمل</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                خطأ في تحميل الإحصائيات
                <button 
                  onClick={fetchStats} 
                  className="btn btn-primary" 
                  style={{ marginTop: '1rem', display: 'block', margin: '1rem auto 0' }}
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">إعدادات الإشعارات</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>طرق الإشعار</h4>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="notifications.email"
                      checked={profileData.notificationSettings.email}
                      onChange={handleInputChange}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>📧 إشعارات البريد الإلكتروني</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        استقبال الإشعارات عبر البريد الإلكتروني
                      </div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="notifications.push"
                      checked={profileData.notificationSettings.push}
                      onChange={handleInputChange}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>🔔 الإشعارات الفورية</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        إشعارات فورية في المتصفح والهاتف
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>أنواع الإشعارات</h4>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="notifications.newVideo"
                      checked={profileData.notificationSettings.newVideo}
                      onChange={handleInputChange}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>🎥 فيديوهات جديدة</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        إشعار عند إضافة فيديو تعليمي جديد
                      </div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="notifications.newNote"
                      checked={profileData.notificationSettings.newNote}
                      onChange={handleInputChange}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>📝 ملاحظات وإعلانات</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        إشعار عند إضافة ملاحظة أو إعلان جديد
                      </div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="notifications.examReminder"
                      checked={profileData.notificationSettings.examReminder}
                      onChange={handleInputChange}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>📋 تذكير الامتحانات</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        تذكير بمواعيد الامتحانات المهمة
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0.75rem 2rem' }}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;