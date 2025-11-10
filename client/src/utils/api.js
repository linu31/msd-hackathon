import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  updateProfile: (userData) => API.put('/auth/profile', userData),
  getProfile: () => API.get('/auth/me'),
};

export const paymentAPI = {
  createOrder: (orderData) => API.post('/payments/create-order', orderData),
  verifyPayment: (paymentData) => API.post('/payments/verify', paymentData),
  getStudentPayments: () => API.get('/payments/student-payments'),
  getAllPayments: () => API.get('/payments/all-payments'),
  getDepartmentStats: () => API.get('/payments/department-stats'),
  getDepartmentStudents: (department) => API.get(`/payments/department/${department}/students`),
  notifyStudent: (studentId, messageData) => API.post(`/payments/notify/${studentId}`, messageData),
  sendNotification: (studentId, body) => API.post(`/payments/notify/${studentId}`, body)
};


export default API;