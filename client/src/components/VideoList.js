import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const VideoList = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    chapter: '',
    grade: ''
  });

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getVideos(filters);
      setVideos(data);
    } catch (error) {
      toast.error('خطأ في جلب الفيديوهات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const getVideoStatusBadge = (video) => {
    if (user.role === 'teacher') {
      return (
        <span className={`badge ${video.isActive ? 'badge-success' : 'badge-secondary'}`}>
          {video.isActive ? 'نشط' : 'غير نشط'}
        </span>
      );
    }

    if (video.canWatch) {
      return <span className="badge badge-success">متاح للمشاهدة</span>;
    } else {
      return <span className="badge badge-warning">يتطلب امتحان</span>;
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        جاري تحميل الفيديوهات...
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero">
        <h1>الفيديوهات</h1>
        <p>مكتبة الفيديوهات التعليمية — فلسفة، منطق، علم نفس</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">تصفية النتائج</h2>
        </div>
        <div className="filters-bar">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">المادة</label>
              <select
                name="subject"
                className="form-control"
                value={filters.subject}
                onChange={handleFilterChange}
              >
                <option value="">جميع المواد</option>
                <option value="الفلسفة">الفلسفة</option>
                <option value="المنطق">المنطق</option>
                <option value="علم النفس">علم النفس</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">الفصل</label>
              <select
                name="chapter"
                className="form-control"
                value={filters.chapter}
                onChange={handleFilterChange}
              >
                <option value="">جميع الفصول</option>
                <option value="الوحدة الأولى">الوحدة الأولى</option>
                <option value="الوحدة الثانية">الوحدة الثانية</option>
                <option value="الوحدة الثالثة">الوحدة الثالثة</option>
              </select>
            </div>
            
            {user.role === 'teacher' && (
              <div className="form-group">
                <label className="form-label">الصف</label>
                <select
                  name="grade"
                  className="form-control"
                  value={filters.grade}
                  onChange={handleFilterChange}
                >
                  <option value="">جميع الصفوف</option>
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قائمة الفيديوهات */}
      {videos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {videos.map((video) => (
            <div key={video._id} className="card">
              {/* صورة مصغرة للفيديو */}
              <div style={{
                height: '200px',
                background: 'linear-gradient(145deg, rgba(201, 162, 39, 0.2) 0%, rgba(13, 13, 15, 1) 100%)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                fontSize: '3rem'
              }}>
                🎥
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{video.title}</h3>
                  {getVideoStatusBadge(video)}
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {video.description}
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>📚 {video.subject}</span>
                    <span>⏱️ {formatDuration(video.duration)}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    📖 {video.chapter} - {video.lesson}
                  </div>
                  {user.role === 'student' && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      👁️ {video.views} مشاهدة
                    </div>
                  )}
                </div>

                {/* معلومات التقدم للطلاب */}
                {user.role === 'student' && video.watchProgress && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      <span>التقدم</span>
                      <span>{Math.round((video.watchProgress.watchTime / video.duration) * 100)}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${(video.watchProgress.watchTime / video.duration) * 100}%` }}
                      ></div>
                    </div>
                    {video.watchProgress.completed && (
                      <div style={{ color: '#28a745', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        ✅ مكتمل
                      </div>
                    )}
                  </div>
                )}

                {/* معلومات الامتحان المطلوب */}
                {user.role === 'student' && !video.canWatch && (
                  <div className="notification warning" style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 امتحان مطلوب:</div>
                    <div>{video.requiredExam.title}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>الحد الأدنى: {video.minimumScore}%</div>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {user.role === 'student' ? (
                    video.canWatch ? (
                      <Link 
                        to={`/videos/${video._id}`} 
                        className="btn btn-primary"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        مشاهدة الفيديو
                      </Link>
                    ) : (
                      <Link 
                        to={`/exams/${video.requiredExam._id}`} 
                        className="btn btn-warning"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        دخول الامتحان
                      </Link>
                    )
                  ) : (
                    <>
                      <Link 
                        to={`/videos/${video._id}`} 
                        className="btn btn-primary"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        عرض
                      </Link>
                      <Link 
                        to={`/videos/${video._id}/edit`} 
                        className="btn btn-success"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        تعديل
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📹</div>
            <h3>لا توجد فيديوهات متاحة</h3>
            <p>لم يتم العثور على فيديوهات تطابق المعايير المحددة</p>
            {user.role === 'teacher' && (
              <Link to="/videos/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                إضافة فيديو جديد
              </Link>
            )}
          </div>
        </div>
      )}

      {/* زر إضافة فيديو للمدرس */}
      {user.role === 'teacher' && videos.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/videos/create" className="btn btn-primary">
            ➕ إضافة فيديو جديد
          </Link>
        </div>
      )}
    </div>
  );
};

export default VideoList;