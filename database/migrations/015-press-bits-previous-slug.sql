-- Keep one previous slug so long URLs can 301 to short SEO slugs
ALTER TABLE press_bits
  ADD COLUMN IF NOT EXISTS previous_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_press_bits_previous_slug
  ON press_bits (previous_slug)
  WHERE previous_slug IS NOT NULL;
