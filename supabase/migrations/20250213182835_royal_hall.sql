/*
  # Add favorite workout field to profiles table

  1. Changes
    - Add `favorite_workout` column to profiles table
    - Column is nullable text field
    - No default value required
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS favorite_workout text;