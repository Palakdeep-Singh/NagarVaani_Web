/**
 * emApi.js — EM Dashboard API helpers
 * Calls the backend /api/admin/em-* endpoints (no JWT needed)
 */
const BASE = 'http://localhost:5000/api/admin';

const get = async (path, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
};

export const emApi = {
  /** KPI stats — pass { state?, district? } */
  getStats: (params = {}) => get('/em-stats', params),

  /** Complaints list + breakdowns — pass { state?, district?, limit? } */
  getComplaints: (params = {}) => get('/em-complaints', params),

  /** Scheme stats + enrollment counts */
  getSchemes: (params = {}) => get('/em-schemes', params),

  /** User distribution by district — pass { state?, district? } */
  getUsersDist: (params = {}) => get('/em-users-dist', params),

  /** Monthly benefit disbursement trend */
  getBenefitTrend: (params = {}) => get('/em-benefit-trend', params),
};

/** Format numbers nicely */
export const fmt = (n, prefix = '') => {
  if (n == null) return '—';
  if (n >= 1e7) return prefix + (n / 1e7).toFixed(1) + ' Cr';
  if (n >= 1e5) return prefix + (n / 1e5).toFixed(1) + 'L';
  if (n >= 1e3) return prefix + (n / 1e3).toFixed(1) + 'K';
  return prefix + Number(n).toLocaleString('en-IN');
};

export const fmtMoney = (n) => fmt(n, '₹');

/** Status color helper */
export const statusColor = (status) => {
  const map = {
    open: '#ef4444', pending: '#f59e0b', resolved: '#22c55e',
    closed: '#6b7280', in_progress: '#3b82f6', active: '#22c55e',
    applied: '#f59e0b', completed: '#22c55e',
  };
  return map[status?.toLowerCase?.()] || '#64748b';
};

/** Priority color helper */
export const priorityColor = (priority) => {
  const map = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', critical: '#7c3aed' };
  return map[priority?.toLowerCase?.()] || '#64748b';
};
