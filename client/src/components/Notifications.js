import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';

const Notifications = ({ user }) => {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getNotifications();
      setData({
        notifications: res.notifications || [],
        unreadCount: res.unreadCount || 0
      });
    } catch (error) {
      toast.error('خطأ في جلب الإشعارات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await ApiService.markNotificationAsRead(id);
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      toast.error('خطأ في تحديث الإشعار');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
      toast.success('تم تحديد الكل كمقروء');
    } catch (error) {
      toast.error('خطأ في التحديث');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  if (loading) {
    return (
      <div className="loading-wrap">
        جاري تحميل الإشعارات...
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero">
        <h1>الإشعارات</h1>
        <p>كل إشعاراتك في مكان واحد</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="card-title">قائمة الإشعارات</h2>
          {data.unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-primary">
              تحديد الكل كمقروء
            </button>
          )}
        </div>

        {data.notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>لا توجد إشعارات</h3>
            <p>عند وصول إشعارات جديدة ستظهر هنا</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.notifications.map((n) => (
              <div
                key={n._id}
                className={`notification ${n.type || 'info'}`}
                style={{
                  opacity: n.isRead ? 0.85 : 1,
                  border: n.isRead ? undefined : '1px solid var(--gold)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong>{n.title}</strong>
                    <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>{n.message}</p>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      {formatDate(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="btn btn-outline-primary"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    >
                      مقروء
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
