// frontend/src/services/api.js
import axios from 'axios';

// Base URL for API - change this if deploying
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔵 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🔴 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`🟢 API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('🔴 API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * API Service Object with all endpoints
 */
const api = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Generate schema from natural language prompt
  generateSchema: async (prompt, title = '') => {
    const response = await apiClient.post('/api/generate', { prompt, title });
    return response.data;
  },

  // Get all schemas
  getAllSchemas: async () => {
    const response = await apiClient.get('/api/schemas');
    return response.data;
  },

  // Get specific schema by ID
  getSchemaById: async (id) => {
    const response = await apiClient.get(`/api/schema/${id}`);
    return response.data;
  },

  // Submit form data
  submitForm: async (schemaId, formData) => {
    const response = await apiClient.post(`/api/submit/${schemaId}`, formData);
    return response.data;
  },

  // Get submissions for a schema
  getSubmissions: async (schemaId) => {
    const response = await apiClient.get(`/api/submissions/${schemaId}`);
    return response.data;
  },
};

export default api;