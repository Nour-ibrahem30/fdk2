import io from 'socket.io-client';
import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  init(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('متصل بخادم الإشعارات');
      this.isConnected = true;
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('انقطع الاتصال بخادم الإشعارات');
      this.isConnected = false;
    });

    this.socket.on('notification', (notification) => {
      this.showNotification(notification);
      
      // إشعار المتصفح إذا كان مدعوماً
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
          tag: notification.type
        });
      }
    });

    // طلب إذن الإشعارات
    this.requestNotificationPermission();
  }

  showNotification(notification) {
    const { title, message, type } = notification;
    
    switch (type) {
      case 'video':
        toast.info(`🎥 ${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        break;
      case 'note':
        toast.info(`📝 ${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        break;
      case 'exam':
        toast.warning(`📋 ${title}: ${message}`, {
          position: "top-right",
          autoClose: 7000,
        });
        break;
      case 'result':
        toast.success(`📊 ${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        break;
      default:
        toast.info(`${title}: ${message}`, {
          position: "top-right",
          autoClose: 5000,
        });
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('تم منح إذن الإشعارات');
        }
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isConnectedToServer() {
    return this.isConnected;
  }
}

export default new NotificationService();