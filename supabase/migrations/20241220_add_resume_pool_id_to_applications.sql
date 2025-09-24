-- Add resume_pool_id field to applications table to track which resume pool item was used
ALTER TABLE applications 
ADD COLUMN resume_pool_id UUID REFERENCES resume_pool(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_applications_resume_pool_id ON applications(resume_pool_id);

-- Add comment to explain the field
COMMENT ON COLUMN applications.resume_pool_id IS 'References the resume_pool item that was used to create this application. NULL for applications created from direct uploads.';
