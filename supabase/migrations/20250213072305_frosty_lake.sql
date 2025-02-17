/*
  # Add insert policy for profiles table
  
  1. Changes
    - Add policy to allow users to insert their own profile
    
  2. Security
    - Users can only insert a profile for their own auth.uid()
*/

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);