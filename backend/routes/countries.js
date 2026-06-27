const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/**
 * GET /api/countries
 * List all supported Pacific countries
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM countries ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/countries/:code
 * Get details for a specific country by ISO code
 */
router.get('/:code', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM countries WHERE code = $1', [req.params.code.toUpperCase()]);
    if (rows.length === 0) return res.status(404).json({ error: 'Country not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
