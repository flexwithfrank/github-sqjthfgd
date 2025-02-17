/*
  # Storage Bucket Policies

  1. New Policies
    - Create storage buckets for posts and comments
    - Set up RLS policies for each bucket
    - Enable public access for viewing
    - Restrict upload/delete to authenticated users

  2. Security
    - Enable RLS on all buckets
    - Add policies for authenticated users
    - Add policies for public access
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('posts', 'posts', true),
  ('comments', 'comments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('posts', 'comments', 'avatars'));

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('posts', 'comments', 'avatars')
  AND (CASE
    WHEN bucket_id = 'avatars' THEN
      (storage.foldername(name))[1] = auth.uid()::text
    ELSE
      auth.role() = 'authenticated'
  END)
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('posts', 'comments', 'avatars')
  AND (CASE
    WHEN bucket_id = 'avatars' THEN
      (storage.foldername(name))[1] = auth.uid()::text
    ELSE
      auth.role() = 'authenticated'
  END)
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('posts', 'comments', 'avatars')
  AND (CASE
    WHEN bucket_id = 'avatars' THEN
      (storage.foldername(name))[1] = auth.uid()::text
    ELSE
      auth.role() = 'authenticated'
  END)
);