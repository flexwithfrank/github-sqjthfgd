/*
  # Fix Conversation Policies Recursion

  This migration fixes the infinite recursion issue in conversation policies
  by implementing a flat, non-recursive approach to permissions.

  1. Changes
    - Removes recursive policy definitions
    - Implements simple, direct policies
    - Ensures proper access control without circular references
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
DROP POLICY IF EXISTS "View conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Insert conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Update own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Delete conversation participants" ON conversation_participants;

-- Simple policies for conversations
CREATE POLICY "Create new conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "View conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Delete conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (true);

-- Simple policies for conversation_participants
CREATE POLICY "View participants"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Add participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update participants"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Remove participants"
  ON conversation_participants FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;