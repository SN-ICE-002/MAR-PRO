-- ============================================================
-- Ocean Guardian — Full Database Setup
-- This script creates the database structure and initial data.
-- 
-- Instructions:
-- 1. Open your PostgreSQL tool (psql, pgAdmin, etc.)
-- 2. Create the database: CREATE DATABASE ocean_guardian;
-- 3. Connect to it: \c ocean_guardian
-- 4. Copy and paste the code below.
-- ============================================================

-- Clean up existing tables if they exist
DROP TABLE IF EXISTS risk_projections CASCADE;
DROP TABLE IF EXISTS health_log CASCADE;
DROP TABLE IF EXISTS sightings CASCADE;
DROP TABLE IF EXISTS alert_species CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS fishing_events CASCADE;
DROP TABLE IF EXISTS species_zones CASCADE;
DROP TABLE IF EXISTS species CASCADE;
DROP TABLE IF EXISTS ecosystems CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

-- ────────────────────────────────
-- 1. Countries
-- ────────────────────────────────
CREATE TABLE countries (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  code         VARCHAR(3) UNIQUE, -- ISO 3-letter code
  center_lat   DECIMAL(9, 6),
  center_lng   DECIMAL(9, 6),
  zoom_level   INTEGER DEFAULT 6,
  bbox         JSONB, -- { minLat, maxLat, minLng, maxLng }
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 2. Ecosystems (marine zones)
-- ────────────────────────────────
CREATE TABLE ecosystems (
  id            SERIAL PRIMARY KEY,
  country_id    INTEGER REFERENCES countries(id),
  name          VARCHAR(150) NOT NULL,
  zone_type     VARCHAR(80),          -- e.g. 'coral_reef', 'seagrass', 'open_water'
  health_score  INTEGER CHECK (health_score BETWEEN 0 AND 100),
  description   TEXT,
  geojson       JSONB,                -- GeoJSON polygon geometry
  is_mpa        BOOLEAN DEFAULT FALSE,
  wdpa_id       INTEGER UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 3. Species
-- ────────────────────────────────
CREATE TABLE species (
  id             SERIAL PRIMARY KEY,
  common_name    VARCHAR(150) NOT NULL,
  scientific_name VARCHAR(150),
  iucn_status    VARCHAR(30),         -- 'CR', 'EN', 'VU', 'NT', 'LC'
  description    TEXT,
  why_it_matters TEXT,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 4. Species ↔ Ecosystem zones (many-to-many)
-- ────────────────────────────────
CREATE TABLE species_zones (
  id           SERIAL PRIMARY KEY,
  species_id   INTEGER REFERENCES species(id) ON DELETE CASCADE,
  ecosystem_id INTEGER REFERENCES ecosystems(id) ON DELETE CASCADE,
  UNIQUE (species_id, ecosystem_id)
);

-- ────────────────────────────────
-- 5. Fishing events
-- ────────────────────────────────
CREATE TABLE fishing_events (
  id             SERIAL PRIMARY KEY,
  country_id     INTEGER REFERENCES countries(id),
  vessel_id      VARCHAR(100),
  lat            DECIMAL(9, 6) NOT NULL,
  lng            DECIMAL(9, 6) NOT NULL,
  fishing_hours  DECIMAL(6, 2),
  event_date     DATE NOT NULL,
  inside_zone    BOOLEAN DEFAULT FALSE,
  ecosystem_id   INTEGER REFERENCES ecosystems(id) ON DELETE SET NULL,
  source         VARCHAR(50) DEFAULT 'seed',  -- 'seed' | 'gfw_api'
  external_id    VARCHAR(255) UNIQUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 6. Alerts
-- ────────────────────────────────
CREATE TABLE alerts (
  id             SERIAL PRIMARY KEY,
  country_id     INTEGER REFERENCES countries(id),
  alert_type     VARCHAR(80),          -- 'illegal_fishing', 'species_at_risk', 'bleaching', etc.
  severity       VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description    TEXT,
  ecosystem_id   INTEGER REFERENCES ecosystems(id) ON DELETE SET NULL,
  resolved       BOOLEAN DEFAULT FALSE,
  resolved_at    TIMESTAMPTZ,
  detected_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Alert ↔ Species (many-to-many via junction)
CREATE TABLE alert_species (
  alert_id   INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
  species_id INTEGER REFERENCES species(id) ON DELETE CASCADE,
  PRIMARY KEY (alert_id, species_id)
);

-- ────────────────────────────────
-- 7. Sightings (community reports & GBIF imports)
-- ────────────────────────────────
CREATE TABLE sightings (
  id               SERIAL PRIMARY KEY,
  country_id       INTEGER REFERENCES countries(id),
  species_id       INTEGER REFERENCES species(id) ON DELETE SET NULL,
  species_name_raw VARCHAR(255),
  lat              DECIMAL(9, 6) NOT NULL,
  lng              DECIMAL(9, 6) NOT NULL,
  reported_by      VARCHAR(150),
  description      TEXT,
  verified         BOOLEAN DEFAULT FALSE,
  source           VARCHAR(50) DEFAULT 'community', -- 'community' | 'gbif'
  external_id      VARCHAR(255) UNIQUE,
  sighted_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 8. Health log (time-series)
-- ────────────────────────────────
CREATE TABLE health_log (
  id            SERIAL PRIMARY KEY,
  ecosystem_id  INTEGER REFERENCES ecosystems(id) ON DELETE CASCADE,
  health_score  INTEGER CHECK (health_score BETWEEN 0 AND 100),
  recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 9. Risk projections
-- ────────────────────────────────
CREATE TABLE risk_projections (
    id               SERIAL PRIMARY KEY,
    ecosystem_id     INTEGER REFERENCES ecosystems(id) ON DELETE CASCADE,
    risk_score       INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    projection_status VARCHAR(50), -- 'Stable', 'At Risk', 'Critical Decline', etc.
    trend            VARCHAR(20),  -- 'improving', 'stable', 'declining'
    assessment_date  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 10. Initial Countries Data (18 Pacific Nations)
-- ────────────────────────────────
INSERT INTO countries (name, code, center_lat, center_lng, zoom_level, bbox) VALUES
('Vanuatu', 'VUT', -15.3767, 166.9592, 6, '{"minLat": -22, "maxLat": -12, "minLng": 165, "maxLng": 171}'),
('Fiji', 'FJI', -17.7134, 178.0650, 7, '{"minLat": -22, "maxLat": -12, "minLng": 174, "maxLng": 182}'),
('Solomon Islands', 'SLB', -9.6457, 160.1562, 6, '{"minLat": -13, "maxLat": -4, "minLng": 154, "maxLng": 171}'),
('Samoa', 'WSM', -13.7590, -172.1046, 9, '{"minLat": -15, "maxLat": -13, "minLng": -173, "maxLng": -171}'),
('Tonga', 'TON', -21.1784, -175.1982, 7, '{"minLat": -24, "maxLat": -15, "minLng": -176, "maxLng": -173}'),
('Kiribati', 'KIR', -3.37, 168.73, 5, '{"minLat": -11.5, "maxLat": 5, "minLng": 168, "maxLng": 177}'),
('Marshall Islands', 'MHL', 7.13, 171.18, 5, '{"minLat": 4, "maxLat": 16, "minLng": 160, "maxLng": 175}'),
('Nauru', 'NRU', -0.52, 166.93, 13, '{"minLat": -0.6, "maxLat": -0.4, "minLng": 166.8, "maxLng": 167.0}'),
('Palau', 'PLW', 7.51, 134.58, 8, '{"minLat": 3, "maxLat": 10, "minLng": 130, "maxLng": 140}'),
('Papua New Guinea', 'PNG', -6.31, 143.95, 6, '{"minLat": -12, "maxLat": 2, "minLng": 140, "maxLng": 160}'),
('Tuvalu', 'TUV', -7.10, 177.64, 7, '{"minLat": -11, "maxLat": -5, "minLng": 176, "maxLng": 181}'),
('Micronesia', 'FSM', 6.91, 158.18, 6, '{"minLat": 0, "maxLat": 10, "minLng": 135, "maxLng": 165}'),
('Cook Islands', 'COK', -21.23, -159.77, 5, '{"minLat": -25, "maxLat": -8, "minLng": -168, "maxLng": -155}'),
('Niue', 'NIU', -19.05, -169.86, 10, '{"minLat": -20, "maxLat": -18, "minLng": -171, "maxLng": -168}'),
('New Caledonia', 'NCL', -20.90, 165.61, 7, '{"minLat": -23, "maxLat": -18, "minLng": 163, "maxLng": 168}'),
('French Polynesia', 'PYF', -17.67, -149.40, 5, '{"minLat": -28, "maxLat": -7, "minLng": -155, "maxLng": -134}'),
('American Samoa', 'ASM', -14.27, -170.13, 10, '{"minLat": -15, "maxLat": -11, "minLng": -173, "maxLng": -168}'),
('Guam', 'GUM', 13.44, 144.79, 10, '{"minLat": 12, "maxLat": 15, "minLng": 144, "maxLng": 146}');

-- ────────────────────────────────
-- 11. Indexes for performance
-- ────────────────────────────────
CREATE INDEX idx_fishing_events_date      ON fishing_events(event_date);
CREATE INDEX idx_fishing_events_zone      ON fishing_events(ecosystem_id);
CREATE INDEX idx_fishing_events_country   ON fishing_events(country_id);
CREATE INDEX idx_sightings_species        ON sightings(species_id);
CREATE INDEX idx_sightings_country        ON sightings(country_id);
CREATE INDEX idx_sightings_source         ON sightings(source);
CREATE INDEX idx_sightings_external       ON sightings(external_id);
CREATE INDEX idx_alerts_ecosystem         ON alerts(ecosystem_id);
CREATE INDEX idx_alerts_country           ON alerts(country_id);
CREATE INDEX idx_ecosystems_country       ON ecosystems(country_id);
CREATE INDEX idx_ecosystems_mpa           ON ecosystems(is_mpa);
CREATE INDEX idx_health_log_ecosystem     ON health_log(ecosystem_id, recorded_at);
CREATE INDEX idx_risk_projections_eco     ON risk_projections(ecosystem_id);

-- Success message for psql
\echo '✅  Ocean Guardian database initialized successfully!'
