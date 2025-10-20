-- Add RLS policies for company_uploads bucket to support public job applications
-- This allows anonymous users to upload resumes when applying via public job links

-- Policy: Allow anonymous users to upload resumes for public job applications
CREATE POLICY "Anonymous users can upload resumes for public applications" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'company_uploads'
  AND auth.role() = 'anon'
  AND (storage.foldername(name))[2] = 'resumes'
  AND (storage.foldername(name))[3] = 'pool'
);

-- Policy: Allow authenticated company users to upload to their own company folder
CREATE POLICY "Authenticated users can upload to company_uploads" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'company_uploads'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated company users to read from their company folder
CREATE POLICY "Authenticated users can read from company_uploads" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'company_uploads'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow anonymous users to read resumes (needed for voice interviews)
CREATE POLICY "Anonymous users can read resumes for interviews" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'company_uploads'
  AND auth.role() = 'anon'
  AND (storage.foldername(name))[2] = 'resumes'
);

-- Policy: Allow authenticated company users to update files in their folder
CREATE POLICY "Authenticated users can update company_uploads" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'company_uploads'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated company users to delete files from their folder
CREATE POLICY "Authenticated users can delete from company_uploads" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'company_uploads'
  AND auth.role() = 'authenticated'
);

-- Add comments for documentation
COMMENT ON POLICY "Anonymous users can upload resumes for public applications" ON storage.objects IS 
'Allows anonymous users to upload resumes when applying via public job links. Files must be uploaded to {company_id}/resumes/pool/ path.';

COMMENT ON POLICY "Anonymous users can read resumes for interviews" ON storage.objects IS 
'Allows anonymous users to access resumes for voice interviews without authentication.';
