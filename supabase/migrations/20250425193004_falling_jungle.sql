/*
  # Add RLS policies for auth.users table

  1. Security Changes
    - Enable RLS on auth.users table
    - Add policy for authenticated users to read user data
    - Add policy for users to update their own data
    - Add policy for users to read other users' basic info
*/

-- Enable RLS on auth.users table if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data (full access)
CREATE POLICY "Users can read own data"
ON auth.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Policy for users to read basic info of other users (limited fields)
CREATE POLICY "Users can read other users basic info"
ON auth.users
FOR SELECT
TO authenticated
USING (
  -- Allow reading other users' data that are referenced in:
  -- 1. Same project team
  -- 2. Assigned deals/tasks
  -- 3. Company assignments
  EXISTS (
    -- Check if users are in the same project
    SELECT 1 FROM public.projects
    WHERE 
      auth.uid() = ANY(team_members)
      AND id = ANY(team_members)
  )
  OR
  -- Check if user is assigned to deals/tasks
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE assigned_to = auth.users.id
    AND created_by = auth.uid()
  )
  OR
  -- Check if user is assigned to companies
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE assigned_to = auth.users.id
    AND created_by = auth.uid()
  )
);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
ON auth.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);