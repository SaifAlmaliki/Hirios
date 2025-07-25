-- TEMPORARY FIX for RLS Policy Issue
-- Run this in your Supabase SQL Editor to allow voice screening updates

-- Option 1: Temporarily allow all authenticated users to update screening results
-- (Use this if you want a quick fix)
DROP POLICY IF EXISTS "Premium users can update screening results" ON public.screening_results;

CREATE POLICY "Authenticated users can update screening results" 
  ON public.screening_results 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Option 2: Create a more permissive policy for company users
-- (Use this if you want to be more specific)
/*
DROP POLICY IF EXISTS "Premium users can update screening results" ON public.screening_results;

CREATE POLICY "Company users can update screening results" 
  ON public.screening_results 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid()
    )
  );
*/

-- Option 3: Completely disable RLS temporarily for testing
-- (ONLY use this for testing - NOT for production)
/*
ALTER TABLE public.screening_results DISABLE ROW LEVEL SECURITY;
*/

-- After you're done testing, you can restore the original policy:
/*
DROP POLICY IF EXISTS "Authenticated users can update screening results" ON public.screening_results;

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
*/ 