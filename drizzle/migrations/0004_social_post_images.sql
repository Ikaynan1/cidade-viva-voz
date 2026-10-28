ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url text;

-- Bucket is created via the storage API (SQL writes to storage.buckets are not allowed):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
-- ON CONFLICT (id) DO UPDATE
-- SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS post_images_public_read ON storage.objects;
CREATE POLICY post_images_public_read ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS post_images_owner_insert ON storage.objects;
CREATE POLICY post_images_owner_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS post_images_owner_delete ON storage.objects;
CREATE POLICY post_images_owner_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
