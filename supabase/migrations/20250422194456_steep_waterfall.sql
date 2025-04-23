/*
  # Additional Module Tables Migration

  1. New Tables
    - `calendar_events`
      - Event scheduling and management
      - Integration with activities
    - `email_messages`
      - Email tracking and management
      - Encrypted content storage
    - `projects`
      - Project management
      - Task and milestone tracking
    - `routes`
      - Route planning and optimization
      - Location tracking
    - `chat_messages`
      - Real-time communication
      - Message history
    - `documents`
      - Document management
      - Version control
      
  2. Security
    - Row Level Security (RLS) on all tables
    - Encryption for sensitive data
    - Access control policies

  3. Relationships
    - Integration with existing CRM tables
    - Cross-module functionality
*/

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  location text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  event_type text DEFAULT 'meeting' CHECK (
    event_type IN ('meeting', 'task', 'reminder', 'out_of_office')
  ),
  recurrence_rule text,
  related_to_type text CHECK (related_to_type IN ('contact', 'company', 'deal', 'project')),
  related_to_id uuid,
  attendees jsonb,
  notifications jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email Messages Table
CREATE TABLE IF NOT EXISTS email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  from_address text NOT NULL,
  to_addresses text[] NOT NULL,
  cc_addresses text[],
  bcc_addresses text[],
  encrypted_content text NOT NULL,
  html_content boolean DEFAULT true,
  status text DEFAULT 'draft' CHECK (
    status IN ('draft', 'sent', 'scheduled', 'failed')
  ),
  sent_at timestamptz,
  scheduled_for timestamptz,
  thread_id text,
  parent_message_id text,
  related_to_type text CHECK (related_to_type IN ('contact', 'company', 'deal', 'project')),
  related_to_id uuid,
  attachments jsonb,
  metadata jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (
    status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')
  ),
  priority text DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  start_date date,
  end_date date,
  budget numeric,
  actual_cost numeric,
  progress integer CHECK (progress >= 0 AND progress <= 100),
  company_id uuid REFERENCES companies(id),
  team_members uuid[],
  tags text[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo' CHECK (
    status IN ('todo', 'in_progress', 'review', 'completed')
  ),
  priority text DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  assigned_to uuid REFERENCES auth.users(id),
  start_date date,
  due_date date,
  completed_at timestamptz,
  estimated_hours numeric,
  actual_hours numeric,
  dependencies uuid[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Milestones Table
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'delayed')
  ),
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date date NOT NULL,
  status text DEFAULT 'planned' CHECK (
    status IN ('planned', 'in_progress', 'completed', 'cancelled')
  ),
  assigned_to uuid REFERENCES auth.users(id),
  start_location jsonb NOT NULL,
  end_location jsonb NOT NULL,
  estimated_duration integer, -- in minutes
  actual_duration integer,
  total_distance numeric,
  optimization_status text DEFAULT 'not_optimized' CHECK (
    optimization_status IN ('not_optimized', 'optimizing', 'optimized')
  ),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Route Stops Table
CREATE TABLE IF NOT EXISTS route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id),
  stop_order integer NOT NULL,
  location jsonb NOT NULL,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  duration integer, -- in minutes
  status text DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'skipped', 'delayed')
  ),
  notes text,
  contact_id uuid REFERENCES contacts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid REFERENCES auth.users(id),
  encrypted_content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (
    message_type IN ('text', 'image', 'file', 'system')
  ),
  attachments jsonb,
  read_by uuid[],
  edited boolean DEFAULT false,
  edited_at timestamptz,
  parent_message_id uuid REFERENCES chat_messages(id),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  type text DEFAULT 'direct' CHECK (
    type IN ('direct', 'group', 'channel')
  ),
  participants uuid[] NOT NULL,
  settings jsonb,
  last_message_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  folder_path text,
  file_type text NOT NULL,
  size integer NOT NULL,
  encrypted_content text,
  version integer DEFAULT 1,
  status text DEFAULT 'draft' CHECK (
    status IN ('draft', 'published', 'archived', 'deleted')
  ),
  security_level text DEFAULT 'internal' CHECK (
    security_level IN ('public', 'internal', 'confidential', 'restricted')
  ),
  tags text[],
  related_to_type text CHECK (related_to_type IN ('contact', 'company', 'deal', 'project')),
  related_to_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id),
  version_number integer NOT NULL,
  encrypted_content text NOT NULL,
  change_summary text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- Document Shares Table
CREATE TABLE IF NOT EXISTS document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id),
  shared_with uuid REFERENCES auth.users(id),
  permission_level text DEFAULT 'view' CHECK (
    permission_level IN ('view', 'comment', 'edit')
  ),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_routes_date ON routes(date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_path);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Add audit logging triggers
CREATE TRIGGER audit_calendar_events
  AFTER INSERT OR UPDATE OR DELETE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_email_messages
  AFTER INSERT OR UPDATE OR DELETE ON email_messages
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Basic RLS policies for each table
CREATE POLICY "Users can manage their own calendar events"
  ON calendar_events
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own email messages"
  ON email_messages
  USING (created_by = auth.uid());

CREATE POLICY "Users can access projects they are team members of"
  ON projects
  USING (
    created_by = auth.uid() OR
    auth.uid() = ANY(team_members)
  );

CREATE POLICY "Users can access routes assigned to them"
  ON routes
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Users can access their chat conversations"
  ON chat_conversations
  USING (
    created_by = auth.uid() OR
    auth.uid() = ANY(participants)
  );

CREATE POLICY "Users can access documents shared with them"
  ON documents
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM document_shares
      WHERE document_shares.document_id = documents.id
      AND document_shares.shared_with = auth.uid()
    )
  );