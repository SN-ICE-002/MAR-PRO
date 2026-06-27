const pool = require('../db');

/**
 * Risk Analysis Service
 * Calculates the Projected Risk Score for ecosystems
 */
const calculateRiskScores = async () => {
    try {
        console.log('🧬 Running Future Risk Analysis...');
        
        // 1. Get all ecosystems with their current health and active alerts
        const ecosystemsRes = await pool.query(`
            SELECT 
                e.id, 
                e.name, 
                e.health_score,
                (SELECT COUNT(*) FROM fishing_events fe WHERE fe.ecosystem_id = e.id AND fe.event_date > NOW() - INTERVAL '30 days') as recent_fishing_events,
                (SELECT SUM(fishing_hours) FROM fishing_events fe WHERE fe.ecosystem_id = e.id AND fe.event_date > NOW() - INTERVAL '30 days') as total_fishing_hours,
                (SELECT COUNT(*) FROM alerts a WHERE a.ecosystem_id = e.id AND a.resolved = false) as active_alerts
            FROM ecosystems e
            WHERE e.zone_type != 'territory'
        `);

        const results = ecosystemsRes.rows.map(eco => {
            let riskScore = 0;

            // Health Factor (0-40 points)
            // Lower health = higher risk
            riskScore += (100 - eco.health_score) * 0.4;

            // Fishing Pressure (0-30 points)
            // More fishing hours = higher risk
            const fishingPressure = Math.min(30, (eco.total_fishing_hours || 0) * 2);
            riskScore += fishingPressure;

            // Alert Factor (0-30 points)
            // Active alerts = higher risk
            riskScore += Math.min(30, (eco.active_alerts || 0) * 10);

            let projection = 'Stable';
            if (riskScore > 70) projection = 'Critical Decline';
            else if (riskScore > 40) projection = 'At Risk';
            else if (eco.health_score < 50 && fishingPressure > 10) projection = 'Deteriorating';

            return {
                id: eco.id,
                name: eco.name,
                riskScore: Math.round(riskScore),
                projection: projection,
                lastAssessed: new Date()
            };
        });

        return results;
    } catch (error) {
        console.error('❌ Risk Analysis Error:', error.message);
        return [];
    }
};

module.exports = { calculateRiskScores };
