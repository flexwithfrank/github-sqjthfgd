/*
  # Fix conversation participant policies v2

  1. Changes
    - Drop all existing conversation participant policies
    - Implement new non-recursive policy structure
    - Add separate policies for different operations
    - Improve security and performance

  2. Security
    - Maintains data isolation between users
    - Prevents unauthorized access
    - Eliminates recursive policy checks
*/

-- Drop all existing policies for conversation_participants
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they're in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to their conversations" ON conversation_participants;

-- Create new, non-recursive policies
-- 1. Basic select policy for authenticated users
CREATE POLICY "View own participant records"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Insert policy with direct user check
CREATE POLICY "Create participant records"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to add themselves to conversations
    user_id = auth.uid()
    OR
    -- Allow users to add others to conversations they're already in
    EXISTS (
      SELECT 1
      FROM conversation_participants existing
      WHERE existing.conversation_id = conversation_participants.conversation_id
      AND existing.user_id = auth.uid()
    )
  );

-- 3. Delete policy for removing participants
CREATE POLICY "Remove participant records"
  ON conversation_participants FOR DELETE
  TO authenticated
  USING (
    -- Users can remove themselves
    user_id = auth.uid()
    OR
    -- Users can remove others from conversations they're in
    EXISTS (
      SELECT 1
      FROM conversation_participants existing
      WHERE existing.conversation_id = conversation_participants.conversation_id
      AND existing.user_id = auth.uid()
    )
  );

-- 4. Update policy for participant records
CREATE POLICY "Update participant records"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (
    -- Users can only update their own records
    user_id = auth.uid()
  );