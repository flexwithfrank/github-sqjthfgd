/*
  # Fix role column implementation

  1. Changes
    - Drop existing role column if it exists
    - Add role column as text with check constraint
    - Add role_verified column as boolean
    - Add role_badge_count column as integer
    - Add index on role column

  2. Security
    - No changes to RLS policies needed
*/

-- Drop existing columns if they exist
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS role_verified,
DROP COLUMN IF EXISTS role_badge_count;

-- Drop enum type if it exists
DROP TYPE IF EXISTS user_role;

-- Add role columns with proper constraints
ALTER TABLE profiles
ADD COLUMN role text CHECK (role IN ('staff', 'member', 'guest')) DEFAULT 'guest',
ADD COLUMN role_verified boolean DEFAULT false,
ADD COLUMN role_badge_count integer DEFAULT 0;

-- Create index on role
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);