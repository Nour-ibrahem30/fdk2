import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const ExamList = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    available: user.role === 'student' ? 'true' : ''
  });

  useEffect(() => {
    fetchExams();
  }, [filters]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getExams(filters);
      setExams(data);
    } catch (error) {
      toast.error('خطأ في جلب الامتحانات');
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

  const getExamStatusBadge = (exam) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (user.role === 'teacher') {
      if (now < startDate) {
        return <span className="badge badge-warning">لم يبدأ</span>;
      } else if (now > endDate) {
        return <span className="badge badge-secondary">انتهى</span>;
      } else {
        return <span className="badge badge-success">نشط</span>;
      }
    }

    // للطلاب
    if (exam.passed) {
      return <span className="badge badge-success">نجحت ({exam.bestScore.toFixed(1)}%)</span>;
    } else if (exam.attempts > 0) {
      return <span className="badge badge-warning">محاولة ({exam.bestScore?.toFixed(1) || 0}%)</span>;
    } else if (exam.canTake) {
      return <span className="badge badge-primary">متاح</span>;
    } else if (exam.remainingAttempts === 0) {
      return <span className="badge badge-danger">استنفدت المحاولات</span>;
    } else if (now < startDate) {
      return <span className="badge badge-warning">لم يبدأ</span>;
    } else if (now > endDate) {
      return <span className="badge badge-secondary">انتهى</span>;
    }
    
    return <span className="badge badge-secondary">غير متاح</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'انتهى';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} يوم و ${hours} ساعة`;
    } else {
      return `${hours} ساعة`;
    }
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        جاري تحميل الامتحانات...
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero">
        <h1>الامتحانات</h1>
        <p>امتحانات أونلاين — فلسفة، منطق، علم نفس</p>
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

            {user.role === 'student' && (
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  name="available"
                  className="form-control"
                  value={filters.available}
                  onChange={handleFilterChange}
                >
                  <option value="">جميع الامتحانات</option>
                  <option value="true">المتاحة فقط</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قائمة الامتحانات */}
      {exams.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {exams.map((exam) => (
            <div key={exam._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>{exam.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    📚 {exam.subject} • 📖 {exam.chapter} • 🎯 {exam.grade}
                  </div>
                </div>
                {getExamStatusBadge(exam)}
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {exam.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold)' }}>📊 تفاصيل الامتحان</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div>عدد الأسئلة: {exam.questions?.length || 0}</div>
                    <div>إجمالي النقاط: {exam.totalPoints}</div>
                    <div>درجة النجاح: {exam.passingScore}%</div>
                    <div>المدة: {exam.duration} دقيقة</div>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold)' }}>⏰ التوقيت</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div>البداية: {formatDate(exam.startDate)}</div>
                    <div>النهاية: {formatDate(exam.endDate)}</div>
                    <div>الوقت المتبقي: {getTimeRemaining(exam.endDate)}</div>
                  </div>
                </div>

                {user.role === 'student' && (
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold)' }}>📈 أدائك</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div>المحاولات: {exam.attempts} / {exam.attempts}</div>
                      <div>المتبقية: {exam.remainingAttempts}</div>
                      {exam.bestScore !== null && (
                        <div>أفضل درجة: {exam.bestScore.toFixed(1)}%</div>
                      )}
                      {exam.passed && (
                        <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ نجحت</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* تحذيرات ومعلومات مهمة */}
              {user.role === 'student' && exam.canTake && (
                <div className="notification warning" style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ⚠️ تعليمات مهمة:
                  </div>
                  <ul style={{ margin: 0, paddingRight: '1.5rem', fontSize: '0.9rem' }}>
                    <li>تأكد من اتصال الإنترنت قبل البدء</li>
                    <li>لديك {exam.duration} دقيقة لإنهاء الامتحان</li>
                    <li>لا يمكن العودة للأسئلة السابقة بعد الانتقال</li>
                    <li>احفظ إجاباتك بانتظام</li>
                  </ul>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                {user.role === 'student' ? (
                  <>
                    {exam.canTake ? (
                      <Link 
                        to={`/exams/${exam._id}/take`} 
                        className="btn btn-primary"
                      >
                        بدء الامتحان
                      </Link>
                    ) : exam.attempts > 0 ? (
                      <Link 
                        to={`/exams/${exam._id}/results`} 
                        className="btn btn-secondary"
                      >
                        عرض النتائج
                      </Link>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        غير متاح
                      </button>
                    )}
                    
                    <Link 
                      to={`/exams/${exam._id}`} 
                      className="btn btn-outline-primary"
                    >
                      التفاصيل
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to={`/exams/${exam._id}/results`} 
                      className="btn btn-primary"
                    >
                      النتائج ({exam.submissionsCount || 0})
                    </Link>
                    <Link 
                      to={`/exams/${exam._id}/edit`} 
                      className="btn btn-success"
                    >
                      تعديل
                    </Link>
                    <Link 
                      to={`/exams/${exam._id}`} 
                      className="btn btn-outline-primary"
                    >
                      عرض
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>لا توجد امتحانات متاحة</h3>
            <p>لم يتم العثور على امتحانات تطابق المعايير المحددة</p>
            {user.role === 'teacher' && (
              <Link to="/exams/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                إنشاء امتحان جديد
              </Link>
            )}
          </div>
        </div>
      )}

      {/* زر إنشاء امتحان للمدرس */}
      {user.role === 'teacher' && exams.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/exams/create" className="btn btn-primary">
            ➕ إنشاء امتحان جديد
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExamList;