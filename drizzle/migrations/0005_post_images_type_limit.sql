DROP POLICY IF EXISTS post_images_owner_insert ON storage.objects;
CREATE POLICY post_images_owner_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif'));
COMMENT ON COLUMN public.posts.image_url IS 'Storage path (or legacy URL) of the post photo in the post-images bucket';