
-- Update the RLS policy for jobs table to allow companies to insert jobs without subscription requirement
DROP POLICY IF EXISTS "Companies with active subscriptions can insert jobs" ON public.jobs;

-- Create a new policy that allows companies to insert jobs if they have a company profile
CREATE POLICY "Companies can insert jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = jobs.company_profile_id
    )
  );
