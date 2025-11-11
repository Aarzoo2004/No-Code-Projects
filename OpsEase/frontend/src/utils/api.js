import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors (401/403)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default API;