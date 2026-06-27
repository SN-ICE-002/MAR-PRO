const cron = require('node-cron');
const pool = require('../db');
const { syncNOAAData } = require('../services/syncNOAA');

/**
 * Daily sync of ocean health data from NOAA
 */
const startNOAACron = () => {
  // Run every day at 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('🕒 [Cron] Starting daily NOAA Ocean Health sync...');
    
    try {
      const countriesRes = await pool.query('SELECT code FROM countries');
      for (const country of countriesRes.rows) {
        await syncNOAAData(country.code);
      }
      console.log('✅ [Cron] NOAA Ocean Health sync completed.');
    } catch (error) {
      console.error('❌ [Cron] NOAA Sync Error:', error.message);
    }
  });

  console.log('📅 NOAA tracking cron scheduled (Daily)');
};

// Run once on startup
setTimeout(async () => {
    console.log('🚀 Initializing NOAA climate data...');
    const countriesRes = await pool.query('SELECT code FROM countries');
    for (const country of countriesRes.rows) {
        await syncNOAAData(country.code);
    }
}, 10000); // Wait 10s after startup

module.exports = { startNOAACron };
