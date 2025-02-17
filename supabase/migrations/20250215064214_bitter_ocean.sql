/*
  # Add Challenge Progress Table

  1. New Tables
    - `challenge_progress`
      - `id` (uuid, primary key)
      - `challenge_id` (uuid, references challenges)
      - `user_id` (uuid, references profiles)
      - `current_value` (integer) - Current progress value
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `challenge_progress` table
    - Add policies for user access
*/

CREATE TABLE IF NOT EXISTS challenge_progress (
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

-- Create policies
CREATE POLICY "Users can view all challenge progress"
  ON challenge_progress FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own progress"
  ON challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert some sample progress data
INSERT INTO challenge_progress (challenge_id, user_id, current_value)
SELECT 
  c.id,
  p.id,
  floor(random() * 160)::integer
FROM challenges c
CROSS JOIN profiles p
WHERE c.title = 'End March'
ON CONFLICT (challenge_id, user_id) DO NOTHING;