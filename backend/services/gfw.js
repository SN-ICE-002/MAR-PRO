/**
 * GFW (Global Fishing Watch) API Service
 * Fetches vessel fishing events from the GFW API v3.
 * Only called if GFW_API_KEY is set in .env
 *
 * Docs: https://globalfishingwatch.org/our-apis/documentation
 */

const axios = require('axios');
const pool  = require('../db');

const GFW_BASE  = 'https://gateway.api.globalfishingwatch.org/v3';
const API_KEY   = process.env.GFW_API_KEY;

// Bounding box for Vanuatu waters
const VANUATU_BBOX = {
  minLat: -22,
  maxLat: -12,
  minLng:  165,
  maxLng:  171,
};

/**
 * Fetch recent fishing events from GFW API for Vanuatu waters.
 * @param {string} dateFrom  ISO date string  e.g. '2025-01-01'
 * @param {string} dateTo    ISO date string
 */
async function fetchGFWEvents(dateFrom, dateTo) {
  if (!API_KEY) throw new Error('GFW_API_KEY is not set');

  const response = await axios.post(
    `${GFW_BASE}/events`,
    {
      datasets: ['public-global-fishing-events:latest'],
      startDate: dateFrom,
      endDate: dateTo,
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [VANUATU_BBOX.minLng, VANUATU_BBOX.minLat],
          [VANUATU_BBOX.maxLng, VANUATU_BBOX.minLat],
          [VANUATU_BBOX.maxLng, VANUATU_BBOX.maxLat],
          [VANUATU_BBOX.minLng, VANUATU_BBOX.maxLat],
          [VANUATU_BBOX.minLng, VANUATU_BBOX.minLat],
        ]],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.entries || [];
}

/**
 * Determine if a lat/lng point is inside any protected ecosystem polygon.
 * Simple bounding-box check — accurate enough for these zone sizes.
 */
async function findEcosystemForPoint(lat, lng) {
  const { rows } = await pool.query(
    `SELECT id, name, geojson FROM ecosystems`
  );

  for (const eco of rows) {
    const geo = eco.geojson;
    if (!geo?.geometry?.coordinates) continue;
    const ring = geo.geometry.coordinates[0];
    if (!ring) continue;

    const lngs = ring.map((c) => c[0]);
    const lats  = ring.map((c) => c[1]);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat  = Math.min(...lats),  maxLat  = Math.max(...lats);

    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      return eco.id;
    }
  }
  return null;
}

/**
 * Pull latest GFW data and upsert into fishing_events table.
 */
async function syncGFWData() {
  if (!API_KEY) {
    console.warn('syncGFWData called without GFW_API_KEY — skipping');
    return;
  }

  const dateTo   = new Date().toISOString().split('T')[0];
  const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log(`🌐 GFW sync: fetching events ${dateFrom} → ${dateTo}`);

  try {
    const events = await fetchGFWEvents(dateFrom, dateTo);
    console.log(`   Found ${events.length} GFW events`);

    let inserted = 0;
    for (const ev of events) {
      const lat = ev.position?.lat;
      const lng = ev.position?.lon;
      if (!lat || !lng) continue;

      const ecoId = await findEcosystemForPoint(lat, lng);
      const insideZone = ecoId !== null;

      await pool.query(
        `INSERT INTO fishing_events
           (vessel_id, lat, lng, fishing_hours, event_date, inside_zone, ecosystem_id, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'gfw_api')
         ON CONFLICT DO NOTHING`,
        [
          ev.vessel?.id || 'UNKNOWN',
          lat,
          lng,
          ev.fishing?.totalDistanceKm || 0,
          ev.start?.split('T')[0] || dateTo,
          insideZone,
          ecoId,
        ]
      );
      inserted++;
    }
    console.log(`   ✓ ${inserted} GFW events upserted`);
  } catch (err) {
    console.error('❌ GFW sync failed:', err.message);
  }
}

module.exports = { syncGFWData, fetchGFWEvents };
