/**
 * GFW (Global Fishing Watch) API Service
 * Fetches vessel fishing events from the GFW API v3 for multiple Pacific countries.
 * Only called if GFW_API_KEY is set in .env
 *
 * Docs: https://globalfishingwatch.org/our-apis/documentation
 */

const axios = require('axios');
const pool  = require('../db');

const GFW_BASE  = 'https://gateway.api.globalfishingwatch.org/v3';
const API_KEY   = process.env.GFW_API_KEY;

/**
 * Fetch recent fishing events from GFW API for a specific bounding box.
 * @param {string} dateFrom  ISO date string
 * @param {string} dateTo    ISO date string
 * @param {object} bbox      { minLat, maxLat, minLng, maxLng }
 */
async function fetchGFWEvents(dateFrom, dateTo, bbox) {
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
          [bbox.minLng, bbox.minLat],
          [bbox.maxLng, bbox.minLat],
          [bbox.maxLng, bbox.maxLat],
          [bbox.minLng, bbox.maxLat],
          [bbox.minLng, bbox.minLat],
        ]],
      },
    },
    {
      params: { limit: 99, offset: 0 },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.entries || [];
}

/**
 * Determine if a lat/lng point is inside any protected ecosystem polygon for a country.
 */
function findEcosystemForPoint(lat, lng, ecosystems) {
  if (!ecosystems || !Array.isArray(ecosystems)) return null;

  for (const eco of ecosystems) {
    const geo = eco.geojson;
    if (!geo?.geometry?.coordinates) continue;
    
    // Support both Feature and Geometry structures
    const coords = geo.geometry.coordinates;
    const ring = coords[0];
    if (!ring || !Array.isArray(ring)) continue;

    const lngs = ring.map((c) => c[0]);
    const lats = ring.map((c) => c[1]);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);

    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      return eco.id;
    }
  }
  return null;
}

/**
 * Pull latest GFW data for ALL countries registered in the database.
 */
async function syncGFWData() {
  if (!API_KEY) {
    console.warn('syncGFWData called without GFW_API_KEY — skipping');
    return;
  }

  try {
    const { rows: countries } = await pool.query('SELECT * FROM countries');
    console.log(`🌐 GFW sync: Processing ${countries.length} Pacific countries`);

    const dateTo   = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const country of countries) {
      console.log(`   → Syncing ${country.name} (${country.code})`);
      
      try {
        const events = await fetchGFWEvents(dateFrom, dateTo, country.bbox);
        console.log(`     Found ${events.length} GFW events for ${country.name}`);

        const { rows: ecosystems } = await pool.query(
          'SELECT id, geojson FROM ecosystems WHERE country_id = $1', 
          [country.id]
        );

        let inserted = 0;
        for (const ev of events) {
          const lat = ev.position?.lat;
          const lng = ev.position?.lon; 
          const externalId = ev.id;

          if (!lat || !lng || !externalId) continue;

          const ecoId = findEcosystemForPoint(lat, lng, ecosystems);
          const insideZone = ecoId !== null;

          await pool.query(
            `INSERT INTO fishing_events
               (vessel_id, lat, lng, fishing_hours, event_date, inside_zone, ecosystem_id, source, external_id, country_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'gfw_api', $8, $9)
             ON CONFLICT (external_id) DO NOTHING`,
            [
              ev.vessel?.id || 'UNKNOWN',
              lat,
              lng,
              ev.fishing?.totalDistanceKm || 0,
              ev.start?.split('T')[0] || dateTo,
              insideZone,
              ecoId,
              externalId,
              country.id
            ]
          );
          inserted++;
        }
        console.log(`     ✓ ${inserted} GFW events processed for ${country.name}`);
      } catch (countryErr) {
        const detail = countryErr.response?.data ? JSON.stringify(countryErr.response.data) : countryErr.message;
        console.error(`   ❌ Failed for ${country.name}:`, detail);
      }
    }
  } catch (err) {
    console.error('❌ Global GFW sync error:', err.message);
  }
}

module.exports = { syncGFWData, fetchGFWEvents };
