import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const VideoPlayer = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  useEffect(() => {
    // تحديث وقت المشاهدة كل 10 ثوان
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const current = videoRef.current.currentTime;
        setCurrentTime(current);
        setWatchTime(Math.max(watchTime, current));
        
        // حفظ التقدم في قاعدة البيانات
        updateWatchProgress(current);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, watchTime]);

  const fetchVideo = async () => {
    try {
      const data = await ApiService.getVideo(id);
      setVideo(data);
      setDuration(data.duration);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
        navigate('/exams');
      } else {
        toast.error('خطأ في جلب الفيديو');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateWatchProgress = async (currentWatchTime) => {
    if (!video || user.role !== 'student') return;

    try {
      const completed = currentWatchTime >= duration * 0.9; // 90% من الفيديو
      await ApiService.updateVideoWatchTime(video._id, currentWatchTime, completed);
    } catch (error) {
      console.error('خطأ في تحديث التقدم:', error);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      setWatchTime(Math.max(watchTime, current));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>جاري تحميل الفيديو...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>الفيديو غير موجود</div>
        <button onClick={() => navigate('/videos')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          العودة للفيديوهات
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* معلومات الفيديو */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => navigate('/videos')} 
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
          >
            ← العودة
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{video.title}</h1>
            <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              📚 {video.subject} • 📖 {video.chapter} • ⏱️ {formatTime(duration)}
            </div>
          </div>
        </div>
        
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {video.description}
        </p>

        {/* شريط التقدم للطلاب */}
        {user.role === 'student' && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span>تقدم المشاهدة</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="progress">
              <div 
                className="progress-bar" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* مشغل الفيديو */}
      <div className="card">
        <div className="video-container" style={{ position: 'relative', marginBottom: '1rem' }}>
          {video.videoUrl ? (
            <video
              ref={videoRef}
              width="100%"
              height="400"
              controls
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              style={{ borderRadius: '10px' }}
            >
              <source src={video.videoUrl} type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          ) : (
            <div style={{
              height: '400px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎥</div>
              <h3>فيديو تجريبي</h3>
              <p>هذا فيديو تجريبي للعرض</p>
              <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                المدة: {formatTime(duration)}
              </div>
            </div>
          )}
        </div>

        {/* معلومات إضافية */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--gold)' }}>📊 الإحصائيات</h4>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div>المشاهدات: {video.views}</div>
              <div>المدة: {formatTime(duration)}</div>
              {user.role === 'student' && (
                <div>وقت المشاهدة: {formatTime(watchTime)}</div>
              )}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--gold)' }}>📋 متطلبات المشاهدة</h4>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div>الامتحان المطلوب: {video.requiredExam?.title}</div>
              <div>الحد الأدنى: {video.minimumScore}%</div>
              {user.role === 'student' && video.examScore && (
                <div style={{ color: '#28a745', fontWeight: 'bold' }}>
                  ✅ درجتك: {video.examScore}%
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--gold)' }}>👨‍🏫 المدرس</h4>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div>الأستاذ محمد ناصر</div>
              <div>"الفيلسوف"</div>
              <div>مدرس فلسفة ومنطق</div>
            </div>
          </div>
        </div>

        {/* ملاحظات للطلاب */}
        {user.role === 'student' && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#e3f2fd', 
            borderRadius: '8px',
            border: '1px solid #bbdefb'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>💡 نصائح للمشاهدة</h4>
            <ul style={{ margin: 0, paddingRight: '1.5rem', color: '#666' }}>
              <li>شاهد الفيديو كاملاً للحصول على أقصى استفادة</li>
              <li>دون الملاحظات المهمة أثناء المشاهدة</li>
              <li>يمكنك إيقاف الفيديو والعودة لاحقاً</li>
              <li>راجع المحتوى أكثر من مرة إذا لزم الأمر</li>
            </ul>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/videos')} 
            className="btn btn-secondary"
          >
            العودة للفيديوهات
          </button>
          
          {user.role === 'student' && (
            <button 
              onClick={() => navigate('/exams')} 
              className="btn btn-primary"
            >
              الامتحانات المتاحة
            </button>
          )}
          
          {user.role === 'teacher' && (
            <>
              <button 
                onClick={() => navigate(`/videos/${video._id}/edit`)} 
                className="btn btn-success"
              >
                تعديل الفيديو
              </button>
              <button 
                onClick={() => navigate(`/videos/${video._id}/stats`)} 
                className="btn btn-primary"
              >
                إحصائيات المشاهدة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;