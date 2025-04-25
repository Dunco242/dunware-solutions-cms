/*
  # Fix RLS policies to prevent infinite recursion

  1. Changes
    - Remove circular references in companies RLS policy
    - Simplify policy to check direct user relationships
    - Fix auth role check syntax
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view companies they have access to" ON companies;

-- Create new, simplified policies for companies
CREATE POLICY "Users can view their own companies"
ON companies
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid()
);

-- Add policy for managers and admins
CREATE POLICY "Managers and admins can view all companies"
ON companies
FOR SELECT
TO authenticated
USING (
  jsonb_path_exists(current_setting('request.jwt.claims', true)::jsonb#>'{app_metadata,roles}', '$[*] ? (@ == "admin" || @ == "manager")')
);

-- Update deals policy to avoid recursion
DROP POLICY IF EXISTS "Users can access their own deals" ON deals;
CREATE POLICY "Users can access their own deals"
ON deals
FOR ALL
TO authenticated
USING (
  created_by = auth.uid() OR
  assigned_to = auth.uid() OR
  company_id IN (
    SELECT id FROM companies
    WHERE created_by = auth.uid() OR assigned_to = auth.uid()
  )
);

-- Update contacts policy to avoid recursion
DROP POLICY IF EXISTS "Users can access their own contacts" ON contacts;
CREATE POLICY "Users can access their own contacts"
ON contacts
FOR ALL
TO authenticated
USING (
  created_by = auth.uid() OR
  assigned_to = auth.uid() OR
  company_id IN (
    SELECT id FROM companies
    WHERE created_by = auth.uid() OR assigned_to = auth.uid()
  )
);