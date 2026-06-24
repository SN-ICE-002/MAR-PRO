-- ============================================================
-- Ocean Guardian — Database Schema
-- Run: psql ocean_guardian < schema.sql
-- ============================================================

-- Drop tables in reverse dependency order for clean re-runs
DROP TABLE IF EXISTS health_log CASCADE;
DROP TABLE IF EXISTS sightings CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS fishing_events CASCADE;
DROP TABLE IF EXISTS species_zones CASCADE;
DROP TABLE IF EXISTS species CASCADE;
DROP TABLE IF EXISTS ecosystems CASCADE;

-- ────────────────────────────────
-- 1. Ecosystems (marine zones)
-- ────────────────────────────────
CREATE TABLE ecosystems (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  zone_type     VARCHAR(80),          -- e.g. 'coral_reef', 'seagrass', 'open_water'
  health_score  INTEGER CHECK (health_score BETWEEN 0 AND 100),
  description   TEXT,
  geojson       JSONB,                -- GeoJSON polygon geometry
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 2. Species
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
-- 3. Species ↔ Ecosystem zones (many-to-many)
-- ────────────────────────────────
CREATE TABLE species_zones (
  id           SERIAL PRIMARY KEY,
  species_id   INTEGER REFERENCES species(id) ON DELETE CASCADE,
  ecosystem_id INTEGER REFERENCES ecosystems(id) ON DELETE CASCADE,
  UNIQUE (species_id, ecosystem_id)
);

-- ────────────────────────────────
-- 4. Fishing events
-- ────────────────────────────────
CREATE TABLE fishing_events (
  id             SERIAL PRIMARY KEY,
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
-- 5. Alerts
-- ────────────────────────────────
CREATE TABLE alerts (
  id             SERIAL PRIMARY KEY,
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
-- 6. Sightings (community reports)
-- ────────────────────────────────
CREATE TABLE sightings (
  id            SERIAL PRIMARY KEY,
  species_id    INTEGER REFERENCES species(id) ON DELETE SET NULL,
  lat           DECIMAL(9, 6) NOT NULL,
  lng           DECIMAL(9, 6) NOT NULL,
  reported_by   VARCHAR(150),
  description   TEXT,
  verified      BOOLEAN DEFAULT FALSE,
  sighted_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- 7. Health log (time-series)
-- ────────────────────────────────
CREATE TABLE health_log (
  id            SERIAL PRIMARY KEY,
  ecosystem_id  INTEGER REFERENCES ecosystems(id) ON DELETE CASCADE,
  health_score  INTEGER CHECK (health_score BETWEEN 0 AND 100),
  recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────
-- Indexes for common queries
-- ────────────────────────────────
CREATE INDEX idx_fishing_events_date     ON fishing_events(event_date);
CREATE INDEX idx_fishing_events_zone     ON fishing_events(ecosystem_id);
CREATE INDEX idx_sightings_species       ON sightings(species_id);
CREATE INDEX idx_alerts_ecosystem        ON alerts(ecosystem_id);
CREATE INDEX idx_health_log_ecosystem    ON health_log(ecosystem_id, recorded_at);

\echo '✅  Schema created successfully'
