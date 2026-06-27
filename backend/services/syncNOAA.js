const pool = require('../db');
const { fetchBleachingData } = require('./noaa');

/**
 * Sync NOAA climate data with our ecosystems
 */
const syncNOAAData = async (countryCode = 'VU') => {
  try {
    const data = await fetchBleachingData(countryCode);
    if (!data) return;

    // Map NOAA Alert Level to our 0-100 Health Score
    // 0: No Stress (100) -> 4: Severe Bleaching (10)
    const newHealthScore = Math.max(10, 100 - (data.alert_level * 22));

    console.log(`🌀 Updating ${countryCode} ecosystems with Health Score: ${newHealthScore}`);

    // 1. Update all ecosystems in that country (this assumes ecosystems is linked to countries)
    // If not linked yet, we'll update all for now or filter by 'coral_reef'
    const updateRes = await pool.query(
      `UPDATE ecosystems 
       SET health_score = $1 
       WHERE zone_type = 'coral_reef'
       RETURNING id, name`,
      [newHealthScore]
    );

    // 2. Create an Alert if stress is high (Alert Level >= 2)
    if (data.alert_level >= 1) {
      for (const ecosystem of updateRes.rows) {
        await pool.query(
          `INSERT INTO alerts (alert_type, severity, description, ecosystem_id, detected_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT DO NOTHING`, // Note: You might want to prevent duplicate recent alerts
          [
            'bleaching',
            data.alert_level >= 3 ? 'critical' : 'high',
            `NOAA Coral Reef Watch detected Level ${data.alert_level} stress. SST is ${data.sst}°C.`,
            ecosystem.id
          ]
        );
      }
    }

    // 3. Log the health change globally or in health_log
    for (const eco of updateRes.rows) {
      await pool.query(
        'INSERT INTO health_log (ecosystem_id, health_score, recorded_at) VALUES ($1, $2, NOW())',
        [eco.id, newHealthScore]
      );
    }

    console.log(`✨ NOAA Sync Complete for ${countryCode}. Updated ${updateRes.rowCount} reefs.`);
  } catch (error) {
    console.error('❌ NOAA Sync Error:', error.message);
  }
};

module.exports = { syncNOAAData };
