/*
  # Fix profiles RLS policy

  1. Changes
    - Drop existing insert policy if it exists
    - Create new insert policy for profiles that allows authenticated users to insert their own profile
    - This fixes the sign-up flow by allowing new users to create their profile

  2. Security
    - Maintains security by ensuring users can only create their own profile
    - Keeps existing RLS enabled
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new insert policy
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);