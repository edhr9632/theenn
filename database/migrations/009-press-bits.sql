-- Press Bits: event reel videos filtered by year + category
-- Supports YouTube/Shorts URLs and uploaded video files
CREATE TABLE IF NOT EXISTS press_bits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'youtube',
  image_url TEXT,
  year SMALLINT NOT NULL,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_press_bits_year ON press_bits (year DESC);
CREATE INDEX IF NOT EXISTS idx_press_bits_category ON press_bits (category);
CREATE INDEX IF NOT EXISTS idx_press_bits_enabled_sort ON press_bits (enabled, sort_order ASC, created_at DESC);
