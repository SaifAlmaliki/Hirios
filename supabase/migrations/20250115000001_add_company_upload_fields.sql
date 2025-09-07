-- Add fields to applications table for company-uploaded resumes
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS upload_source TEXT DEFAULT 'job_seeker' CHECK (upload_source IN ('job_seeker', 'company_upload')),
ADD COLUMN IF NOT EXISTS uploaded_by_company BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uploaded_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS processing_error TEXT,
ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Create index for better performance on company uploads
CREATE INDEX IF NOT EXISTS idx_applications_upload_source ON public.applications(upload_source);
CREATE INDEX IF NOT EXISTS idx_applications_uploaded_by_company ON public.applications(uploaded_by_company);
CREATE INDEX IF NOT EXISTS idx_applications_processing_status ON public.applications(processing_status);

-- Add comment to document the purpose
COMMENT ON COLUMN public.applications.upload_source IS 'Source of the application: job_seeker or company_upload';
COMMENT ON COLUMN public.applications.uploaded_by_company IS 'Whether this application was uploaded by a company user';
COMMENT ON COLUMN public.applications.uploaded_by_user_id IS 'User ID of the company user who uploaded this resume';
COMMENT ON COLUMN public.applications.processing_status IS 'Status of AI processing: pending, processing, completed, failed';
COMMENT ON COLUMN public.applications.processing_error IS 'Error message if processing failed';
COMMENT ON COLUMN public.applications.original_filename IS 'Original filename of the uploaded resume';

-- Create the company_uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company_uploads', 'company_uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy to allow company users to upload resumes
CREATE POLICY "Company users can upload resumes" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'company_uploads' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Create RLS policy to allow company users to view their uploaded resumes
CREATE POLICY "Company users can view their uploaded resumes" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'company_uploads' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Create RLS policy to allow company users to delete their uploaded resumes
CREATE POLICY "Company users can delete their uploaded resumes" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'company_uploads' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  );
