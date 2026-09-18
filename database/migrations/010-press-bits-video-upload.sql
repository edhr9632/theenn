-- Press Bits: support uploaded video files + YouTube/Shorts URLs
ALTER TABLE press_bits RENAME COLUMN youtube_url TO video_url;

ALTER TABLE press_bits
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'youtube';

UPDATE press_bits
SET source_type = CASE
  WHEN video_url ILIKE '%youtube.com%' OR video_url ILIKE '%youtu.be%' THEN 'youtube'
  ELSE 'upload'
END;
