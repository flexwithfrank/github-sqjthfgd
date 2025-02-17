/*
  # Add email field to profiles table

  1. Changes
    - Add email column to profiles table
    - Make email column required and unique
    - Add index on email for faster lookups

  2. Security
    - No changes to RLS policies needed
*/

-- Add email column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email text UNIQUE NOT NULL;

-- Create index on email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);