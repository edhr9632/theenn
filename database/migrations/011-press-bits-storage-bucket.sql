-- Supabase Storage bucket for Press Bits uploaded reel videos + thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'press-bits',
  'press-bits',
  true,
  209715200,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Press bits public read" ON storage.objects;
CREATE POLICY "Press bits public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'press-bits');

DROP POLICY IF EXISTS "Press bits public upload" ON storage.objects;
CREATE POLICY "Press bits public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'press-bits');

DROP POLICY IF EXISTS "Press bits public update" ON storage.objects;
CREATE POLICY "Press bits public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'press-bits');
