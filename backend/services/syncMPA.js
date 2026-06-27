const pool = require('../db');
const { fetchMPAs } = require('./protectedPlanet');

// Simple mapping for demonstration - can be expanded or moved to DB
const iso2to3 = {
  'VU': 'VUT',
  'FJ': 'FJI',
  'SB': 'SLB',
  // add more as needed
};

/**
 * Sync official Marine Protected Area boundaries
 */
const syncMPAData = async (countryCode = 'VU') => {
  try {
    const iso3 = iso2to3[countryCode];
    if (!iso3) return;

    const mpas = await fetchMPAs(iso3);
    console.log(`🛡️ Found ${mpas.length} Protected Areas for ${countryCode}. Syncing...`);

    // Get country_id
    const countryRes = await pool.query('SELECT id FROM countries WHERE code = $1', [countryCode]);
    const countryId = countryRes.rows.length > 0 ? countryRes.rows[0].id : null;

    for (const pa of mpas) {
      await pool.query(
        `INSERT INTO ecosystems (name, zone_type, geojson, is_mpa, wdpa_id, country_id, health_score)
         VALUES ($1, $2, $3, $4, $5, $6, 100)
         ON CONFLICT (wdpa_id) DO UPDATE 
         SET geojson = EXCLUDED.geojson, name = EXCLUDED.name`,
        [
          pa.name,
          'mpa',
          pa.geojson,
          true,
          pa.wdpa_id,
          countryId
        ]
      );
    }

    console.log(`✨ MPA Sync Complete for ${countryCode}.`);
  } catch (error) {
    console.error('❌ MPA Sync Error:', error.message);
  }
};

module.exports = { syncMPAData };
