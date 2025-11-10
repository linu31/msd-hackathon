import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    department: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        department: user.department,
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await authAPI.updateProfile(formData);
      if (response.data.success) {
        updateUser(response.data.data);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const goBack = () => {
    if (user.role === "admin") navigate("/admin");
    else navigate("/student");
  };

  return (
    <div className="profile-container">

      {/* ✅ Back Button Added Here */}
      <button className="back-btn" onClick={goBack}>
         Back to Dashboard
      </button>

      <div className="profile-card">
        <h2 className="profile-title">Profile Settings</h2>
        <p className="profile-subtitle">Update your account details below</p>

        <div className="profile-group">
          <label>Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>

        <div className="profile-group">
          <label>Email</label>
          <input
            name="email"
            value={formData.email}
            type="email"
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>

        <div className="profile-group">
          <label>Mobile</label>
          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
          />
        </div>

        <div className="profile-group">
          <label>Department</label>
          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter department"
          />
        </div>

        <div className="profile-group">
          <label>New Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
          />
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
