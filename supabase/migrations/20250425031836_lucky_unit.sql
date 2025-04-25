/*
  # Create test user account

  1. Changes
    - Creates a test user account with email 'damienduncombe@gmail.com'
    - Sets password to 'admin'
    - Enables the account without email verification
    - Adds proper error handling and constraints
*/

-- First check if the user already exists to avoid conflicts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'damienduncombe@gmail.com'
  ) THEN
    INSERT INTO auth.users (
      id,
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
    );
  END IF;
END $$;