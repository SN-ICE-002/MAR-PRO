import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

// ── Countries ────────────────────────────────────────────────────────────────
export const getCountries   = ()   => api.get('/api/countries').then(r => r.data);

// ── Ecosystems ──────────────────────────────────────────────────────────────
export const getEcosystems  = (countryId) => api.get('/api/ecosystems', { params: { countryId } }).then(r => r.data);
export const getEcosystem   = (id)        => api.get(`/api/ecosystems/${id}`).then(r => r.data);

// ── Species ─────────────────────────────────────────────────────────────────
export const getSpecies     = ()   => api.get('/api/species').then(r => r.data);

// ── Fishing Events ───────────────────────────────────────────────────────────
export const getRecentEvents = (countryId) => api.get('/api/events/recent', { params: { countryId } }).then(r => r.data);
export const getEventSummary = (countryId) => api.get('/api/events/summary', { params: { countryId } }).then(r => r.data);

// ── Alerts ───────────────────────────────────────────────────────────────────
export const getAlerts      = (countryId) => api.get('/api/alerts', { params: { countryId } }).then(r => r.data);
export const resolveAlert   = (id)        => api.patch(`/api/alerts/${id}/resolve`).then(r => r.data);

// ── Sightings ────────────────────────────────────────────────────────────────
export const getSightings   = (countryId) => api.get('/api/sightings', { params: { countryId } }).then(r => r.data);
export const postSighting   = (data)      => api.post('/api/sightings', data).then(r => r.data);

// ── Projections ─────────────────────────────────────────────────────────────
export const getProjections = ()          => api.get('/api/projections').then(r => r.data);
export const getHistory     = (ecoId)     => api.get(`/api/projections/${ecoId}`).then(r => r.data);

export default api;
