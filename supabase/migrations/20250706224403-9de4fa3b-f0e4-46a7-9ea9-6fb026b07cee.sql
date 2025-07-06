
-- Create the resumes storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy to allow anyone to upload resumes (for job applications)
CREATE POLICY "Anyone can upload resumes" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'resumes');

-- Create RLS policy to allow anyone to view resumes (for recruiters)
CREATE POLICY "Anyone can view resumes" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'resumes');

-- Create RLS policy to allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'resumes');
