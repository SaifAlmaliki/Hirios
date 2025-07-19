-- Update RLS policies for screening_results to restrict access to premium users only

-- Drop existing public policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.screening_results;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.screening_results;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.screening_results;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.screening_results;

-- Create new policies that only allow access for premium users
CREATE POLICY "Premium users can read screening results" 
  ON public.screening_results 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.subscription_plan = 'premium'
      AND company_profiles.subscription_status = 'active'
    )
  );

CREATE POLICY "Premium users can create screening results" 
  ON public.screening_results 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.subscription_plan = 'premium'
      AND company_profiles.subscription_status = 'active'
    )
  );

CREATE POLICY "Premium users can update screening results" 
  ON public.screening_results 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.subscription_plan = 'premium'
      AND company_profiles.subscription_status = 'active'
    )
  );

CREATE POLICY "Premium users can delete screening results" 
  ON public.screening_results 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.subscription_plan = 'premium'
      AND company_profiles.subscription_status = 'active'
    )
  ); 