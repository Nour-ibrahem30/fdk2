import axios from 'axios';

class ApiService {
  // خدمات الطلاب
  async getStudentDashboard() {
    const response = await axios.get('/api/students/dashboard');
    return response.data;
  }

  async getStudentStats() {
    const response = await axios.get('/api/students/stats');
    return response.data;
  }

  async updateVideoWatchTime(videoId, watchTime, completed) {
    const response = await axios.post(`/api/students/video/${videoId}/watch`, {
      watchTime,
      completed
    });
    return response.data;
  }

  // خدمات المدرس
  async getTeacherDashboard() {
    const response = await axios.get('/api/teacher/dashboard');
    return response.data;
  }

  async getStudentsList(params = {}) {
    const response = await axios.get('/api/teacher/students', { params });
    return response.data;
  }

  async getStudentDetails(studentId) {
    const response = await axios.get(`/api/teacher/students/${studentId}`);
    return response.data;
  }

  async sendNotificationToStudent(studentId, notification) {
    const response = await axios.post(`/api/teacher/students/${studentId}/notify`, notification);
    return response.data;
  }

  // خدمات الفيديوهات
  async getVideos(params = {}) {
    const response = await axios.get('/api/videos', { params });
    return response.data;
  }

  async getVideo(videoId) {
    const response = await axios.get(`/api/videos/${videoId}`);
    return response.data;
  }

  async createVideo(formData) {
    const response = await axios.post('/api/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async updateVideo(videoId, videoData) {
    const response = await axios.put(`/api/videos/${videoId}`, videoData);
    return response.data;
  }

  async deleteVideo(videoId) {
    const response = await axios.delete(`/api/videos/${videoId}`);
    return response.data;
  }

  // خدمات الامتحانات
  async getExams(params = {}) {
    const response = await axios.get('/api/exams', { params });
    return response.data;
  }

  async getExam(examId) {
    const response = await axios.get(`/api/exams/${examId}`);
    return response.data;
  }

  async createExam(examData) {
    const response = await axios.post('/api/exams', examData);
    return response.data;
  }

  async submitExam(examId, answers, startedAt, timeSpent) {
    const response = await axios.post(`/api/exams/${examId}/submit`, {
      answers,
      startedAt,
      timeSpent
    });
    return response.data;
  }

  async getExamResults(examId) {
    const response = await axios.get(`/api/exams/${examId}/results`);
    return response.data;
  }

  // خدمات الملاحظات
  async getNotes(params = {}) {
    const response = await axios.get('/api/notes', { params });
    return response.data;
  }

  async getNote(noteId) {
    const response = await axios.get(`/api/notes/${noteId}`);
    return response.data;
  }

  async createNote(formData) {
    const response = await axios.post('/api/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async updateNote(noteId, noteData) {
    const response = await axios.put(`/api/notes/${noteId}`, noteData);
    return response.data;
  }

  async deleteNote(noteId) {
    const response = await axios.delete(`/api/notes/${noteId}`);
    return response.data;
  }

  async markNoteAsRead(noteId) {
    const response = await axios.post(`/api/notes/${noteId}/read`);
    return response.data;
  }

  // خدمات الإشعارات
  async getNotifications(params = {}) {
    const response = await axios.get('/api/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId) {
    const response = await axios.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await axios.put('/api/notifications/read-all');
    return response.data;
  }

  async deleteNotification(notificationId) {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }

  async getUnreadNotificationsCount() {
    const response = await axios.get('/api/notifications/unread-count');
    return response.data;
  }
}

export default new ApiService();