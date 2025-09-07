-- Migration to remove job seeker functionality and make platform B2B only
-- This migration removes user_type logic and simplifies the platform for companies only

-- Remove user_type column from profiles table since all users are now companies
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;

-- Update any existing profiles to ensure they're treated as companies
-- (This is a safety measure, though user_type is being removed)
UPDATE public.profiles SET user_type = 'company' WHERE user_type IS NOT NULL;

-- Remove any job seeker specific indexes or constraints if they exist
-- (Most of these would have been removed in previous migrations)

-- Add a comment to document the B2B nature
COMMENT ON TABLE public.profiles IS 'Company user profiles only - B2B platform';

-- Ensure all existing users are treated as companies
-- This is a safety measure for any existing data
UPDATE public.profiles SET user_type = 'company' WHERE user_type IS NULL OR user_type != 'company';

-- Remove the user_type column after ensuring all data is consistent
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;

-- Update RLS policies to reflect B2B nature
-- Remove any job seeker specific policies and ensure all policies are company-focused

-- Update the profiles RLS policy to be company-focused
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simplified company-focused policies
CREATE POLICY "Companies can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Companies can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Companies can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add comment to document the B2B transformation
COMMENT ON SCHEMA public IS 'B2B Resume Screening Platform - Companies only';
