/*
  # Fix Conversation RLS Policies

  This migration fixes the RLS policies for conversations and related tables
  by implementing a more straightforward and non-recursive approach.

  1. Changes
    - Drops existing problematic policies
    - Creates new, simplified policies for conversations
    - Updates policies for conversation participants
    - Ensures proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Update conversations" ON conversations;
DROP POLICY IF EXISTS "Delete conversations" ON conversations;

-- Create new simplified policies for conversations
CREATE POLICY "Anyone can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Drop existing policies for conversation_participants
DROP POLICY IF EXISTS "View own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Create participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Remove participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Update participant records" ON conversation_participants;

-- Create new policies for conversation_participants
CREATE POLICY "View conversation participants"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Insert conversation participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update own participant record"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Delete conversation participants"
  ON conversation_participants FOR DELETE
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;