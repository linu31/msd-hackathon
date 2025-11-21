import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import ChatBot from './components/ChatBot';
import Footer from './components/Footer';
import Profile from './pages/Profile';

import './styles/App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ✅ Student Dashboard */}
            <Route 
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Header />
                  <StudentDashboard />
                  <Footer />
                </ProtectedRoute>
              }
            />

            {/* ✅ Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Header />
                  <AdminDashboard />
                  <Footer />
                </ProtectedRoute>
              }
            />

            {/* ✅ Profile Page (for both student + admin) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Header />
                  <Profile />
                  <Footer />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />

          </Routes>
          <ChatBot />

          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
