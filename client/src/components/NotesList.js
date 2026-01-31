import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const NotesList = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    unreadOnly: user.role === 'student' ? 'false' : ''
  });
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [filters]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNotes(filters);
      setNotes(data);
    } catch (error) {
      toast.error('خطأ في جلب الملاحظات');
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

  const handleMarkAsRead = async (noteId) => {
    if (user.role !== 'student') return;

    try {
      await ApiService.markNoteAsRead(noteId);
      // تحديث الحالة محلياً
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note._id === noteId 
            ? { ...note, isRead: true, readAt: new Date() }
            : note
        )
      );
    } catch (error) {
      console.error('خطأ في تسجيل القراءة:', error);
    }
  };

  const handleExpandNote = (noteId) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
    
    // تسجيل القراءة عند فتح الملاحظة
    const note = notes.find(n => n._id === noteId);
    if (user.role === 'student' && note && !note.isRead) {
      handleMarkAsRead(noteId);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'reminder': return '⏰';
      case 'material': return '📚';
      case 'homework': return '📝';
      default: return '📄';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'announcement': return 'إعلان';
      case 'reminder': return 'تذكير';
      case 'material': return 'مادة تعليمية';
      case 'homework': return 'واجب';
      default: return 'ملاحظة';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'مهم';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'عادي';
    }
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

  const isExpired = (expiryDate) => {
    return expiryDate && new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        جاري تحميل الملاحظات...
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero">
        <h1>الملاحظات</h1>
        <p>الملاحظات والإعلانات والمواد من المدرس</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">تصفية النتائج</h2>
        </div>
        <div className="filters-bar">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">نوع الملاحظة</label>
              <select
                name="type"
                className="form-control"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">جميع الأنواع</option>
                <option value="announcement">إعلان</option>
                <option value="reminder">تذكير</option>
                <option value="material">مادة تعليمية</option>
                <option value="homework">واجب</option>
              </select>
            </div>
            
            {user.role === 'student' && (
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  name="unreadOnly"
                  className="form-control"
                  value={filters.unreadOnly}
                  onChange={handleFilterChange}
                >
                  <option value="false">جميع الملاحظات</option>
                  <option value="true">غير المقروءة فقط</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قائمة الملاحظات */}
      {notes.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {notes.map((note) => (
            <div 
              key={note._id} 
              className="card"
              style={{
                border: user.role === 'student' && !note.isRead ? '2px solid #667eea' : '1px solid #ddd',
                backgroundColor: isExpired(note.expiryDate) ? '#f8f9fa' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>
                    {getTypeIcon(note.type)}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
                      {note.title}
                      {user.role === 'student' && !note.isRead && (
                        <span className="badge badge-primary" style={{ marginRight: '0.5rem' }}>
                          جديد
                        </span>
                      )}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span>{getTypeLabel(note.type)}</span>
                      <span>•</span>
                      <span>{formatDate(note.createdAt)}</span>
                      <span>•</span>
                      <span>بواسطة {note.createdBy.name}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span 
                    style={{ 
                      background: getPriorityColor(note.priority),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem'
                    }}
                  >
                    {getPriorityLabel(note.priority)}
                  </span>
                  
                  {isExpired(note.expiryDate) && (
                    <span style={{ 
                      background: '#6c757d',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem'
                    }}>
                      منتهي الصلاحية
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  display: expandedNote === note._id ? 'block' : '-webkit-box',
                  WebkitLineClamp: expandedNote === note._id ? 'none' : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {note.content}
                </p>
                
                {note.content.length > 200 && (
                  <button
                    onClick={() => handleExpandNote(note._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    {expandedNote === note._id ? 'عرض أقل' : 'عرض المزيد'}
                  </button>
                )}
              </div>

              {/* المرفقات */}
              {note.attachments && note.attachments.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--gold)' }}>
                    📎 المرفقات ({note.attachments.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {note.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.path}
                        download={attachment.originalName}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: '20px',
                          textDecoration: 'none',
                          color: 'var(--gold)',
                          fontSize: '0.9rem',
                          border: '1px solid var(--border)'
                        }}
                      >
                        📄 {attachment.originalName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات إضافية للمدرس */}
              {user.role === 'teacher' && (
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <strong>الجمهور المستهدف:</strong>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {note.targetAudience.grade || 'جميع الصفوف'}
                        {note.targetAudience.subject && ` - ${note.targetAudience.subject}`}
                      </div>
                    </div>
                    <div>
                      <strong>إحصائيات القراءة:</strong>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {note.readCount} من {note.targetStudentsCount} ({note.readPercentage.toFixed(1)}%)
                      </div>
                    </div>
                    {note.expiryDate && (
                      <div>
                        <strong>تاريخ الانتهاء:</strong>
                        <div style={{ color: isExpired(note.expiryDate) ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {formatDate(note.expiryDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات القراءة للطلاب */}
              {user.role === 'student' && note.isRead && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#28a745',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ✅ تم القراءة في {formatDate(note.readAt)}
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                {user.role === 'student' ? (
                  <>
                    {!note.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(note._id)}
                        className="btn btn-success"
                        style={{ fontSize: '0.9rem' }}
                      >
                        تسجيل كمقروء
                      </button>
                    )}
                    <Link 
                      to={`/notes/${note._id}`} 
                      className="btn btn-primary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      عرض التفاصيل
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to={`/notes/${note._id}/stats`} 
                      className="btn btn-primary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      الإحصائيات
                    </Link>
                    <Link 
                      to={`/notes/${note._id}/edit`} 
                      className="btn btn-success"
                      style={{ fontSize: '0.9rem' }}
                    >
                      تعديل
                    </Link>
                    <Link 
                      to={`/notes/${note._id}`} 
                      className="btn btn-outline-primary"
                      style={{ fontSize: '0.9rem' }}
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
            <div className="empty-state-icon">📝</div>
            <h3>لا توجد ملاحظات</h3>
            <p>لم يتم العثور على ملاحظات تطابق المعايير المحددة</p>
            {user.role === 'teacher' && (
              <Link to="/notes/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                إضافة ملاحظة جديدة
              </Link>
            )}
          </div>
        </div>
      )}

      {/* زر إضافة ملاحظة للمدرس */}
      {user.role === 'teacher' && notes.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/notes/create" className="btn btn-primary">
            ➕ إضافة ملاحظة جديدة
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotesList;