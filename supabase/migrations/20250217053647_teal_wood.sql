/*
  # Messaging System Setup

  1. New Tables
    - `conversations` - Stores chat conversations
    - `conversation_participants` - Links users to conversations
    - `messages` - Stores individual messages

  2. Security
    - Enable RLS on all tables
    - Add policies for conversation access
    - Add policies for message access

  3. Performance
    - Add indexes for common queries
    - Add trigger for last message updates
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
  -- Conversations table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    CREATE TABLE conversations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      last_message text,
      last_message_at timestamptz DEFAULT now()
    );
  END IF;

  -- Conversation participants table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_participants') THEN
    CREATE TABLE conversation_participants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      last_read_at timestamptz DEFAULT now(),
      UNIQUE(conversation_id, user_id)
    );
  END IF;

  -- Messages table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    CREATE TABLE messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      content text NOT NULL,
      created_at timestamptz DEFAULT now(),
      attachments jsonb DEFAULT '[]'::jsonb,
      is_read boolean DEFAULT false,
      CONSTRAINT valid_content CHECK (char_length(trim(content)) > 0)
    );
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations' AND rowsecurity = true) THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_participants' AND rowsecurity = true) THEN
    ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages' AND rowsecurity = true) THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'conversations' AND indexname = 'idx_conversations_updated_at') THEN
    CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'messages' AND indexname = 'idx_messages_conversation_created') THEN
    CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'conversation_participants' AND indexname = 'idx_conversation_participants_user') THEN
    CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Conversation policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view conversations they''re part of') THEN
    CREATE POLICY "Users can view conversations they're part of"
      ON conversations FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can create conversations') THEN
    CREATE POLICY "Users can create conversations"
      ON conversations FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Conversation participants policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can view conversation participants') THEN
    CREATE POLICY "Users can view conversation participants"
      ON conversation_participants FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = conversation_participants.conversation_id
          AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can add participants') THEN
    CREATE POLICY "Users can add participants"
      ON conversation_participants FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Messages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their conversations') THEN
    CREATE POLICY "Users can view messages in their conversations"
      ON messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = messages.conversation_id
          AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages to their conversations') THEN
    CREATE POLICY "Users can send messages to their conversations"
      ON messages FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = messages.conversation_id
          AND user_id = auth.uid()
        )
        AND sender_id = auth.uid()
      );
  END IF;
END $$;

-- Create or replace function for updating last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_conversation_last_message_trigger'
  ) THEN
    CREATE TRIGGER update_conversation_last_message_trigger
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_conversation_last_message();
  END IF;
END $$;