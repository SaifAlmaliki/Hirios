-- Fix: Save company data from user metadata during registration
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create company profile with data from user metadata
  INSERT INTO public.company_profiles (
    user_id,
    role,
    email,
    company_name,
    company_website,
    company_description,
    company_size,
    industry,
    address,
    phone,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'owner',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    NEW.raw_user_meta_data->>'company_website',
    NEW.raw_user_meta_data->>'company_description',
    NEW.raw_user_meta_data->>'company_size',
    NEW.raw_user_meta_data->>'industry',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    company_name = COALESCE(EXCLUDED.company_name, company_profiles.company_name),
    company_website = COALESCE(EXCLUDED.company_website, company_profiles.company_website),
    company_description = COALESCE(EXCLUDED.company_description, company_profiles.company_description),
    company_size = COALESCE(EXCLUDED.company_size, company_profiles.company_size),
    industry = COALESCE(EXCLUDED.industry, company_profiles.industry),
    address = COALESCE(EXCLUDED.address, company_profiles.address),
    phone = COALESCE(EXCLUDED.phone, company_profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();

-- Test: Check if the function works
-- You can verify by registering a new user and checking the company_profiles table
