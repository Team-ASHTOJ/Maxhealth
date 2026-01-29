import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// API Functions
export const api = {
  // Site data
  getSites: () => apiClient.get('/api/sites'),
  getSiteData: (siteId, horizon = 24) => 
    apiClient.get(`/api/data/site/${siteId}`, { params: { horizon } }),
  
  // Metrics
  getSiteMetrics: (siteId, pollutant = 'O3') =>
    apiClient.get(`/api/metrics/site/${siteId}`, { params: { pollutant } }),
  getAllMetrics: () => apiClient.get('/api/metrics/all'),
  
  // AQI
  getCurrentAQI: (lat, lon) =>
    apiClient.get('/api/aqi/current', { params: { lat, lon } }),
  
  // Health recommendations
  getHealthRecommendations: (aqi, profile) =>
    apiClient.post('/api/health-recommendations', { aqi, profile }),
  
  // Feedback
  submitFeedback: (feedback) =>
    apiClient.post('/api/feedback', feedback),
  getFeedback: (site = null, limit = 50) =>
    apiClient.get('/api/feedback', { params: { site, limit } }),
  
  // Download
  downloadForecast: (siteId, pollutant, horizon) =>
    apiClient.get(`/api/download/forecast/${siteId}`, {
      params: { pollutant, horizon },
      responseType: 'blob',
    }),
};

export default apiClient;