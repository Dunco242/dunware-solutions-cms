/*
  # Add Test Data
  
  1. Users
  2. Chat conversations and messages
  3. Projects and tasks
  4. Companies and contacts
  5. Calendar events and email data
*/

-- Insert test users (passwords are 'password123')
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
  ('d0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8', 'john@example.com', '{"name": "John Doe", "avatar": "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"}'),
  ('e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9', 'sarah@example.com', '{"name": "Sarah Miller", "avatar": "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg"}'),
  ('f2f0bb3c-d3d2-6c9c-0e4h-621gg8g2ecc0', 'mike@example.com', '{"name": "Mike Wilson", "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"}');

-- Insert chat conversations
INSERT INTO chat_conversations (id, name, type, created_by, last_message_at)
VALUES 
  ('a1a1bb1b-e4e4-7d7d-1f1f-821hh9h3fdd1', 'Project Discussion', 'group', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8', now()),
  ('b2b2cc2c-f5f5-8e8e-2g2g-932ii0i4gee2', NULL, 'direct', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8', now());

-- Insert chat participants
INSERT INTO chat_conversation_participants (conversation_id, user_id)
VALUES 
  ('a1a1bb1b-e4e4-7d7d-1f1f-821hh9h3fdd1', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('a1a1bb1b-e4e4-7d7d-1f1f-821hh9h3fdd1', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9'),
  ('a1a1bb1b-e4e4-7d7d-1f1f-821hh9h3fdd1', 'f2f0bb3c-d3d2-6c9c-0e4h-621gg8g2ecc0'),
  ('b2b2cc2c-f5f5-8e8e-2g2g-932ii0i4gee2', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('b2b2cc2c-f5f5-8e8e-2g2g-932ii0i4gee2', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');

-- Insert chat messages
INSERT INTO chat_messages (conversation_id, sender_id, content, message_type)
VALUES 
  ('a1a1bb1b-e4e4-7d7d-1f1f-821hh9h3fdd1', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8', 'Hey team, how is the project going?', 'text'),
  ('a1a1bb1b-e4e4-7d7d-1f1f-821hh9h3fdd1', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9', 'Making good progress! Frontend is almost done.', 'text'),
  ('b2b2cc2c-f5f5-8e8e-2g2g-932ii0i4gee2', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8', 'Hi Sarah, can we review the designs?', 'text'),
  ('b2b2cc2c-f5f5-8e8e-2g2g-932ii0i4gee2', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9', 'Sure! I will send them over shortly.', 'text');

-- Insert companies
INSERT INTO companies (id, name, industry, size, website, status, created_by)
VALUES 
  ('c3c3dd3d-g6g6-9f9f-3h3h-043jj1j5hff3', 'Acme Corp', 'Technology', 'Enterprise', 'www.acmecorp.com', 'customer', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('d4d4ee4e-h7h7-0g0g-4i4i-154kk2k6igg4', 'TechStart Inc', 'Software', 'Startup', 'www.techstart.com', 'lead', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');

-- Insert contacts
INSERT INTO contacts (id, company_id, first_name, last_name, title, status, created_by)
VALUES 
  ('e5e5ff5f-i8i8-1h1h-5j5j-265ll3l7jhh5', 'c3c3dd3d-g6g6-9f9f-3h3h-043jj1j5hff3', 'Alice', 'Johnson', 'CTO', 'active', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('f6f6gg6g-j9j9-2i2i-6k6k-376mm4m8kii6', 'd4d4ee4e-h7h7-0g0g-4i4i-154kk2k6igg4', 'Bob', 'Smith', 'CEO', 'active', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');

-- Insert projects
INSERT INTO projects (id, name, description, status, progress, company_id, team_members, created_by)
VALUES 
  ('g7g7hh7h-k0k0-3j3j-7l7l-487nn5n9ljj7', 'Website Redesign', 'Complete overhaul of company website', 'active', 60, 'c3c3dd3d-g6g6-9f9f-3h3h-043jj1j5hff3', ARRAY['d0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9'], 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('h8h8ii8i-l1l1-4k4k-8m8m-598oo6o0mkk8', 'Mobile App', 'New mobile application development', 'planning', 20, 'd4d4ee4e-h7h7-0g0g-4i4i-154kk2k6igg4', ARRAY['e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9', 'f2f0bb3c-d3d2-6c9c-0e4h-621gg8g2ecc0'], 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');

-- Insert project tasks
INSERT INTO project_tasks (id, project_id, title, status, assigned_to, created_by)
VALUES 
  ('i9i9jj9j-m2m2-5l5l-9n9n-609pp7p1nll9', 'g7g7hh7h-k0k0-3j3j-7l7l-487nn5n9ljj7', 'Design Homepage', 'in_progress', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('j0j0kk0k-n3n3-6m6m-0o0o-710qq8q2omm0', 'h8h8ii8i-l1l1-4k4k-8m8m-598oo6o0mkk8', 'API Development', 'todo', 'f2f0bb3c-d3d2-6c9c-0e4h-621gg8g2ecc0', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');

-- Insert calendar events
INSERT INTO calendar_events (id, title, description, start_time, end_time, created_by)
VALUES 
  ('k1k1ll1l-o4o4-7n7n-1p1p-821rr9r3pnn1', 'Team Meeting', 'Weekly project sync', now() + interval '1 day', now() + interval '1 day' + interval '1 hour', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('l2l2mm2m-p5p5-8o8o-2q2q-932ss0s4qoo2', 'Client Presentation', 'Website design review', now() + interval '2 days', now() + interval '2 days' + interval '2 hours', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');

-- Insert email messages
INSERT INTO email_messages (id, subject, from_address, to_addresses, encrypted_content, created_by)
VALUES 
  ('m3m3nn3n-q6q6-9p9p-3r3r-043tt1t5rpp3', 'Project Update', 'john@example.com', ARRAY['team@example.com'], 'encrypted_content_here', 'd0d8aa1a-b1b0-4a7a-8c2f-419ee6f0caa8'),
  ('n4n4oo4o-r7r7-0q0q-4s4s-154uu2u6sqq4', 'Design Review', 'sarah@example.com', ARRAY['john@example.com'], 'encrypted_content_here', 'e1e9aa2b-c2c1-5b8b-9d3g-520ff7f1dbb9');