/*
  # Create test user account with proper password hashing

  1. Changes
    - Creates a test user account with email 'damienduncombe@gmail.com'
    - Sets password to 'admin' using proper Supabase password hashing
    - Enables the account without email verification
    - Adds email uniqueness constraint if not exists
*/

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key'
    AND conrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE auth.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END
$$;

-- Create test user with properly hashed password
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'damienduncombe@gmail.com',
  crypt('admin', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT ON CONSTRAINT users_email_key DO UPDATE SET
  encrypted_password = crypt('admin', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();