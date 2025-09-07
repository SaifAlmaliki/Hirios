-- Fix company_uploads storage bucket
-- This migration ensures the company_uploads bucket exists

-- Create the company_uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company_uploads', 
  'company_uploads', 
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf'];

-- Add comment to document the bucket purpose
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads - company_uploads for company-uploaded resumes';
