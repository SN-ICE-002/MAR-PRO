const pool = require('../db');
const { fetchMarineSightings } = require('./gbif');

// ISO 3-letter → 2-letter map (GBIF needs 2-letter codes)
const iso3to2 = {
  'VUT': 'VU', 'FJI': 'FJ', 'SLB': 'SB', 'WSM': 'WS', 'TON': 'TO',
  'KIR': 'KI', 'MHL': 'MH', 'NRU': 'NR', 'PLW': 'PW', 'PNG': 'PG',
  'TUV': 'TV', 'FSM': 'FM', 'COK': 'CK', 'NIU': 'NU', 'NCL': 'NC',
  'PYF': 'PF', 'ASM': 'AS', 'GUM': 'GU',
};

/**
 * Sync service to move GBIF data into our database
 */
const syncGBIFData = async (countryCode3) => {
  try {
    if (!countryCode3) throw new Error('countryCode is required');
    
    // Convert 3-letter to 2-letter for GBIF API
    const countryCode2 = iso3to2[countryCode3] || countryCode3;
    
    const sightings = await fetchMarineSightings(countryCode2, 80);
    console.log(`✅ Fetched ${sightings.length} sightings from GBIF for ${countryCode3} (${countryCode2}).`);

    // Get country_id using 3-letter code (matches our DB)
    const countryRes = await pool.query('SELECT id FROM countries WHERE code = $1', [countryCode3]);
    const countryId = countryRes.rows.length > 0 ? countryRes.rows[0].id : null;

    if (!countryId) {
      console.warn(`⚠️ Country ${countryCode3} not found in DB, skipping.`);
      return 0;
    }

    let newRecords = 0;

    for (const s of sightings) {
      // 1. Try to find a matching species in our species table
      const speciesRes = await pool.query(
        'SELECT id FROM species WHERE scientific_name ILIKE $1 OR common_name ILIKE $2 LIMIT 1',
        [s.scientific_name, s.common_name]
      );

      const speciesId = speciesRes.rows.length > 0 ? speciesRes.rows[0].id : null;

      // 2. Perform Upsert into sightings
      const result = await pool.query(
        `INSERT INTO sightings 
         (species_id, lat, lng, reported_by, description, source, external_id, species_name_raw, sighted_at, country_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (external_id) DO NOTHING`,
        [
          speciesId,
          s.lat,
          s.lng,
          'GBIF Registry',
          s.description,
          'GBIF',
          String(s.external_id),
          s.scientific_name,
          s.sighted_at,
          countryId
        ]
      );

      if (result.rowCount > 0) newRecords++;
    }

    console.log(`✨ Sync Complete: Added ${newRecords} new sightings from GBIF for ${countryCode3}.`);
    return newRecords;
  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    throw error;
  }
};

module.exports = { syncGBIFData };
