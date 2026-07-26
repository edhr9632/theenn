-- Article comments for news/blog posts
BEGIN;

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
