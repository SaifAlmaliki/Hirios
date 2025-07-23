-- Add resume_text column to applications table
-- This column will store extracted text content from resumes for AI processing

ALTER TABLE public.applications 
ADD COLUMN resume_text TEXT;

-- Create index for better search performance on resume text
CREATE INDEX idx_applications_resume_text ON public.applications USING gin(to_tsvector('english', resume_text));

-- Add comment to document the purpose
COMMENT ON COLUMN public.applications.resume_text IS 'Extracted text content from the resume file for AI processing and search'; 