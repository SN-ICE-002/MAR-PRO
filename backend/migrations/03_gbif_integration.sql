-- Add source tracking to sightings so we can import from GBIF
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'community';
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE;

-- Allow sightings to optionally just have a species name if not in our database yet
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS species_name_raw VARCHAR(255);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sightings_source ON sightings(source);
CREATE INDEX IF NOT EXISTS idx_sightings_external ON sightings(external_id);
