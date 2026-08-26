import axios from 'axios';
import { runClientSideScan } from './clientScanner';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')
    ? 'https://green-web-backend.onrender.com/api'
    : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 50000, // 50s timeout to allow full Puppeteer scan on Render
});

export const scanApi = {
  // Scan a new URL: try backend Puppeteer first
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
      console.warn('⚠️ Server scan timed out or unreachable, using client engine:', err.message);
    }

    // In-browser engine fallback if backend is sleeping
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

  // Get scan history
  getHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/scans', { params });
      if (response.data && response.data.data) {
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : (response.data.data?.scans || []);
        return {
          success: true,
          data: list
        };
      }
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
    const matched = history.filter((s) => ids.includes(s.id));
    const winnerCarbon = [...matched].sort((a, b) => (a.carbon_grams || 0) - (b.carbon_grams || 0))[0];
    const winnerSpeed = [...matched].sort((a, b) => (a.load_time_ms || 0) - (b.load_time_ms || 0))[0];
    const winnerSize = [...matched].sort((a, b) => (a.page_size_bytes || 0) - (b.page_size_bytes || 0))[0];

    return {
      success: true,
      data: {
        scans: matched,
        highlights: {
          cleanest: winnerCarbon ? { id: winnerCarbon.id, domain: winnerCarbon.domain, carbon_grams: winnerCarbon.carbon_grams } : null,
          fastest: winnerSpeed ? { id: winnerSpeed.id, domain: winnerSpeed.domain, load_time_ms: winnerSpeed.load_time_ms } : null,
          lightest: winnerSize ? { id: winnerSize.id, domain: winnerSize.domain, page_size_bytes: winnerSize.page_size_bytes } : null,
        },
      },
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
