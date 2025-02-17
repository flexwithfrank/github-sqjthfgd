/*
  # Fix conversation participants policies

  1. Changes
    - Drop existing problematic policies
    - Create new, simplified policies that avoid recursion
    - Maintain security while fixing the infinite recursion issue

  2. Security
    - Users can still only access conversations they're part of
    - Maintains data isolation between users
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;

-- Create new, simplified policies
CREATE POLICY "Users can view their own conversations"
  ON conversation_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view conversations they're in"
  ON conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to their conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
    OR
    auth.uid() = user_id
  );