/*
  # Project Management Enhancements

  1. New Tables
    - `project_risks` - Track project risks and mitigation strategies
    - `project_time_entries` - Track billable hours and time spent
    - `project_reports` - Store project reports and analytics
    - `project_team_members` - Detailed team member assignments and roles
    - `project_budgets` - Track detailed budget information
    - `project_change_requests` - Track project changes and approvals

  2. Security
    - RLS policies for all new tables
    - Audit logging for all changes

  3. Changes
    - Add new columns to existing project tables
    - Add new indexes for performance
*/

-- Project Risks Table
CREATE TABLE IF NOT EXISTS project_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  description text,
  risk_type text CHECK (risk_type IN ('technical', 'schedule', 'cost', 'resource', 'scope', 'quality', 'other')),
  probability text CHECK (probability IN ('low', 'medium', 'high')),
  impact text CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigating', 'resolved', 'closed')),
  mitigation_strategy text,
  mitigation_owner uuid REFERENCES auth.users(id),
  contingency_plan text,
  triggers text,
  estimated_cost numeric,
  actual_cost numeric,
  identified_date date DEFAULT CURRENT_DATE,
  target_resolution_date date,
  resolved_date date,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Time Entries Table
CREATE TABLE IF NOT EXISTS project_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  task_id uuid REFERENCES project_tasks(id),
  user_id uuid REFERENCES auth.users(id),
  date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration interval,
  description text,
  billable boolean DEFAULT true,
  billing_rate numeric,
  billing_status text DEFAULT 'pending' CHECK (billing_status IN ('pending', 'billed', 'approved', 'paid')),
  invoice_id text,
  category text CHECK (category IN ('development', 'design', 'meeting', 'planning', 'testing', 'documentation', 'other')),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Reports Table
CREATE TABLE IF NOT EXISTS project_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  report_type text CHECK (report_type IN ('status', 'progress', 'financial', 'risk', 'resource', 'quality', 'custom')),
  content jsonb NOT NULL,
  metrics jsonb,
  period_start date,
  period_end date,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'archived')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  schedule_frequency text,
  next_report_date date,
  distribution_list text[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Team Members Table
CREATE TABLE IF NOT EXISTS project_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,
  allocation_percentage integer CHECK (allocation_percentage BETWEEN 0 AND 100),
  start_date date,
  end_date date,
  billing_rate numeric,
  skills text[],
  responsibilities text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  reporting_to uuid REFERENCES auth.users(id),
  performance_metrics jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Project Budgets Table
CREATE TABLE IF NOT EXISTS project_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  category text NOT NULL,
  description text,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  type text CHECK (type IN ('labor', 'material', 'equipment', 'software', 'travel', 'other')),
  period_start date,
  period_end date,
  status text DEFAULT 'approved' CHECK (status IN ('draft', 'submitted', 'approved', 'revised')),
  actual_amount numeric,
  variance numeric,
  variance_explanation text,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Change Requests Table
CREATE TABLE IF NOT EXISTS project_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  description text,
  change_type text CHECK (change_type IN ('scope', 'schedule', 'budget', 'resource', 'quality', 'other')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  impact_analysis text,
  affected_areas text[],
  estimated_cost numeric,
  estimated_schedule_impact interval,
  status text DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'implemented')),
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  implemented_at timestamptz,
  implementation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS risk_level text CHECK (risk_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS quality_metrics jsonb,
  ADD COLUMN IF NOT EXISTS success_criteria text[],
  ADD COLUMN IF NOT EXISTS stakeholders jsonb,
  ADD COLUMN IF NOT EXISTS constraints text[],
  ADD COLUMN IF NOT EXISTS assumptions text[],
  ADD COLUMN IF NOT EXISTS lessons_learned text[];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_project ON project_time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_user ON project_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_date ON project_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_project_reports_project ON project_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user ON project_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_budgets_project ON project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_change_requests_project ON project_change_requests(project_id);

-- Enable RLS
ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access project risks they are involved with"
  ON project_risks
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_risks.project_id
      AND (
        projects.created_by = auth.uid() OR
        auth.uid() = ANY(projects.team_members) OR
        project_risks.mitigation_owner = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their own time entries"
  ON project_time_entries
  USING (user_id = auth.uid());

CREATE POLICY "Users can access project reports they are involved with"
  ON project_reports
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_reports.project_id
      AND (
        projects.created_by = auth.uid() OR
        auth.uid() = ANY(projects.team_members)
      )
    )
  );

CREATE POLICY "Users can access project team members they are involved with"
  ON project_team_members
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_team_members.project_id
      AND (
        projects.created_by = auth.uid() OR
        auth.uid() = ANY(projects.team_members)
      )
    )
  );

CREATE POLICY "Users can access project budgets they are involved with"
  ON project_budgets
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_budgets.project_id
      AND (
        projects.created_by = auth.uid() OR
        auth.uid() = ANY(projects.team_members)
      )
    )
  );

CREATE POLICY "Users can access project change requests they are involved with"
  ON project_change_requests
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_change_requests.project_id
      AND (
        projects.created_by = auth.uid() OR
        auth.uid() = ANY(projects.team_members)
      )
    )
  );

-- Add audit triggers
CREATE TRIGGER audit_project_risks
  AFTER INSERT OR UPDATE OR DELETE ON project_risks
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_project_time_entries
  AFTER INSERT OR UPDATE OR DELETE ON project_time_entries
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_project_reports
  AFTER INSERT OR UPDATE OR DELETE ON project_reports
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_project_team_members
  AFTER INSERT OR UPDATE OR DELETE ON project_team_members
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_project_budgets
  AFTER INSERT OR UPDATE OR DELETE ON project_budgets
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_project_change_requests
  AFTER INSERT OR UPDATE OR DELETE ON project_change_requests
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();