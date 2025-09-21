-- Add storage_path field to applications table
ALTER TABLE applications 
ADD COLUMN storage_path TEXT;

-- Add index for storage_path for better performance
CREATE INDEX IF NOT EXISTS idx_applications_storage_path ON applications(storage_path);

-- Update existing records to have storage_path (optional - for migration)
-- This will be empty for existing records, but new uploads will populate it
UPDATE applications 
SET storage_path = '' 
WHERE storage_path IS NULL;
