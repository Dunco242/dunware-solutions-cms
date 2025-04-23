/*
  # Fix chat conversations users relationship

  1. Changes
    - Create a new junction table `chat_conversation_participants` to properly handle the many-to-many relationship
    - Migrate existing participants data from the new table
    - Add appropriate indexes and foreign key constraints
    - Add RLS policies for the new table
    - Drop old RLS policy and column with proper ordering
  
  2. Security
    - Enable RLS on the new junction table
    - Add policies to allow users to view conversations they are part of
*/

-- Create the junction table
CREATE TABLE IF NOT EXISTS chat_conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE chat_conversation_participants ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversation_participants_conversation 
ON chat_conversation_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversation_participants_user 
ON chat_conversation_participants(user_id);

-- Add RLS policies
CREATE POLICY "Users can view conversations they are part of"
ON chat_conversation_participants
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  conversation_id IN (
    SELECT conversation_id 
    FROM chat_conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Function to migrate existing participants
CREATE OR REPLACE FUNCTION migrate_conversation_participants()
RETURNS void AS $$
DECLARE
  conv RECORD;
  participant uuid;
BEGIN
  FOR conv IN SELECT id, participants FROM chat_conversations WHERE participants IS NOT NULL
  LOOP
    FOREACH participant IN ARRAY conv.participants
    LOOP
      INSERT INTO chat_conversation_participants (conversation_id, user_id)
      VALUES (conv.id, participant)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing data
SELECT migrate_conversation_participants();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_conversation_participants();

-- Drop the old policy first before removing the column
DROP POLICY IF EXISTS "Users can access their chat conversations" ON chat_conversations;

-- Create new policy that doesn't depend on the participants column
CREATE POLICY "Users can access their chat conversations"
ON chat_conversations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM chat_conversation_participants 
    WHERE conversation_id = chat_conversations.id 
    AND user_id = auth.uid()
  )
);

-- Now we can safely remove the old column
ALTER TABLE chat_conversations DROP COLUMN IF EXISTS participants;