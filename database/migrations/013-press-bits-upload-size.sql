-- Ensure Press Bits / Speakers / Sponsors video uploads accept common MP4 mime types
-- and keep the bucket file size at 200 MB.
--
-- IMPORTANT: Bucket limit alone is not enough. Also set the project Global file size
-- in Supabase Dashboard → Storage → Settings to at least 209715200 (200 MB).
-- Free plans cannot exceed 50 MB globally — Pro is required for ~100 MB videos.

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-m4v',
    'application/octet-stream'
  ]
WHERE id = 'press-bits';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'press-bits',
  'press-bits',
  true,
  209715200,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-m4v',
    'application/octet-stream'
  ]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'press-bits');
