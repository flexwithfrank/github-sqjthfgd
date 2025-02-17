/*
  # Add Challenges Table

  1. New Tables
    - `challenges`
      - `id` (uuid, primary key)
      - `title` (text) - Challenge title
      - `subtitle` (text) - Challenge subtitle
      - `start_date` (timestamptz) - When the challenge starts
      - `end_date` (timestamptz) - When the challenge ends
      - `target_value` (integer) - Target number (e.g., 160 for 160 KM)
      - `unit` (text) - Unit of measurement (e.g., 'KM', 'workouts')
      - `description` (text) - How it works description
      - `rules` (jsonb) - Array of challenge rules
      - `rewards` (jsonb) - Array of rewards
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `challenges` table
    - Add policy for public read access
    - Add policy for admin write access
*/

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

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Challenges are viewable by everyone"
  ON challenges FOR SELECT
  USING (true);

-- Insert initial challenge data
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
) VALUES (
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
);