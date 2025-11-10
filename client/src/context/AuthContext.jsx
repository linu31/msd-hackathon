import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');

      // ✅ Safely handle invalid values
      if (
        storedUser &&
        storedUser !== "undefined" &&
        storedUser !== "null" &&
        storedUser !== "" 
      ) {
        const parsedUser = JSON.parse(storedUser);

        // ✅ Ensure parsed data is actually an object
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        }
      } else {
        // ✅ If corrupted, remove it
        localStorage.removeItem("user");
      }
    } catch (err) {
      // ✅ If JSON.parse fails, remove corrupted data
      localStorage.removeItem("user");
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    toast.success('Login successful!');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = { user, login, logout, updateUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
