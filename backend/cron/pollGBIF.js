const cron = require('node-cron');
const pool = require('../db');
const { syncGBIFData } = require('../services/syncGBIF');

/**
 * Weekly sync of biodiversity data from GBIF
 */
const startGBIFCron = () => {
  // Run every Sunday at midnight
  cron.schedule('0 0 * * 0', async () => {
    console.log('🕒 [Cron] Starting weekly GBIF Biodiversity sync...');
    
    try {
      // Get all countries we are tracking
      const countriesRes = await pool.query('SELECT code FROM countries');
      const countries = countriesRes.rows;

      for (const country of countries) {
        await syncGBIFData(country.code);
      }
      
      console.log('✅ [Cron] GBIF Biodiversity sync completed.');
    } catch (error) {
      console.error('❌ [Cron] GBIF Sync Error:', error.message);
    }
  });

  console.log('📅 GBIF tracking cron scheduled (Weekly)');
};

// Also run immediately once on startup if the database is fresh
setTimeout(async () => {
    const checkRes = await pool.query('SELECT COUNT(*) FROM sightings WHERE source = $1', ['GBIF']);
    if (parseInt(checkRes.rows[0].count) === 0) {
        console.log('🆕 First-time setup: Fetching initial GBIF data...');
        const countriesRes = await pool.query('SELECT code FROM countries');
        for (const country of countriesRes.rows) {
            await syncGBIFData(country.code);
        }
    }
}, 5000);

module.exports = { startGBIFCron };
