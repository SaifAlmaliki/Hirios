-- Fix the RLS policy for jobs table to properly allow companies to insert jobs
DROP POLICY IF EXISTS "Companies can insert jobs" ON public.jobs;

-- Create a corrected policy that allows companies to insert jobs
-- For INSERT operations, we check if the user owns a company profile
-- The company_profile_id will be validated by the application logic
CREATE POLICY "Companies can insert jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = company_profile_id
    )
  );

-- Also ensure the SELECT policy exists for reading jobs
DROP POLICY IF EXISTS "Allow public read access to jobs" ON public.jobs;
CREATE POLICY "Allow public read access to jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (true);

-- Ensure UPDATE policy exists for companies to update their own jobs
DROP POLICY IF EXISTS "Companies can update their own jobs" ON public.jobs;
CREATE POLICY "Companies can update their own jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 
      FROM company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = jobs.company_profile_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = company_profile_id
    )
  );

-- Ensure DELETE policy exists for companies to delete their own jobs
DROP POLICY IF EXISTS "Companies can delete their own jobs" ON public.jobs;
CREATE POLICY "Companies can delete their own jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 
      FROM company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = jobs.company_profile_id
    )
  );
