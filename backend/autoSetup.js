const fs = require('fs');
const path = require('path');
const pool = require('./db');
const seed = require('./seed');
const seedMPAs = require('./seed_conservation_areas');

/**
 * Automatically sets up the database if it's empty or missing tables.
 * This runs on every server start.
 */
async function autoSetup() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking database state...');

    // 1. Check if core tables exist
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ecosystems'
      );
    `);

    const schemaExists = tableCheck.rows[0].exists;

    if (!schemaExists) {
      console.log('📁 Database schema not found. Initializing from full_setup.sql...');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'full_setup.sql'), 'utf8');
      
      // Remove psql-specific commands like \echo
      const cleanSql = schemaSql.replace(/^\\.*$/gm, '');
      
      await client.query(cleanSql);
      console.log('✅ Base schema and core data initialized.');
    }


    // 2. Check for countries table (Migration 01)
    const countryCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'countries'
      );
    `);

    if (!countryCheck.rows[0].exists) {
      console.log('🚀 Running missing migrations...');
      const migrationsDir = path.join(__dirname, 'migrations');
      const files = fs.readdirSync(migrationsDir).sort();
      
      for (const file of files) {
        console.log(`  Applying ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
      }
      console.log('✅ All migrations applied.');
    }

    // 3. Seed data if ecosystems is empty
    const dataCheck = await client.query('SELECT id FROM ecosystems LIMIT 1');
    if (dataCheck.rows.length === 0) {
      console.log('🌱 Database is empty. Running seeders...');
      
      // We pass false to NOT close the pool inside the seeders
      await seed(false);
      await seedMPAs(false);
      
      console.log('✅ Seeding complete.');
    } else {
      console.log('✨ Database already has data. Ready to go.');
    }

  } catch (err) {
    console.error('❌ Auto-setup failed:', err.message);
    // Don't exit process, maybe the app can still run if it's a minor error
  } finally {
    client.release();
  }
}

module.exports = autoSetup;
