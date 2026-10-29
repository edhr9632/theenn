-- Press Bytes: unique public slug for shareable / taggable video URLs
-- e.g. /events/press-bytes/john-doe-summit-highlight

ALTER TABLE press_bits
  ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE press_bits
SET slug = LEFT(
  TRIM(BOTH '-' FROM LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(COALESCE(title, id::text), '[^a-zA-Z0-9]+', '-', 'g'),
      '-+',
      '-',
      'g'
    )
  )),
  80
)
WHERE slug IS NULL OR TRIM(slug) = '';

-- Ensure uniqueness if titles collide
WITH ranked AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC, id ASC) AS rn
  FROM press_bits
  WHERE slug IS NOT NULL AND TRIM(slug) <> ''
)
UPDATE press_bits p
SET slug = ranked.slug || '-' || SUBSTRING(REPLACE(ranked.id::text, '-', '') FROM 1 FOR 6)
FROM ranked
WHERE p.id = ranked.id AND ranked.rn > 1;

ALTER TABLE press_bits
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_press_bits_slug_unique ON press_bits (slug);
