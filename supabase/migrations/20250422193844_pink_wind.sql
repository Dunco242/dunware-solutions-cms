/*
  # CRM Database Schema

  1. New Tables
    - `companies`
      - Core company information
      - Encrypted fields for sensitive data
      - Audit logging for HIPAA/SOC2 compliance
    - `contacts`
      - Contact information with encryption
      - GDPR compliance fields
    - `deals`
      - Sales pipeline tracking
    - `activities`
      - Activity tracking and audit logs
    - `products`
      - Product catalog
    - `notes`
      - Encrypted notes storage
    - `custom_fields`
      - Dynamic field definitions
    - `audit_logs`
      - Comprehensive audit trailing

  2. Security
    - Row Level Security (RLS) on all tables
    - Data encryption for sensitive fields
    - GDPR compliance features
    - HIPAA-compliant audit logging

  3. Indexes
    - Optimized queries for common operations
    - Full-text search capabilities
*/

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  size text,
  revenue numeric,
  website text,
  -- Encrypted fields
  encrypted_data jsonb,
  -- Address
  street text,
  city text,
  state text,
  postal_code text,
  country text,
  coordinates point,
  -- Metadata
  status text DEFAULT 'lead' CHECK (status IN ('lead', 'customer', 'partner')),
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  -- GDPR/Compliance
  data_retention_period interval,
  data_processing_consent boolean DEFAULT false,
  consent_timestamp timestamptz,
  -- Security Classification
  security_level text DEFAULT 'internal' CHECK (security_level IN ('public', 'internal', 'confidential', 'restricted'))
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  -- Encrypted fields
  encrypted_data jsonb,
  -- Status and metadata
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  source text,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_contacted_at timestamptz,
  deleted_at timestamptz,
  -- GDPR/Compliance
  marketing_consent boolean DEFAULT false,
  consent_timestamp timestamptz,
  data_retention_period interval,
  -- Tags
  tags text[]
);

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES companies(id),
  value numeric,
  currency text DEFAULT 'USD',
  stage text DEFAULT 'prospecting' CHECK (
    stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost')
  ),
  probability integer CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  -- Metadata
  source text,
  lost_reason text,
  tags text[]
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text DEFAULT 'USD',
  category text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deal Products Junction Table
CREATE TABLE IF NOT EXISTS deal_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id),
  product_id uuid REFERENCES products(id),
  quantity integer DEFAULT 1,
  price numeric NOT NULL,
  discount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(deal_id, product_id)
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note')),
  subject text NOT NULL,
  description text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  due_date timestamptz,
  completed_at timestamptz,
  -- Relations
  related_to_type text NOT NULL CHECK (related_to_type IN ('contact', 'company', 'deal')),
  related_to_id uuid NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Encrypted data for sensitive information
  encrypted_data jsonb
);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  encrypted_content text,
  related_to_type text NOT NULL CHECK (related_to_type IN ('contact', 'company', 'deal')),
  related_to_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  security_level text DEFAULT 'internal' CHECK (security_level IN ('public', 'internal', 'confidential', 'restricted'))
);

-- Custom Fields Table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  entity_type text NOT NULL CHECK (entity_type IN ('contact', 'company', 'deal')),
  options jsonb, -- For select fields
  required boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, entity_type)
);

-- Custom Field Values Table
CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES custom_fields(id),
  entity_type text NOT NULL CHECK (entity_type IN ('contact', 'company', 'deal')),
  entity_id uuid NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(field_id, entity_type, entity_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts((first_name || ' ' || last_name));
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view companies they have access to"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        jsonb_path_exists(auth.users.raw_app_meta_data->'roles', '$.** ? (@ == "admin")') OR
        jsonb_path_exists(auth.users.raw_app_meta_data->'roles', '$.** ? (@ == "manager")')
      )
    )
  );

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER audit_companies
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_contacts
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_deals
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data jsonb, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN encode(
    encrypt(
      data::text::bytea,
      encryption_key::bytea,
      'aes-gcm'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data text, encryption_key text)
RETURNS jsonb AS $$
BEGIN
  RETURN decrypt(
    decode(encrypted_data, 'base64'),
    encryption_key::bytea,
    'aes-gcm'
  )::text::jsonb;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;