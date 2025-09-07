-- Simplify signup flow to only use company_profiles table
-- This migration streamlines the B2B signup process

-- Remove the trigger that was creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure company_profiles table has proper constraints FIRST
-- Check if unique constraint exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'company_profiles_user_id_unique'
    ) THEN
        ALTER TABLE public.company_profiles 
        ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Update the company profile creation trigger to be more robust
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create company profile for all new users (B2B platform)
  INSERT INTO public.company_profiles (
    user_id, 
    company_name, 
    company_website,
    company_description,
    company_size,
    industry,
    address,
    phone,
    subscription_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
    NEW.raw_user_meta_data ->> 'company_website',
    NEW.raw_user_meta_data ->> 'company_description',
    NEW.raw_user_meta_data ->> 'company_size',
    NEW.raw_user_meta_data ->> 'industry',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'phone',
    'inactive'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists for automatic company profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_company_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_company_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_company_profile_for_user();

-- Create company profiles for any existing users who don't have one
INSERT INTO public.company_profiles (user_id, company_name, subscription_status)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'company_name', u.email, 'My Company'),
  'inactive'
FROM auth.users u
LEFT JOIN public.company_profiles cp ON u.id = cp.user_id
WHERE cp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Add comment to document the simplified B2B structure
COMMENT ON SCHEMA public IS 'B2B Resume Screening Platform - Simplified to use only company_profiles table';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_subscription_status ON public.company_profiles(subscription_status);
