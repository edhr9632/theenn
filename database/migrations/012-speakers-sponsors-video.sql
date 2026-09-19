-- Speakers & Sponsors: support YouTube/Shorts OR uploaded video files
ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'youtube';

ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'youtube';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'speakers' AND column_name = 'youtube_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'speakers' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE speakers RENAME COLUMN youtube_url TO video_url;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'youtube_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE sponsors RENAME COLUMN youtube_url TO video_url;
  END IF;
END $$;

ALTER TABLE speakers ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS video_url TEXT;

UPDATE speakers
SET source_type = CASE
  WHEN COALESCE(video_url, '') ILIKE '%youtube.com%' OR COALESCE(video_url, '') ILIKE '%youtu.be%' THEN 'youtube'
  WHEN COALESCE(video_url, '') <> '' THEN 'upload'
  ELSE 'youtube'
END;

UPDATE sponsors
SET source_type = CASE
  WHEN COALESCE(video_url, '') ILIKE '%youtube.com%' OR COALESCE(video_url, '') ILIKE '%youtu.be%' THEN 'youtube'
  WHEN COALESCE(video_url, '') <> '' THEN 'upload'
  ELSE 'youtube'
END;

CREATE INDEX IF NOT EXISTS idx_speakers_year ON speakers (year DESC);
CREATE INDEX IF NOT EXISTS idx_sponsors_year ON sponsors (year DESC);
