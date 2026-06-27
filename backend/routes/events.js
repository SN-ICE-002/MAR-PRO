const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/events/recent — last 7 days of fishing events
router.get('/recent', async (req, res) => {
  const { countryId } = req.query;
  try {
    let query = `
      SELECT
        fe.id,
        fe.vessel_id,
        fe.lat,
        fe.lng,
        fe.fishing_hours,
        fe.event_date,
        fe.inside_zone,
        fe.source,
        e.name  AS zone_name,
        e.zone_type
      FROM fishing_events fe
      LEFT JOIN ecosystems e ON e.id = fe.ecosystem_id
      WHERE fe.event_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    
    const params = [];
    if (countryId) {
      query += ` AND fe.country_id = $1 `;
      params.push(countryId);
    }

    query += ` ORDER BY fe.event_date DESC, fe.fishing_hours DESC `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events/recent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/summary — fishing hours grouped by day (for chart)
router.get('/summary', async (req, res) => {
  const { countryId } = req.query;
  try {
    let query = `
      SELECT
        event_date,
        SUM(fishing_hours)                                          AS total_hours,
        SUM(fishing_hours) FILTER (WHERE inside_zone = true)       AS hours_in_zone,
        SUM(fishing_hours) FILTER (WHERE inside_zone = false)      AS hours_outside_zone,
        COUNT(*)                                                    AS event_count,
        COUNT(*) FILTER (WHERE inside_zone = true)                 AS events_in_zone
      FROM fishing_events 
      WHERE event_date >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const params = [];
    if (countryId) {
      query += ` AND country_id = $1 `;
      params.push(countryId);
    }

    query += ` GROUP BY event_date ORDER BY event_date ASC `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events/summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events — all events (paginated, optional)
router.get('/', async (req, res) => {
  const limit  = parseInt(req.query.limit)  || 100;
  const offset = parseInt(req.query.offset) || 0;
  const { countryId } = req.query;
  try {
    let query = `
      SELECT fe.*, e.name AS zone_name
      FROM fishing_events fe
      LEFT JOIN ecosystems e ON e.id = fe.ecosystem_id
    `;
    
    const params = [limit, offset];
    if (countryId) {
      query += ` WHERE fe.country_id = $3 `;
      params.push(countryId);
    }

    query += ` ORDER BY fe.event_date DESC, fe.id DESC LIMIT $1 OFFSET $2 `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
