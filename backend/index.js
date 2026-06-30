require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const ecosystemsRouter = require('./routes/ecosystems');
const speciesRouter    = require('./routes/species');
const eventsRouter     = require('./routes/events');
const alertsRouter     = require('./routes/alerts');
const sightingsRouter  = require('./routes/sightings');
const countriesRouter  = require('./routes/countries');
const projectionsRouter = require('./routes/projections');

// ── GFW cron (only starts when API key is present) ──
if (process.env.GFW_API_KEY) {
  require('./cron/pollGFW');
  console.log('🌐 GFW polling cron activated');
}
// ── GBIF cron (Biodiversity data) ──
const { startGBIFCron } = require('./cron/pollGBIF');
startGBIFCron();
// ── NOAA cron (Ocean climate) ──
const { startNOAACron } = require('./cron/pollNOAA');
startNOAACron();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Debug Exception Logging ─────────────────────────
process.on('uncaughtException', (err) => {
  console.error('\n🔥 CRITICAL: Uncaught Exception!');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  // Optional: don't exit immediately so we can read the log
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n🌋 CRITICAL: Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

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
app.use('/api/countries',  countriesRouter);
app.use('/api/projections', projectionsRouter);

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

const autoSetup = require('./autoSetup');

async function startServer() {
  // ── Database Auto-Setup ──
  // Ensures schema, migrations, and seed data are applied automatically
  await autoSetup();

  app.listen(PORT, () => {
    console.log(`\n🌊 Ocean Guardian API running on http://localhost:${PORT}\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

