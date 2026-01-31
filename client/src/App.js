import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import ExamList from './components/ExamList';
import ExamTaking from './components/ExamTaking';
import NotesList from './components/NotesList';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import NotificationService from './services/NotificationService';
import AuthService from './services/AuthService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من وجود مستخدم مسجل دخول
    const checkAuth = async () => {
      try {
        const userData = await AuthService.getCurrentUser();
        if (userData) {
          setUser(userData);
          // تهيئة خدمة الإشعارات
          NotificationService.init(userData.id);
        }
      } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    NotificationService.init(userData.id);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    NotificationService.disconnect();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        
        <main style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 0' }}>
          <div className="container">
            <Routes>
              {/* الصفحات العامة */}
              <Route 
                path="/login" 
                element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/register" 
                element={!user ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" />} 
              />
              
              {/* الصفحات المحمية */}
              <Route 
                path="/dashboard" 
                element={
                  user ? (
                    user.role === 'student' ? 
                      <StudentDashboard user={user} /> : 
                      <TeacherDashboard user={user} />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              
              <Route 
                path="/videos" 
                element={user ? <VideoList user={user} /> : <Navigate to="/login" />} 
              />
              
              <Route 
                path="/videos/:id" 
                element={user ? <VideoPlayer user={user} /> : <Navigate to="/login" />} 
              />
              
              <Route 
                path="/exams" 
                element={user ? <ExamList user={user} /> : <Navigate to="/login" />} 
              />
              
              <Route 
                path="/exams/:id/take" 
                element={
                  user && user.role === 'student' ? 
                    <ExamTaking user={user} /> : 
                    <Navigate to="/login" />
                } 
              />
              
              <Route 
                path="/notes" 
                element={user ? <NotesList user={user} /> : <Navigate to="/login" />} 
              />
              
              <Route 
                path="/profile" 
                element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
              />
              
              <Route 
                path="/notifications" 
                element={user ? <Notifications user={user} /> : <Navigate to="/login" />} 
              />
              
              {/* الصفحة الرئيسية: لاندنج للزوار، لوحة تحكم للمسجلين */}
              <Route 
                path="/" 
                element={
                  user ? 
                    <Navigate to="/dashboard" /> : 
                    <Landing />
                } 
              />
            </Routes>
          </div>
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;