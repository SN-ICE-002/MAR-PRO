-- Add MPA tracking to ecosystems
ALTER TABLE ecosystems ADD COLUMN IF NOT EXISTS is_mpa BOOLEAN DEFAULT FALSE;
ALTER TABLE ecosystems ADD COLUMN IF NOT EXISTS wdpa_id INTEGER UNIQUE;
ALTER TABLE ecosystems ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id);

CREATE INDEX IF NOT EXISTS idx_ecosystems_mpa ON ecosystems(is_mpa);
