/*
  # Fix Storage Policies

  1. Changes
    - Simplify storage policies
    - Remove folder restrictions temporarily
    - Ensure authenticated users can upload to all buckets
    - Maintain public read access

  2. Security
    - Maintain RLS
    - Keep public read-only access
    - Allow authenticated users full access
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('posts', 'posts', true),
  ('comments', 'comments', true)
ON CONFLICT (id) DO NOTHING;

-- Simple public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('posts', 'comments', 'avatars'));

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('posts', 'comments', 'avatars'));

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('posts', 'comments', 'avatars'));

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('posts', 'comments', 'avatars'));