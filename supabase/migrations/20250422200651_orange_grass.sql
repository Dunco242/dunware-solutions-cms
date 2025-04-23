/*
  # Additional Module Tables

  1. New Tables
    - `calendar_settings` - User calendar preferences and sync settings
    - `email_accounts` - Email account configurations
    - `email_templates` - Reusable email templates
    - `chat_settings` - Chat preferences and notifications
    - `document_templates` - Document templates and categories
    - `route_optimizations` - Route optimization history and settings

  2. Security
    - Row Level Security (RLS) policies for all new tables
    - Encryption for sensitive data
*/

-- Calendar Settings Table
CREATE TABLE IF NOT EXISTS calendar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  provider text NOT NULL,
  encrypted_credentials jsonb,
  sync_enabled boolean DEFAULT true,
  default_reminder_minutes integer DEFAULT 15,
  working_hours jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Email Accounts Table
CREATE TABLE IF NOT EXISTS email_accounts (
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

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  category text,
  is_shared boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Settings Table
CREATE TABLE IF NOT EXISTS chat_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  notifications_enabled boolean DEFAULT true,
  notification_sound text DEFAULT 'default',
  desktop_notifications boolean DEFAULT true,
  do_not_disturb jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  content text NOT NULL,
  category text,
  is_shared boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Route Optimizations Table
CREATE TABLE IF NOT EXISTS route_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id),
  original_stops jsonb NOT NULL,
  optimized_stops jsonb NOT NULL,
  distance_saved numeric,
  time_saved integer,
  algorithm_used text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own calendar settings"
  ON calendar_settings
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own email accounts"
  ON email_accounts
  USING (user_id = auth.uid());

CREATE POLICY "Users can access shared email templates"
  ON email_templates
  USING (created_by = auth.uid() OR is_shared = true);

CREATE POLICY "Users can manage their own chat settings"
  ON chat_settings
  USING (user_id = auth.uid());

CREATE POLICY "Users can access shared document templates" 
  ON document_templates
  USING (created_by = auth.uid() OR is_shared = true);

CREATE POLICY "Users can access route optimizations"
  ON route_optimizations
  USING (created_by = auth.uid());

-- Add audit triggers
CREATE TRIGGER audit_calendar_settings
  AFTER INSERT OR UPDATE OR DELETE ON calendar_settings
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_email_accounts  
  AFTER INSERT OR UPDATE OR DELETE ON email_accounts
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_email_templates
  AFTER INSERT OR UPDATE OR DELETE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_document_templates
  AFTER INSERT OR UPDATE OR DELETE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_route_optimizations
  AFTER INSERT OR UPDATE OR DELETE ON route_optimizations
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();