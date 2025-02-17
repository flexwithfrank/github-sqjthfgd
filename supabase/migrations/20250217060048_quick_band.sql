/*
  # Fix conversation RLS policies

  1. Changes
    - Simplify conversation policies
    - Fix RLS violations for new conversations
    - Ensure proper access control

  2. Security
    - Allow authenticated users to create conversations
    - Maintain data isolation between users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "Update conversations" ON conversations;
DROP POLICY IF EXISTS "Delete conversations" ON conversations;

-- Create simplified policies
-- 1. Allow any authenticated user to create conversations
CREATE POLICY "Create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Allow users to view conversations they're part of
CREATE POLICY "View conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = id 
      AND cp.user_id = auth.uid()
    )
  );

-- 3. Allow users to update conversations they're part of
CREATE POLICY "Update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = id 
      AND cp.user_id = auth.uid()
    )
  );

-- 4. Allow users to delete conversations they're part of
CREATE POLICY "Delete conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = id 
      AND cp.user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;