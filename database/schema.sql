-- ENN (Education News Network) — PostgreSQL schema
-- Database: Education_news

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin users (future server-side auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Site settings (singleton row id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id                  SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name           TEXT NOT NULL DEFAULT 'Education News Network',
  tagline             TEXT,
  public_email        TEXT,
  phone               TEXT,
  office_address      TEXT,
  default_meta_title  TEXT,
  default_meta_desc   TEXT,
  default_og_image    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Survey config (singleton)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_survey_config (
  id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  label      TEXT NOT NULL DEFAULT 'Dynamic Survey form 2026',
  embed_url  TEXT NOT NULL,
  direct_url TEXT NOT NULL,
  enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- News categories & subcategories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_subcategories (
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_news_subcategories_category ON news_subcategories(category_id);

-- ---------------------------------------------------------------------------
-- News articles (daily / trending / press)
-- ---------------------------------------------------------------------------
CREATE TYPE news_section AS ENUM ('daily', 'trending', 'press', 'top_education');

CREATE TABLE IF NOT EXISTS news_articles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  section          news_section NOT NULL DEFAULT 'daily',
  title            TEXT NOT NULL,
  excerpt          TEXT,
  content          TEXT,
  author           TEXT,
  read_time        TEXT,
  category_id      TEXT REFERENCES news_categories(id) ON DELETE SET NULL,
  subcategory_id   TEXT REFERENCES news_subcategories(id) ON DELETE SET NULL,
  category_label   TEXT,
  subcategory_label TEXT,
  image_url        TEXT,
  image_alt        TEXT,
  featured_video   TEXT,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'draft',
  has_video        BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order       INT NOT NULL DEFAULT 0,
  publish_date     DATE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_section ON news_articles(section);
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_publish_date ON news_articles(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_section_sort ON news_articles(section, sort_order, publish_date DESC);

CREATE TABLE IF NOT EXISTS site_promo_banners (
  id          TEXT PRIMARY KEY,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  eyebrow     TEXT,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cta_label   TEXT,
  cta_url     TEXT,
  variant     TEXT NOT NULL DEFAULT 'default',
  sort_order  INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Header ads carousel
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_ads_config (
  id          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  autoplay_ms INT NOT NULL DEFAULT 120000,
  version     TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_ads_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TYPE ad_accent AS ENUM ('spotify', 'navy', 'red', 'sky');

CREATE TABLE IF NOT EXISTS site_ad_slides (
  id              TEXT PRIMARY KEY,
  sort_order      INT NOT NULL DEFAULT 0,
  kicker          TEXT NOT NULL,
  headline        TEXT NOT NULL,
  subtext         TEXT,
  listen_url      TEXT,
  follow_url      TEXT,
  banner_image_url TEXT,
  logo_url        TEXT,
  brand_color     TEXT,
  accent          ad_accent NOT NULL DEFAULT 'spotify',
  primary_label   TEXT,
  secondary_label TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_ad_slides_sort ON site_ad_slides(sort_order);

-- ---------------------------------------------------------------------------
-- Homepage videos section
-- ---------------------------------------------------------------------------
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

CREATE TYPE site_video_tab AS ENUM ('education', 'panels', 'podcasts');

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

-- ---------------------------------------------------------------------------
-- Homepage short videos
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Weekly city editions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_cities (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_issues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  city_id      TEXT NOT NULL REFERENCES weekly_cities(id) ON DELETE CASCADE,
  date_label   TEXT NOT NULL,
  weekday      TEXT,
  title        TEXT NOT NULL,
  tagline      TEXT,
  cover_image  TEXT,
  pdf_url      TEXT,
  highlights   JSONB NOT NULL DEFAULT '[]',
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_issues_city ON weekly_issues(city_id);

-- ---------------------------------------------------------------------------
-- Panel discussions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS panel_discussions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode    TEXT NOT NULL UNIQUE,
  duration   TEXT,
  topic      TEXT,
  title      TEXT NOT NULL,
  speakers   TEXT,
  image_url  TEXT,
  youtube_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Events, speakers, sponsors
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  category   TEXT NOT NULL,
  year       SMALLINT NOT NULL,
  event_date TEXT,
  location   TEXT,
  excerpt    TEXT,
  image_url  TEXT,
  tag        TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);

CREATE TABLE IF NOT EXISTS speakers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT,
  image_url  TEXT,
  event_id   TEXT REFERENCES events(id) ON DELETE SET NULL,
  category   TEXT,
  year       SMALLINT,
  youtube_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speakers_event ON speakers(event_id);

CREATE TABLE IF NOT EXISTS sponsors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  tier       TEXT,
  image_url  TEXT,
  event_id   TEXT REFERENCES events(id) ON DELETE SET NULL,
  category   TEXT,
  year       SMALLINT,
  youtube_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_event ON sponsors(event_id);

-- ---------------------------------------------------------------------------
-- Podcasts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS podcast_shows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  host        TEXT,
  schedule    TEXT,
  description TEXT,
  image_url   TEXT,
  image_alt   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS podcast_episodes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id     UUID NOT NULL REFERENCES podcast_shows(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  episode_date DATE,
  duration    TEXT,
  summary     TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_podcast_episodes_show ON podcast_episodes(show_id, sort_order);

-- ---------------------------------------------------------------------------
-- Contact form & newsletter
-- ---------------------------------------------------------------------------
CREATE TYPE contact_status AS ENUM ('new', 'read', 'archived');

CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT,
  status     contact_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  plan       TEXT,
  source     TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reader_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Article comments (news / blog posts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug  TEXT NOT NULL,
  author_name   TEXT NOT NULL,
  author_email  TEXT,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'approved'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_comments_slug_created
  ON article_comments (article_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_article_comments_status
  ON article_comments (status);

COMMIT;
