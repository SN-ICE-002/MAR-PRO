-- ============================================================
-- Migration: Support Multiple Pacific Countries
-- ============================================================

-- 1. Create countries table
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

-- 2. Insert initial Pacific countries
INSERT INTO countries (name, code, center_lat, center_lng, zoom_level, bbox) VALUES
('Vanuatu', 'VUT', -15.3767, 166.9592, 6, '{"minLat": -22, "maxLat": -12, "minLng": 165, "maxLng": 171}'),
('Fiji', 'FJI', -17.7134, 178.0650, 7, '{"minLat": -22, "maxLat": -12, "minLng": 174, "maxLng": 182}'),
('Solomon Islands', 'SLB', -9.6457, 160.1562, 6, '{"minLat": -13, "maxLat": -4, "minLng": 154, "maxLng": 171}'),
('Samoa', 'WSM', -13.7590, -172.1046, 9, '{"minLat": -15, "maxLat": -13, "minLng": -173, "maxLng": -171}'),
('Tonga', 'TON', -21.1784, -175.1982, 7, '{"minLat": -24, "maxLat": -15, "minLng": -176, "maxLng": -173}');

-- 3. Add country_id to existing tables
ALTER TABLE ecosystems ADD COLUMN country_id INTEGER REFERENCES countries(id);
ALTER TABLE fishing_events ADD COLUMN country_id INTEGER REFERENCES countries(id);
ALTER TABLE alerts ADD COLUMN country_id INTEGER REFERENCES countries(id);
ALTER TABLE sightings ADD COLUMN country_id INTEGER REFERENCES countries(id);

-- 4. Assign current Vanuatu data to the Vanuatu country record
UPDATE ecosystems SET country_id = (SELECT id FROM countries WHERE code = 'VUT') WHERE country_id IS NULL;
UPDATE fishing_events SET country_id = (SELECT id FROM countries WHERE code = 'VUT') WHERE country_id IS NULL;
UPDATE alerts SET country_id = (SELECT id FROM countries WHERE code = 'VUT') WHERE country_id IS NULL;
UPDATE sightings SET country_id = (SELECT id FROM countries WHERE code = 'VUT') WHERE country_id IS NULL;
