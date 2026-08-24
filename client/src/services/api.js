import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes to comfortably accommodate Render free tier cold-starts
});

export const scanApi = {
  // Scan a new URL
  scanUrl: async (url, device = 'desktop', monthlyViews = 10000) => {
    const response = await apiClient.post('/scan', { url, device, monthlyViews });
    return response.data;
  },

  // Get specific scan by ID
  getScanById: async (id) => {
    const response = await apiClient.get(`/scans/${id}`);
    return response.data;
  },

  // Get scan history with filters
  getHistory: async (params = {}) => {
    const response = await apiClient.get('/scans', { params });
    return response.data;
  },

  // Delete scan by ID
  deleteScan: async (id) => {
    const response = await apiClient.delete(`/scans/${id}`);
    return response.data;
  },

  // Compare multiple scan IDs
  compareScans: async (ids) => {
    const response = await apiClient.post('/compare', { ids });
    return response.data;
  },

  // Overall analytics stats
  getStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },
};

export default apiClient;
