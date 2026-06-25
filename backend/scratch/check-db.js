require('dotenv').config();
const pool = require('../db');

async function checkDB() {
  console.log('Checking Database for GFW Data...');
  try {
    const { rows } = await pool.query("SELECT source, COUNT(*) as count FROM fishing_events GROUP BY source");
    console.log('Fishing Events by Source:');
    if (rows.length === 0) {
      console.log('No fishing events found in the database.');
    } else {
      rows.forEach(row => {
        console.log(`- ${row.source}: ${row.count}`);
      });
    }
  } catch (err) {
    console.error('❌ Database Check Failed:', err.message);
  } finally {
    await pool.end();
  }
}

checkDB();
