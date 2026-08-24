import axios from 'axios';
import { runClientSideScan } from './clientScanner';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')
    ? 'https://green-web.onrender.com/api'
    : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const scanApi = {
  // Scan a new URL with automatic in-browser engine fallback
  scanUrl: async (url, device = 'desktop', monthlyViews = 10000) => {
    try {
      const response = await apiClient.post('/scan', { url, device, monthlyViews });
      if (response.data && response.data.data) {
        try {
          const id = response.data.data.id;
          localStorage.setItem('greenweb_scan_' + id, JSON.stringify(response.data.data));
          const history = JSON.parse(localStorage.getItem('greenweb_scans') || '[]');
          history.unshift(response.data.data);
          localStorage.setItem('greenweb_scans', JSON.stringify(history.slice(0, 50)));
        } catch (e) {}
        return response.data;
      }
    } catch (err) {
      console.warn('⚡ Using Client-Side Autonomous Scanner:', err.message);
    }

    const clientData = await runClientSideScan(url, device);
    return {
      success: true,
      data: clientData
    };
  },

  // Get specific scan by ID
  getScanById: async (id) => {
    try {
      const response = await apiClient.get(`/scans/${id}`);
      if (response.data && response.data.data) return response.data;
    } catch (err) {}

    // Check localStorage cache
    const cached = localStorage.getItem('greenweb_scan_' + id);
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }

    const history = JSON.parse(localStorage.getItem('greenweb_scans') || '[]');
    const found = history.find(s => s.id === id);
    if (found) {
      return { success: true, data: found };
    }

    throw new Error('Scan record not found.');
  },

  // Get scan history (returns array of scans in res.data)
  getHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/scans', { params });
      if (response.data && response.data.data) return response.data;
    } catch (err) {}

    const history = JSON.parse(localStorage.getItem('greenweb_scans') || '[]');
    return {
      success: true,
      data: history,
      pagination: {
        total: history.length,
        page: 1,
        limit: 50,
        totalPages: 1
      }
    };
  },

  // Delete scan by ID
  deleteScan: async (id) => {
    try {
      await apiClient.delete(`/scans/${id}`);
    } catch (e) {}

    const history = JSON.parse(localStorage.getItem('greenweb_scans') || '[]');
    const filtered = history.filter(s => s.id !== id);
    localStorage.setItem('greenweb_scans', JSON.stringify(filtered));
    localStorage.removeItem('greenweb_scan_' + id);
    return { success: true };
  },

  // Compare multiple scan IDs
  compareScans: async (ids) => {
    try {
      const response = await apiClient.post('/compare', { ids });
      if (response.data && response.data.data) return response.data;
    } catch (e) {}

    const history = JSON.parse(localStorage.getItem('greenweb_scans') || '[]');
    const items = history.filter(s => ids.includes(s.id));
    const winner = items.length > 0
      ? [...items].sort((a, b) => (a.carbon_grams || 0) - (b.carbon_grams || 0))[0]
      : null;

    return {
      success: true,
      data: {
        items,
        winner,
        comparison: {
          totalCompared: items.length,
          cleanest: winner ? winner.domain : null,
          carbonDifference: items.length >= 2 ? Math.abs((items[0].carbon_grams || 0) - (items[1].carbon_grams || 0)).toFixed(3) : '0.000'
        }
      }
    };
  },

  // Overall analytics stats
  getStats: async () => {
    try {
      const response = await apiClient.get('/stats');
      if (response.data && response.data.data) return response.data;
    } catch (e) {}

    const history = JSON.parse(localStorage.getItem('greenweb_scans') || '[]');
    const totalScans = history.length;
    const avgCarbon = totalScans > 0
      ? (history.reduce((acc, s) => acc + (s.carbon_grams || 0), 0) / totalScans).toFixed(3)
      : '0.240';
    const greenHostCount = history.filter(s => s.is_green_host).length;

    return {
      success: true,
      data: {
        total_scans: totalScans,
        avg_carbon_grams: Number(avgCarbon),
        green_hosts_pct: totalScans > 0 ? Math.round((greenHostCount / totalScans) * 100) : 45,
        recent_scans: history.slice(0, 5)
      }
    };
  },
};

export default apiClient;
