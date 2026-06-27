require('dotenv').config();
const pool = require('./db');
const fs = require('fs');
const path = require('path');

const runMigration = async (filename) => {
  try {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🚀 Running migration: ${filename}...`);
    await pool.query(sql);
    console.log(`✅ ${filename} applied successfully!`);
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message);
  }
};

const start = async () => {
  await runMigration('03_gbif_integration.sql');
  await runMigration('04_mpa_boundaries.sql');
  await runMigration('05_risk_projections.sql');
  process.exit();
};

start();
