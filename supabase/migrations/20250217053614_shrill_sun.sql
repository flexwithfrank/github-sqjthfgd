/*
  # Challenge Progress Table Setup

  1. New Tables
    - `challenge_progress` table for tracking user progress in challenges
      - `id` (uuid, primary key)
      - `challenge_id` (uuid, foreign key to challenges)
      - `user_id` (uuid, foreign key to profiles)
      - `current_value` (integer)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Public read access
      - User-specific update access
      - User-specific insert access
*/

-- Create challenge_progress table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'challenge_progress'
  ) THEN
    CREATE TABLE challenge_progress (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      current_value integer DEFAULT 0 NOT NULL,
      last_updated timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now(),
      UNIQUE(challenge_id, user_id)
    );

    -- Enable RLS
    ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'challenge_progress' 
    AND policyname = 'Users can view all challenge progress'
  ) THEN
    CREATE POLICY "Users can view all challenge progress"
      ON challenge_progress FOR SELECT
      USING (true);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'challenge_progress' 
    AND policyname = 'Users can update their own progress'
  ) THEN
    CREATE POLICY "Users can update their own progress"
      ON challenge_progress FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'challenge_progress' 
    AND policyname = 'Users can insert their own progress'
  ) THEN
    CREATE POLICY "Users can insert their own progress"
      ON challenge_progress FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Insert sample progress data if it doesn't exist
INSERT INTO challenge_progress (challenge_id, user_id, current_value)
SELECT 
  c.id,
  p.id,
  floor(random() * 160)::integer
FROM challenges c
CROSS JOIN profiles p
WHERE c.title = 'End March'
  AND NOT EXISTS (
    SELECT 1 
    FROM challenge_progress cp 
    WHERE cp.challenge_id = c.id 
    AND cp.user_id = p.id
  )
ON CONFLICT (challenge_id, user_id) DO NOTHING;