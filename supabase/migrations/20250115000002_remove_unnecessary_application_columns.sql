-- Remove unnecessary columns from applications table
-- These columns are either not needed or already exist in screening_results table

-- Drop indexes first
DROP INDEX IF EXISTS idx_applications_upload_source;
DROP INDEX IF EXISTS idx_applications_uploaded_by_company;
DROP INDEX IF EXISTS idx_applications_processing_status;

-- Remove columns from applications table
ALTER TABLE public.applications 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS upload_source,
DROP COLUMN IF EXISTS uploaded_by_company,
DROP COLUMN IF EXISTS processing_status,
DROP COLUMN IF EXISTS processing_error;

-- Keep uploaded_by_user_id and original_filename as they might be useful for tracking
-- Keep resume_url as it's needed for file access
-- Keep job_id and created_at as they're essential

-- Add comment to document the simplified structure
COMMENT ON TABLE public.applications IS 'Simplified applications table - stores only essential data. Detailed information is in screening_results table.';

-- Create function to insert applications with the new simplified structure
CREATE OR REPLACE FUNCTION create_application(
  p_job_id UUID,
  p_resume_url TEXT DEFAULT NULL,
  p_uploaded_by_user_id UUID DEFAULT NULL,
  p_original_filename TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  job_id UUID,
  resume_url TEXT,
  created_at TIMESTAMPTZ,
  uploaded_by_user_id UUID,
  original_filename TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.applications (job_id, resume_url, uploaded_by_user_id, original_filename)
  VALUES (p_job_id, p_resume_url, p_uploaded_by_user_id, p_original_filename)
  RETURNING applications.id, applications.job_id, applications.resume_url, applications.created_at, applications.uploaded_by_user_id, applications.original_filename;
END;
$$;
