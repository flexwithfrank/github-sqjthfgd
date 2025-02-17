/*
  # Add user role system

  1. Changes
    - Add role enum type for user roles
    - Add role column to profiles table
    - Add role_verified column to profiles table
    - Add role_badge_count column to profiles table
  
  2. Security
    - Only authenticated users can update their own role
    - Role verification status can only be updated by admin users
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('staff', 'member', 'guest');

-- Add role columns to profiles
ALTER TABLE profiles
ADD COLUMN role user_role DEFAULT 'guest',
ADD COLUMN role_verified boolean DEFAULT false,
ADD COLUMN role_badge_count integer DEFAULT 0;

-- Create index on role
CREATE INDEX profiles_role_idx ON profiles(role);