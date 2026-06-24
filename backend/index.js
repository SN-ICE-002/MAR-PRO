require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const ecosystemsRouter = require('./routes/ecosystems');
const speciesRouter    = require('./routes/species');
const eventsRouter     = require('./routes/events');
const alertsRouter     = require('./routes/alerts');
const sightingsRouter  = require('./routes/sightings');

// ── GFW cron (only starts when API key is present) ──
if (process.env.GFW_API_KEY) {
  require('./cron/pollGFW');
  console.log('🌐 GFW polling cron activated');
} else {
  console.log('ℹ️  GFW_API_KEY not set — running in seed-data mode');
}

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Request logger ──────────────────────────────────
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ──────────────────────────────────────────
app.use('/api/ecosystems', ecosystemsRouter);
app.use('/api/species',    speciesRouter);
app.use('/api/events',     eventsRouter);
app.use('/api/alerts',     alertsRouter);
app.use('/api/sightings',  sightingsRouter);

// ── Health check ────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🌊 Ocean Guardian API running on http://localhost:${PORT}\n`);
});
