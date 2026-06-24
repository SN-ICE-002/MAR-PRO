import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

// ── Ecosystems ──────────────────────────────────────────────────────────────
export const getEcosystems  = ()   => api.get('/api/ecosystems').then(r => r.data);
export const getEcosystem   = (id) => api.get(`/api/ecosystems/${id}`).then(r => r.data);

// ── Species ─────────────────────────────────────────────────────────────────
export const getSpecies     = ()   => api.get('/api/species').then(r => r.data);
export const getSpeciesById = (id) => api.get(`/api/species/${id}`).then(r => r.data);

// ── Fishing Events ───────────────────────────────────────────────────────────
export const getRecentEvents = () => api.get('/api/events/recent').then(r => r.data);
export const getEventSummary = () => api.get('/api/events/summary').then(r => r.data);

// ── Alerts ───────────────────────────────────────────────────────────────────
export const getAlerts      = ()   => api.get('/api/alerts').then(r => r.data);
export const resolveAlert   = (id) => api.patch(`/api/alerts/${id}/resolve`).then(r => r.data);

// ── Sightings ────────────────────────────────────────────────────────────────
export const getSightings   = ()     => api.get('/api/sightings').then(r => r.data);
export const postSighting   = (data) => api.post('/api/sightings', data).then(r => r.data);

export default api;
