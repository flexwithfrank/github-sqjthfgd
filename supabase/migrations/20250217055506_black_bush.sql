/*
  # Add image_url to comments table

  1. Changes
    - Add image_url column to comments table
    - Make it nullable to support comments without images

  2. Security
    - No changes to RLS policies needed
    - Maintains existing security model
*/

-- Add image_url column to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS image_url text;