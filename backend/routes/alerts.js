const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/alerts — all unresolved alerts with zone + species names
router.get('/', async (req, res) => {
  const includeResolved = req.query.resolved === 'true';
  const { countryId }   = req.query;
  try {
    let query = `
      SELECT
        a.id,
        a.alert_type,
        a.severity,
        a.description,
        a.resolved,
        a.resolved_at,
        a.detected_at,
        a.created_at,
        e.id   AS ecosystem_id,
        e.name AS zone_name,
        e.zone_type,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',          s.id,
              'common_name', s.common_name,
              'iucn_status', s.iucn_status
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS species
      FROM alerts a
      LEFT JOIN ecosystems  e  ON e.id = a.ecosystem_id
      LEFT JOIN alert_species als ON als.alert_id = a.id
      LEFT JOIN species     s  ON s.id = als.species_id
      WHERE (a.resolved = $1 OR $2)
    `;
    
    const params = [false, includeResolved];
    if (countryId) {
      query += ` AND a.country_id = $3 `;
      params.push(countryId);
    }

    query += `
      GROUP BY a.id, e.id, e.name, e.zone_type
      ORDER BY
        CASE a.severity
          WHEN 'critical' THEN 1
          WHEN 'high'     THEN 2
          WHEN 'medium'   THEN 3
          WHEN 'low'      THEN 4
          ELSE 5
        END,
        a.detected_at DESC
    `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/alerts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts/:id — single alert detail
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT a.*, e.name AS zone_name,
        COALESCE(
          JSON_AGG(JSON_BUILD_OBJECT('id', s.id, 'common_name', s.common_name, 'iucn_status', s.iucn_status))
          FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS species
      FROM alerts a
      LEFT JOIN ecosystems e ON e.id = a.ecosystem_id
      LEFT JOIN alert_species als ON als.alert_id = a.id
      LEFT JOIN species s ON s.id = als.species_id
      WHERE a.id = $1
      GROUP BY a.id, e.name`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Alert not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`GET /api/alerts/${id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/resolve — mark alert as resolved
router.patch('/:id/resolve', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE alerts
       SET resolved = true, resolved_at = NOW()
       WHERE id = $1 AND resolved = false
       RETURNING *`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Alert not found or already resolved' });
    }
    res.json({ message: 'Alert resolved', alert: rows[0] });
  } catch (err) {
    console.error(`PATCH /api/alerts/${id}/resolve error:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
