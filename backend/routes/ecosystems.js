const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/ecosystems — all zones with health score
router.get('/', async (req, res) => {
  const { countryId } = req.query;
  try {
    let query = `
      SELECT
        e.id,
        e.name,
        e.zone_type,
        e.health_score,
        e.description,
        e.geojson,
        e.country_id,
        e.is_mpa,
        e.created_at,
        COUNT(DISTINCT a.id) FILTER (WHERE a.resolved = false) AS active_alerts,
        COUNT(DISTINCT sz.species_id) AS species_count
      FROM ecosystems e
      LEFT JOIN alerts  a  ON a.ecosystem_id = e.id AND a.resolved = false
      LEFT JOIN species_zones sz ON sz.ecosystem_id = e.id
    `;
    
    const params = [];
    if (countryId) {
      query += ` WHERE e.country_id = $1 `;
      params.push(countryId);
    }

    query += `
      GROUP BY e.id
      ORDER BY e.name
    `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/ecosystems error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ecosystems/:id — single zone with full species list
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ecoResult = await pool.query(
      `SELECT * FROM ecosystems WHERE id = $1`,
      [id]
    );
    if (!ecoResult.rows.length) {
      return res.status(404).json({ error: 'Ecosystem not found' });
    }

    const speciesResult = await pool.query(
      `SELECT s.id, s.common_name, s.scientific_name, s.iucn_status, s.why_it_matters, s.image_url
       FROM species s
       JOIN species_zones sz ON sz.species_id = s.id
       WHERE sz.ecosystem_id = $1
       ORDER BY s.common_name`,
      [id]
    );

    const alertsResult = await pool.query(
      `SELECT COUNT(*) AS active_alerts
       FROM alerts WHERE ecosystem_id = $1 AND resolved = false`,
      [id]
    );

    const recentHealth = await pool.query(
      `SELECT health_score, recorded_at
       FROM health_log WHERE ecosystem_id = $1
       ORDER BY recorded_at DESC LIMIT 14`,
      [id]
    );

    res.json({
      ...ecoResult.rows[0],
      species: speciesResult.rows,
      active_alerts: parseInt(alertsResult.rows[0].active_alerts),
      health_history: recentHealth.rows.reverse(),
    });
  } catch (err) {
    console.error(`GET /api/ecosystems/${id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
