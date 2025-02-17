/*
  # Challenges Table Setup

  1. New Tables
    - `challenges` table for tracking fitness challenges
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `target_value` (integer)
      - `unit` (text)
      - `description` (text)
      - `rules` (jsonb)
      - `rewards` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `challenges` table
    - Add policy for public read access
*/

-- Create challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  target_value integer NOT NULL,
  unit text NOT NULL,
  description text NOT NULL,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  rewards jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'challenges'
      AND rowsecurity = true
  ) THEN
    ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'challenges' 
      AND policyname = 'Challenges are viewable by everyone'
  ) THEN
    CREATE POLICY "Challenges are viewable by everyone"
      ON challenges FOR SELECT
      USING (true);
  END IF;
END $$;

-- Insert initial challenge data if it doesn't exist
INSERT INTO challenges (
  title,
  subtitle,
  start_date,
  end_date,
  target_value,
  unit,
  description,
  rules,
  rewards
)
SELECT
  'End March',
  '160 KM Challenge',
  '2025-03-01 00:00:00+00',
  '2025-03-31 23:59:59+00',
  160,
  'KM',
  'Track your workouts and compete with other members to reach the 160 KM goal by the end of March. The more consistent you are, the higher you''ll climb on the leaderboard!',
  '[
    "Complete 160 KM of cardio activities",
    "All activities must be tracked in the app",
    "Challenge ends on March 31st at midnight"
  ]'::jsonb,
  '[
    {"place": 1, "title": "1st Place", "reward": "3 months free membership"},
    {"place": 2, "title": "2nd Place", "reward": "2 months free membership"},
    {"place": 3, "title": "3rd Place", "reward": "1 month free membership"}
  ]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM challenges WHERE title = 'End March'
);