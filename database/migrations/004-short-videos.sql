-- Dedicated short videos for the homepage Short Videos section
BEGIN;

CREATE TABLE IF NOT EXISTS short_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  image_url   TEXT,
  duration    TEXT,
  meta        TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_short_videos_enabled_sort
  ON short_videos (enabled, sort_order ASC, created_at DESC);

COMMIT;
