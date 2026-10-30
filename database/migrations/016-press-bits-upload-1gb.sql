-- Raise Press Bits / Speakers / Sponsors video upload bucket limit to 1000 MB (1 GB).
--
-- IMPORTANT: Also set Supabase Dashboard → Storage → Settings → Global file size limit
-- to at least 1048576000 (1000 MB). Pro/Team plan required above 50 MB.

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 1048576000,
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
