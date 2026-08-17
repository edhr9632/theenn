-- Homepage Videos admin (site_videos_config + site_video_items)
-- Safe to re-run on Supabase.

DO $$ BEGIN
  CREATE TYPE site_video_tab AS ENUM ('education', 'panels', 'podcasts');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS site_videos_config (
  id              SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  featured_title  TEXT,
  youtube_url     TEXT,
  channel_url     TEXT,
  channel_label   TEXT,
  show_education  BOOLEAN NOT NULL DEFAULT TRUE,
  show_panels     BOOLEAN NOT NULL DEFAULT TRUE,
  show_podcasts   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_videos_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS site_video_items (
  id          TEXT PRIMARY KEY,
  tab         site_video_tab NOT NULL DEFAULT 'education',
  title       TEXT NOT NULL,
  duration    TEXT,
  image_url   TEXT,
  youtube_url TEXT NOT NULL,
  meta        TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_video_items_tab ON site_video_items(tab, sort_order);
