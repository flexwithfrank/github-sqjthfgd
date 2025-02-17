/*
  # Add likes count to posts table

  1. Changes
    - Add likes_count column to posts table with default value of 0
    - Add trigger to automatically update likes_count when likes are added/removed

  2. Security
    - No changes to RLS policies needed
*/

-- Add likes_count column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes_count bigint DEFAULT 0;

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes count
DROP TRIGGER IF EXISTS update_post_likes_count ON likes;
CREATE TRIGGER update_post_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();