import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    regNo: '',
    password: '',
    userType: 'student'
  });

  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ Auto-fill admin credentials on admin mode
  useEffect(() => {
    if (formData.userType === 'admin') {
      setFormData({
        email: "adminpayments@gmail.com",
        regNo: "",
        password: "adminforPayments@university.com",
        userType: "admin"
      });
    }
  }, [formData.userType]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ ✅ FIXED SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("1. Raw formData:", formData);

      let payload;

      // ✅ Admin login payload
      if (formData.userType === "admin") {
        payload = {
          email: formData.email.trim().toLowerCase(),
          regNo: "",
          password: formData.password,
          userType: "admin"
        };
      } 
      // ✅ Student login payload
      else {
        payload = {
          email: "",
          regNo: formData.regNo.trim().toUpperCase(),
          password: formData.password,
          userType: "student"
        };
      }

      console.log("✅ 2. Final Payload Sent to Backend:", payload);

      const response = await authAPI.login(payload);
      const userData = response.data.data;

      console.log("✅ 3. Login Success! User:", userData);

      login(userData);

      // ✅ Redirect based on role
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }

    } catch (error) {
      console.log("❌ Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        
        {/* Left Side - University Information */}
        <div className="university-info">
          <div className="university-logo"></div>
          <h1>Vignan University</h1>
          <p className="university-tagline">Transforming Education, Transforming Lives</p>
          <p className="university-description">
            Vignan University is committed to providing quality education and fostering 
            innovation. Our online payment portal ensures secure and convenient fee 
            transactions for students and administrators.
          </p>
          <div className="university-features">
            <div className="feature">
              <div className="feature-icon">✓</div>
              <span className="feature-text">Secure Payments</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <span className="feature-text">24/7 Access</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <span className="feature-text">Instant Receipts</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <span className="feature-text">Easy Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-card">

          <div className="login-header">
            <h1>Welcome to Online Payments</h1>
            <h2>Vignan University</h2>
            <p>Please log in to continue</p>
          </div>

          <div className="user-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${formData.userType === 'student' ? 'active' : ''}`}
              onClick={() =>
                setFormData({
                  email: '',
                  regNo: '',
                  password: '',
                  userType: 'student'
                })
              }
            >
              Student Login
            </button>

            <button
              type="button"
              className={`toggle-btn ${formData.userType === 'admin' ? 'active' : ''}`}
              onClick={() =>
                setFormData({
                  email: 'adminpayments@gmail.com',
                  regNo: '',
                  password: 'adminforPayments@university.com',
                  userType: 'admin'
                })
              }
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            {formData.userType === 'student' && (
              <div className="form-group">
                <label>Registration Number</label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleChange}
                    placeholder="Enter your registration number"
                    required
                  />
                </div>
              </div>
            )}

            {formData.userType === 'admin' && (
              <div className="form-group">
                <label>Email</label>
                <div className="form-input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter admin email"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <div className="form-input-wrapper password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>

          </form>

          {formData.userType === 'student' && (
            <div className="register-link">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;