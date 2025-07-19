-- Update screening_results table to match new JSON structure
-- Drop existing table and recreate with new schema

-- First, drop existing policies and table
DROP POLICY IF EXISTS "Premium users can read screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Premium users can create screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Premium users can update screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Premium users can delete screening results" ON public.screening_results;

DROP TABLE IF EXISTS public.screening_results;

-- Create new screening_results table with updated schema
CREATE TABLE public.screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  strengths TEXT,
  weaknesses TEXT,
  risk_factor TEXT,
  reward_factor TEXT,
  overall_fit INTEGER,
  justification TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;

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