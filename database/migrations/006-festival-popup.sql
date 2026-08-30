-- Festival greeting popup (admin-managed posts + singleton settings)
-- Safe to re-run on Supabase.

CREATE TABLE IF NOT EXISTS site_festival_posts (
  id                    TEXT PRIMARY KEY,
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  subtitle              TEXT,
  message               TEXT,
  image_url             TEXT NOT NULL,
  theme                 TEXT NOT NULL DEFAULT 'default',
  href                  TEXT,
  top_bar_ticker_text   TEXT,
  listen_intro_text     TEXT,
  is_published          BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_festival_posts_sort
  ON site_festival_posts (sort_order ASC, updated_at DESC);

CREATE TABLE IF NOT EXISTS site_festival_config (
  id                      SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled                 BOOLEAN NOT NULL DEFAULT FALSE,
  active_post_id          TEXT REFERENCES site_festival_posts(id) ON DELETE SET NULL,
  show_once_per_session   BOOLEAN NOT NULL DEFAULT TRUE,
  show_once_per_day       BOOLEAN NOT NULL DEFAULT FALSE,
  close_on_outside_click  BOOLEAN NOT NULL DEFAULT TRUE,
  close_on_escape         BOOLEAN NOT NULL DEFAULT TRUE,
  confetti_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  confetti_count          INT NOT NULL DEFAULT 0,
  animation_duration      INT NOT NULL DEFAULT 900,
  storage_key             TEXT NOT NULL DEFAULT 'enn-festival-popup',
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_festival_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Seed Onam post (used when table is empty)
INSERT INTO site_festival_posts (
  id, slug, title, subtitle, message, image_url, theme,
  top_bar_ticker_text, listen_intro_text, is_published, sort_order
)
VALUES (
  'fest-onam-2026',
  'onam',
  'Happy Onam',
  'Festival of Prosperity',
  'Celebrating tradition, togetherness & prosperity with educators and families across India.',
  '/images/festivals/onam.png',
  'onam',
  'Happy Onam & Eid Mubarak — celebrating togetherness, prosperity & joy',
  'Happy Onam from Education News Network. We wish educators, students, and families across India a festival of prosperity, togetherness, and joy.',
  TRUE,
  0
)
ON CONFLICT (id) DO NOTHING;

UPDATE site_festival_config
SET
  enabled = TRUE,
  active_post_id = COALESCE(active_post_id, 'fest-onam-2026'),
  show_once_per_session = FALSE,
  show_once_per_day = FALSE,
  confetti_enabled = FALSE,
  confetti_count = 0,
  storage_key = CASE
    WHEN storage_key IS NULL OR storage_key = 'enn-festival-popup'
      THEN 'enn-festival-popup-onam-2026-v2'
    ELSE storage_key
  END,
  updated_at = NOW()
WHERE id = 1
  AND active_post_id IS NULL;
