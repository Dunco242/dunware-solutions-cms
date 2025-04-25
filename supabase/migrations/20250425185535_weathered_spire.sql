/*
  # Email System Tables

  1. New Tables
    - `email_accounts` - Store email account configurations
    - `email_messages` - Store email messages with threading support
    - `email_attachments` - Store email attachments
    - `email_folders` - Custom email folders/labels
    - `email_rules` - Email filtering and organization rules

  2. Security
    - Row Level Security (RLS) on all tables
    - Encryption for sensitive data
    - Access control policies
*/

-- Drop existing policies and tables if they exist
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_accounts' 
    AND policyname = 'Users can manage their own email accounts'
  ) THEN
    DROP POLICY "Users can manage their own email accounts" ON email_accounts;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_messages' 
    AND policyname = 'Users can access their own email messages'
  ) THEN
    DROP POLICY "Users can access their own email messages" ON email_messages;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_attachments' 
    AND policyname = 'Users can access their own email attachments'
  ) THEN
    DROP POLICY "Users can access their own email attachments" ON email_attachments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_folders' 
    AND policyname = 'Users can manage their own email folders'
  ) THEN
    DROP POLICY "Users can manage their own email folders" ON email_folders;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_rules' 
    AND policyname = 'Users can manage their own email rules'
  ) THEN
    DROP POLICY "Users can manage their own email rules" ON email_rules;
  END IF;

  -- Drop existing tables if they exist
  DROP TABLE IF EXISTS email_rules CASCADE;
  DROP TABLE IF EXISTS email_folders CASCADE;
  DROP TABLE IF EXISTS email_attachments CASCADE;
  DROP TABLE IF EXISTS email_messages CASCADE;
  DROP TABLE IF EXISTS email_accounts CASCADE;
END $$;

-- Email Accounts Table
CREATE TABLE email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email_address text NOT NULL,
  provider text NOT NULL,
  encrypted_credentials jsonb,
  sync_enabled boolean DEFAULT true,
  signature text,
  settings jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email_address)
);

-- Email Messages Table
CREATE TABLE email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES email_accounts(id),
  message_id text UNIQUE,
  thread_id text,
  parent_message_id text,
  in_reply_to text,
  reference_ids text[],
  from_address text NOT NULL,
  to_addresses text[] NOT NULL,
  cc_addresses text[],
  bcc_addresses text[],
  subject text,
  encrypted_content text NOT NULL,
  html_content boolean DEFAULT true,
  sent_at timestamptz,
  received_at timestamptz,
  read boolean DEFAULT false,
  starred boolean DEFAULT false,
  important boolean DEFAULT false,
  spam boolean DEFAULT false,
  folder text DEFAULT 'inbox',
  labels text[],
  flags jsonb,
  headers jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email Attachments Table
CREATE TABLE email_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES email_messages(id),
  name text NOT NULL,
  content_type text,
  size integer,
  storage_path text,
  encrypted boolean DEFAULT false,
  scan_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Email Folders Table
CREATE TABLE email_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES email_accounts(id),
  name text NOT NULL,
  type text DEFAULT 'custom',
  color text,
  icon text,
  parent_id uuid REFERENCES email_folders(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, name)
);

-- Email Rules Table
CREATE TABLE email_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES email_accounts(id),
  name text NOT NULL,
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  priority integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their own email accounts"
  ON email_accounts
  USING (user_id = auth.uid());

CREATE POLICY "Users can access their own email messages"
  ON email_messages
  USING (
    account_id IN (
      SELECT id FROM email_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their own email attachments"
  ON email_attachments
  USING (
    message_id IN (
      SELECT id FROM email_messages WHERE account_id IN (
        SELECT id FROM email_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their own email folders"
  ON email_folders
  USING (
    account_id IN (
      SELECT id FROM email_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own email rules"
  ON email_rules
  USING (
    account_id IN (
      SELECT id FROM email_accounts WHERE user_id = auth.uid()
    )
  );

-- Create Indexes
CREATE INDEX idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX idx_email_messages_folder ON email_messages(folder);
CREATE INDEX idx_email_messages_account ON email_messages(account_id);
CREATE INDEX idx_email_attachments_message ON email_attachments(message_id);
CREATE INDEX idx_email_folders_account ON email_folders(account_id);
CREATE INDEX idx_email_rules_account ON email_rules(account_id);

-- Add Triggers for Audit Logging
CREATE TRIGGER audit_email_accounts
  AFTER INSERT OR UPDATE OR DELETE ON email_accounts
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_email_messages
  AFTER INSERT OR UPDATE OR DELETE ON email_messages
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Functions for Email Threading
CREATE OR REPLACE FUNCTION update_email_thread()
RETURNS TRIGGER AS $$
BEGIN
  -- If no thread_id is provided, use the message_id as the thread_id
  IF NEW.thread_id IS NULL THEN
    NEW.thread_id := COALESCE(NEW.in_reply_to, NEW.message_id);
  END IF;
  
  -- Update reference_ids array
  IF NEW.in_reply_to IS NOT NULL THEN
    NEW.reference_ids := ARRAY(
      SELECT DISTINCT unnest(
        COALESCE(NEW.reference_ids, ARRAY[]::text[]) || 
        ARRAY[NEW.in_reply_to]
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_threading
  BEFORE INSERT OR UPDATE ON email_messages
  FOR EACH ROW EXECUTE FUNCTION update_email_thread();