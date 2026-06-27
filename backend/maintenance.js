require('dotenv').config();
const pool = require('./db');
const { syncGBIFData } = require('./services/syncGBIF');
const { syncMaritimeBoundaries } = require('./services/syncBoundaries');

async function fix() {
    console.log('🧹 Starting cleanup...');
    try {
        await pool.query("DELETE FROM sightings WHERE source = 'GBIF'");
        console.log('✅ Deleted old GBIF records');
        
        await pool.query("DELETE FROM ecosystems WHERE name LIKE '%EEZ'");
        console.log('✅ Deleted old boundaries');

        const countriesRes = await pool.query('SELECT id, code, name FROM countries');
        const countries = countriesRes.rows;

        console.log(`🌍 Starting Global Sync for ${countries.length} countries...`);

        for (const country of countries) {
            console.log(`\n📦 SYNCING: ${country.name} (${country.code})`);
            try {
                await syncGBIFData(country.code);
            } catch (e) {
                console.warn(`⚠️ GBIF Sync failed for ${country.name}:`, e.message);
            }

            try {
                // Modified syncBoundaries logic should be inside its service
                // but we trigger it for all
            } catch (e) {
                console.warn(`⚠️ Boundary Sync failed for ${country.name}`);
            }
        }
        
        await syncMaritimeBoundaries();

        console.log('\n✨ All systems fixed and synced globally!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during maintenance:', err);
        process.exit(1);
    }
}

fix();
