/**
 * GFW Polling Cron Job
 * Runs hourly — only loaded when GFW_API_KEY is present (see index.js)
 */

const cron          = require('node-cron');
const { syncGFWData } = require('../services/gfw');

// Run at the top of every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ GFW cron triggered at', new Date().toISOString());
  await syncGFWData();
});

// Also run once immediately on startup
syncGFWData().catch((err) => {
  console.error('Initial GFW sync error:', err.message);
});

console.log('🕐 GFW cron scheduled — runs every hour');
