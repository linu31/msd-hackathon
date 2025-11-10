import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSettings = () => {
    navigate('/profile');   // ✅ FIXED: Now this redirects to Profile page
    setShowDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="https://media.glassdoor.com/sqll/534341/vignan-university-squarelogo-1447826853370.png"
            alt="Vignan Logo"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <h1>Vignan's Online Payment And Receipt System</h1>
        </div>

        <div className="profile-section" ref={dropdownRef}>
          <button 
            className="profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            👤
          </button>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleProfileSettings}>
                Profile Settings
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
