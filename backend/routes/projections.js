const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { calculateRiskScores } = require('../services/riskAnalysis');

// GET /api/projections — get risk analysis for all ecosystems (pure calculation, no DB write)
router.get('/', async (req, res) => {
    try {
        const scores = await calculateRiskScores();
        res.json(scores);
    } catch (err) {
        console.error('GET /api/projections error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/projections/:id — get historical risk trend for a specific ecosystem
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT * FROM risk_projections 
             WHERE ecosystem_id = $1 
             ORDER BY assessment_date ASC 
             LIMIT 12`,
            [id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
