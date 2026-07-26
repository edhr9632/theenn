-- Home page content: top education section, ordering, promo banners

DO $$ BEGIN
  ALTER TYPE news_section ADD VALUE 'top_education';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_news_articles_section_sort
  ON news_articles(section, sort_order, publish_date DESC);

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
