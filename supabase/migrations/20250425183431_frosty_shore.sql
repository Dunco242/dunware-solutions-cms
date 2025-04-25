/*
  # Fix activities relationships

  1. Changes
    - Add foreign key constraints for activities table to properly link with companies, contacts, and deals
    - Add indexes for better query performance

  2. Security
    - Enable RLS on activities table
    - Add policy for users to access activities they are involved with
*/

-- Add foreign key constraints for activities
ALTER TABLE activities
ADD CONSTRAINT activities_company_id_fkey
FOREIGN KEY (related_to_id) REFERENCES companies(id)
WHERE related_to_type = 'company';

ALTER TABLE activities
ADD CONSTRAINT activities_contact_id_fkey
FOREIGN KEY (related_to_id) REFERENCES contacts(id)
WHERE related_to_type = 'contact';

ALTER TABLE activities
ADD CONSTRAINT activities_deal_id_fkey
FOREIGN KEY (related_to_id) REFERENCES deals(id)
WHERE related_to_type = 'deal';

-- Add indexes for better performance
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Users can access activities they are involved with"
ON activities
FOR ALL
TO authenticated
USING (
  (created_by = auth.uid()) OR 
  (assigned_to = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = activities.related_to_id 
    AND activities.related_to_type = 'company'
    AND (companies.created_by = auth.uid() OR companies.assigned_to = auth.uid())
  )) OR
  (EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = activities.related_to_id 
    AND activities.related_to_type = 'contact'
    AND (contacts.created_by = auth.uid() OR contacts.assigned_to = auth.uid())
  )) OR
  (EXISTS (
    SELECT 1 FROM deals 
    WHERE deals.id = activities.related_to_id 
    AND activities.related_to_type = 'deal'
    AND (deals.created_by = auth.uid() OR deals.assigned_to = auth.uid())
  ))
);