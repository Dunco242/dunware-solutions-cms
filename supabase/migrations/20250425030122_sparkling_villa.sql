/*
  # Fix chat participant relationships

  1. Changes
    - Add foreign key relationship between chat_conversation_participants and users if it doesn't exist
    - Safe check to prevent duplicate constraint errors
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_conversation_participants_user_id_fkey'
    AND table_name = 'chat_conversation_participants'
  ) THEN
    ALTER TABLE chat_conversation_participants
      ADD CONSTRAINT chat_conversation_participants_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;