const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/species — all species with IUCN status
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        s.id,
        s.common_name,
        s.scientific_name,
        s.iucn_status,
        s.description,
        s.why_it_matters,
        s.image_url,
        ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) AS found_in_zones
      FROM species s
      LEFT JOIN species_zones sz ON sz.species_id = s.id
      LEFT JOIN ecosystems   e  ON e.id = sz.ecosystem_id
      GROUP BY s.id
      ORDER BY
        CASE s.iucn_status
          WHEN 'CR' THEN 1
          WHEN 'EN' THEN 2
          WHEN 'VU' THEN 3
          WHEN 'NT' THEN 4
          WHEN 'LC' THEN 5
          ELSE 6
        END,
        s.common_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/species error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/species/:id — single species with zones and recent sightings
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const spResult = await pool.query(
      `SELECT * FROM species WHERE id = $1`,
      [id]
    );
    if (!spResult.rows.length) {
      return res.status(404).json({ error: 'Species not found' });
    }

    const zonesResult = await pool.query(
      `SELECT e.id, e.name, e.zone_type, e.health_score
       FROM ecosystems e
       JOIN species_zones sz ON sz.ecosystem_id = e.id
       WHERE sz.species_id = $1`,
      [id]
    );

    const sightingsResult = await pool.query(
      `SELECT id, lat, lng, reported_by, description, verified, sighted_at
       FROM sightings WHERE species_id = $1
       ORDER BY sighted_at DESC LIMIT 10`,
      [id]
    );

    res.json({
      ...spResult.rows[0],
      zones: zonesResult.rows,
      recent_sightings: sightingsResult.rows,
    });
  } catch (err) {
    console.error(`GET /api/species/${id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
