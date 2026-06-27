const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/sightings — verified sightings with lat/lng + species info
router.get('/', async (req, res) => {
  const verifiedOnly = req.query.all !== 'true';
  const { countryId } = req.query;
  try {
    let query = `
      SELECT
        sg.id,
        sg.lat,
        sg.lng,
        sg.reported_by,
        sg.description,
        sg.verified,
        sg.source,
        sg.sighted_at,
        sg.created_at,
        sg.species_name_raw,
        s.id            AS species_id,
        COALESCE(s.common_name, sg.species_name_raw) AS species_name,
        s.scientific_name,
        s.iucn_status
      FROM sightings sg
      LEFT JOIN species s ON s.id = sg.species_id
      WHERE (sg.verified = true OR sg.source = 'GBIF' OR NOT $1)
    `;
    
    const params = [verifiedOnly];
    if (countryId) {
      query += ` AND sg.country_id = $2 `;
      params.push(countryId);
    } else {
      // If no countryId, we can either return all or a default
    }

    query += ` ORDER BY sg.sighted_at DESC `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/sightings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sightings — submit a new community sighting
router.post('/', async (req, res) => {
  const { species_id, lat, lng, reported_by, description, country_id } = req.body;

  // Basic validation
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    // Verify species exists if provided
    if (species_id) {
      const spCheck = await pool.query('SELECT id FROM species WHERE id = $1', [species_id]);
      if (!spCheck.rows.length) {
        return res.status(400).json({ error: 'Invalid species_id' });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO sightings (species_id, lat, lng, reported_by, description, verified, country_id)
       VALUES ($1, $2, $3, $4, $5, false, $6)
       RETURNING *`,
      [species_id || null, lat, lng, reported_by || 'Anonymous', description || null, country_id || null]
    );

    res.status(201).json({
      message: 'Sighting submitted — thank you! It will appear on the map once verified.',
      sighting: rows[0],
    });
  } catch (err) {
    console.error('POST /api/sightings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sightings/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT sg.*, s.common_name AS species_name, s.iucn_status
       FROM sightings sg LEFT JOIN species s ON s.id = sg.species_id
       WHERE sg.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Sighting not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`GET /api/sightings/${id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
