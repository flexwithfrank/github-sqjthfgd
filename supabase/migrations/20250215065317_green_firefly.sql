/*
  # Add challenge features

  1. New Columns
    - `status` to challenges table to track if challenge is active/completed/upcoming
    - `participant_count` to challenges table for quick participant counting
    - `is_featured` to challenges table to highlight special challenges
    - `completion_date` to challenge_progress to track when users complete challenges

  2. Functions
    - Trigger to automatically update participant_count
    - Function to check if a user has completed a challenge
*/

-- Add new columns to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'completed', 'upcoming')) DEFAULT 'upcoming',
ADD COLUMN IF NOT EXISTS participant_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add completion tracking to challenge_progress
ALTER TABLE challenge_progress
ADD COLUMN IF NOT EXISTS completion_date timestamptz;

-- Create function to update completion_date
CREATE OR REPLACE FUNCTION update_challenge_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_value >= (
    SELECT target_value 
    FROM challenges 
    WHERE id = NEW.challenge_id
  ) AND OLD.completion_date IS NULL THEN
    NEW.completion_date = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for completion tracking
DROP TRIGGER IF EXISTS check_challenge_completion ON challenge_progress;
CREATE TRIGGER check_challenge_completion
  BEFORE UPDATE ON challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_completion();

-- Create function to update participant count
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE challenges 
    SET participant_count = participant_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE challenges 
    SET participant_count = participant_count - 1
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant count
DROP TRIGGER IF EXISTS update_challenge_participant_count ON challenge_progress;
CREATE TRIGGER update_challenge_participant_count
  AFTER INSERT OR DELETE ON challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_count();

-- Update existing challenges status
UPDATE challenges
SET status = 
  CASE 
    WHEN now() < start_date THEN 'upcoming'
    WHEN now() > end_date THEN 'completed'
    ELSE 'active'
  END
WHERE status IS NULL;

-- Recalculate participant counts
UPDATE challenges c
SET participant_count = (
  SELECT count(*)
  FROM challenge_progress cp
  WHERE cp.challenge_id = c.id
);

-- Update completion dates for existing progress
UPDATE challenge_progress cp
SET completion_date = cp.last_updated
WHERE completion_date IS NULL
AND current_value >= (
  SELECT target_value
  FROM challenges c
  WHERE c.id = cp.challenge_id
);