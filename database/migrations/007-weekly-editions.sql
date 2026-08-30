-- Weekly editions — align existing schema.sql tables (safe to re-run)
-- Tables weekly_cities + weekly_issues already exist in schema.sql.

ALTER TABLE weekly_issues ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_weekly_issues_city_featured
  ON weekly_issues (city_id, is_featured DESC, sort_order ASC, updated_at DESC);

INSERT INTO weekly_cities (id, name, slug, sort_order) VALUES
  ('city-bengaluru', 'Bengaluru', 'bengaluru', 0),
  ('city-mumbai', 'Mumbai', 'mumbai', 1),
  ('city-delhi', 'Delhi NCR', 'delhi-ncr', 2),
  ('city-chennai', 'Chennai', 'chennai', 3),
  ('city-hyderabad', 'Hyderabad', 'hyderabad', 4),
  ('city-pune', 'Pune', 'pune', 5)
ON CONFLICT (id) DO NOTHING;
