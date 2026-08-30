-- Supabase Storage bucket for weekly magazine covers + PDFs
-- Run on Supabase SQL editor if uploads fail with "Bucket not found".

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'weekly-editions',
  'weekly-editions',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Weekly editions public read" ON storage.objects;
CREATE POLICY "Weekly editions public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'weekly-editions');

DROP POLICY IF EXISTS "Weekly editions public upload" ON storage.objects;
CREATE POLICY "Weekly editions public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'weekly-editions');

DROP POLICY IF EXISTS "Weekly editions public update" ON storage.objects;
CREATE POLICY "Weekly editions public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'weekly-editions');
