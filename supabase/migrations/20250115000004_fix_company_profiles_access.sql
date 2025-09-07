-- Fix company_profiles table access issues
-- This migration ensures the company_profiles table exists and has proper RLS policies

-- Create company_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  company_website TEXT,
  company_size TEXT,
  industry TEXT,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on company_profiles table
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Companies can view their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can update their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can insert their own profile" ON public.company_profiles;

-- Create RLS policies for company_profiles
CREATE POLICY "Companies can view their own profile" 
  ON public.company_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can update their own profile" 
  ON public.company_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can insert their own profile" 
  ON public.company_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create a function to automatically create a company profile for new users
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Only create company profile if user_type is 'company' or if no user_type is specified (default to company for B2B)
  IF NEW.raw_user_meta_data ->> 'user_type' = 'company' OR NEW.raw_user_meta_data ->> 'user_type' IS NULL THEN
    INSERT INTO public.company_profiles (user_id, company_name, subscription_status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
      'inactive'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create company profile
DROP TRIGGER IF EXISTS on_auth_user_created_company_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_company_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_company_profile_for_user();

-- Create company profiles for existing users who don't have one
INSERT INTO public.company_profiles (user_id, company_name, subscription_status)
SELECT 
  p.id,
  COALESCE(p.email, 'My Company'),
  'inactive'
FROM public.profiles p
LEFT JOIN public.company_profiles cp ON p.id = cp.user_id
WHERE cp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Add comment to document the B2B nature
COMMENT ON TABLE public.company_profiles IS 'Company profiles for B2B platform - all users are companies';
