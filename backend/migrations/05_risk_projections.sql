-- Table to store periodic risk assessments and projections
CREATE TABLE IF NOT EXISTS risk_projections (
    id SERIAL PRIMARY KEY,
    ecosystem_id INTEGER REFERENCES ecosystems(id) ON DELETE CASCADE,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    projection_status VARCHAR(50), -- 'Stable', 'At Risk', 'Critical Decline', etc.
    trend VARCHAR(20),             -- 'improving', 'stable', 'declining'
    assessment_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_projections_eco ON risk_projections(ecosystem_id);
