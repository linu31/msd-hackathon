import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [showTotal, setShowTotal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getDepartmentStats();
      if (response?.data?.data?.departments) {
        setStats(response.data.data.departments);
      } else {
        setStats([]);
        toast.error('No data received from server');
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Failed to fetch statistics');
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = stats.reduce((sum, dept) => sum + (dept.totalStudents || 0), 0);

  const handleDepartmentClick = async (department) => {
    setSelectedDept(department);
    setLoadingStudents(true);
    try {
      const response = await paymentAPI.getDepartmentStudents(department);
      if (response?.data?.data?.students) {
        setDepartmentStudents(response.data.data.students);
      } else {
        setDepartmentStudents([]);
        toast.error('No students found for this department');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setDepartmentStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleNotifyStudent = async (studentId) => {
    try {
      const message = 'We are From vignan University, Your Fee due is pending. Please clear your payments.';
      const response = await paymentAPI.notifyStudent(studentId, { message });
      if (response.data.success) {
        toast.success(`Notification sent to student`);
      }
    } catch (error) {
      console.error('Error notifying student:', error);
      toast.error('Failed to send notification');
    }
  };

  if (loading) return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <h2>Admin Dashboard</h2>
        <p>Loading...</p>
      </div>
    </div>
  );

  // Notify all pending students in selected department
const handleNotifyAllStudents = async () => {
  if (!selectedDept || departmentStudents.length === 0) {
    toast.error('No students to notify in this department');
    return;
  }

  const pendingStudents = departmentStudents.filter(student => !student.hasPaidTuition);

  if (pendingStudents.length === 0) {
    toast.info('All students have paid tuition in this department');
    return;
  }

  for (const student of pendingStudents) {
    try {
      const message = 'We are From Vignan University, Your Fee due is pending. Please clear your payments.';
      await paymentAPI.notifyStudent(student._id, { message });
      toast.success(`Notification sent to ${student.name}`);
    } catch (error) {
      console.error(`Failed to send notification to ${student.name}`, error);
      toast.error(`Failed to send notification to ${student.name}`);
    }
  }
};


  return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <h2>Admin Dashboard</h2>
        <p>Manage student fees and monitor payments</p>
      </div>

      <div className="instructions">
        <h3>Instructions</h3>
        <ul>
          <li>Monitor student fee payments</li>
          <li>Send notifications for pending fees</li>
          <li>View department-wise statistics</li>
          <li>Generate reports</li>
        </ul>
      </div>

      <div className="stats-section">
        <div 
          className="total-students-card"
          onClick={() => setShowTotal(!showTotal)}
        >
          <h3>Total Students Registered</h3>
          <div className="total-count">{totalStudents}</div>
        </div>

        {showTotal && (
          <div className="department-stats">
            <h3>Department-wise Distribution</h3>
            <div className="department-cards">
              {stats.length > 0 ? stats.map(dept => (
                <div 
                  key={dept._id}
                  className="department-card"
                  onClick={() => handleDepartmentClick(dept._id)}
                >
                  <h4>{dept._id || 'Unknown Department'}</h4>
                  <div className="student-count">{dept.totalStudents || 0}</div>
                  <div className="paid-count">Paid Tuition: {dept.paidTuition || 0}</div>
                </div>
              )) : <p>No department data available</p>}
            </div>
          </div>
        )}
      </div>

      {selectedDept && (
        <div className="department-details">
          <h3>Students in {selectedDept}</h3>
          <button 
            className="notify-all-btn"
            onClick={handleNotifyAllStudents}
            style={{ 
              marginBottom: '10px', 
              padding: '8px 12px', 
              backgroundColor: '#4CAF50', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          > 
          Notify All Pending Students
          </button>
          {loadingStudents ? <p>Loading students...</p> : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Tuition Paid</th>
                  <th>Bus Paid</th>
                  <th>Hostel Paid</th>
                  <th>Notify</th>
                </tr>
              </thead>
              <tbody>
                {departmentStudents.length > 0 ? departmentStudents.map(student => (
                  <tr key={student._id}>
                    <td>{student.regNo}</td>
                    <td>{student.name}</td>
                    <td>{student.hasPaidTuition ? '✅' : '❌'}</td>
                    <td>{student.hasPaidBus ? '✅' : '❌'}</td>
                    <td>{student.hasPaidHostel ? '✅' : '❌'}</td>
                    <td>
                      {!student.hasPaidTuition && (
                        <button 
                          className="notify-btn"
                          onClick={() => handleNotifyStudent(student._id)}
                        >
                          Notify
                        </button>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan="6">No students found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
