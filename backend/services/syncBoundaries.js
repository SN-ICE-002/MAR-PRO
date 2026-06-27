const pool = require('../db');

/**
 * Generate EEZ-like boundaries from country bounding boxes
 * Since Marine Regions geometry API requires authentication,
 * we create approximate EEZ boundaries from our country bbox data
 */
const syncMaritimeBoundaries = async () => {
    try {
        const countriesRes = await pool.query('SELECT id, name, bbox, center_lat, center_lng FROM countries');
        const countries = countriesRes.rows;

        for (const country of countries) {
            if (!country.bbox) {
                console.log(`⚠️ No bbox data for ${country.name}, skipping EEZ`);
                continue;
            }

            console.log(`🗺️ Generating EEZ boundary for ${country.name}...`);

            const bbox = country.bbox;
            const minLat = bbox.minLat;
            const maxLat = bbox.maxLat;
            const minLng = bbox.minLng;
            const maxLng = bbox.maxLng;

            // Create a GeoJSON polygon from the bounding box
            const geojson = {
                type: "Feature",
                properties: {
                    name: `${country.name} EEZ`,
                    type: "territory"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [minLng, minLat],
                        [maxLng, minLat],
                        [maxLng, maxLat],
                        [minLng, maxLat],
                        [minLng, minLat]  // close the polygon
                    ]]
                }
            };

            const eezName = `${country.name} EEZ`;

            // Check if already exists
            const existing = await pool.query(
                'SELECT id FROM ecosystems WHERE name = $1', [eezName]
            );

            if (existing.rows.length > 0) {
                await pool.query(
                    `UPDATE ecosystems SET geojson = $1, country_id = $2 WHERE id = $3`,
                    [JSON.stringify(geojson), country.id, existing.rows[0].id]
                );
            } else {
                await pool.query(
                    `INSERT INTO ecosystems (name, zone_type, geojson, country_id, description, health_score)
                     VALUES ($1, $2, $3, $4, $5, 100)`,
                    [
                        eezName,
                        'territory',
                        JSON.stringify(geojson),
                        country.id,
                        `Approximate Exclusive Economic Zone for ${country.name}`
                    ]
                );
            }

            console.log(`✅ Saved EEZ boundary for ${country.name}`);
        }
    } catch (error) {
        console.error('❌ Boundary Sync Error:', error.message);
    }
};

module.exports = { syncMaritimeBoundaries };
