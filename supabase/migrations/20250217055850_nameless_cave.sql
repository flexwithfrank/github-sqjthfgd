/*
  # Fix conversation table policies

  1. Changes
    - Drop existing conversation policies
    - Add new policies for all CRUD operations
    - Ensure proper access control for conversations

  2. Security
    - Users can only access conversations they're part of
    - Authenticated users can create new conversations
    - Maintains data isolation between users
*/

-- Drop existing policies for conversations
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create new policies for conversations
-- 1. Select policy
CREATE POLICY "View conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants
      WHERE conversation_id = id
      AND user_id = auth.uid()
    )
  );

-- 2. Insert policy
CREATE POLICY "Create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Update policy
CREATE POLICY "Update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants
      WHERE conversation_id = id
      AND user_id = auth.uid()
    )
  );

-- 4. Delete policy
CREATE POLICY "Delete conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants
      WHERE conversation_id = id
      AND user_id = auth.uid()
    )
  );