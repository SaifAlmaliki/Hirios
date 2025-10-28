-- Simple signup trigger: Only create empty company profile
-- Users will fill out company details on /company-setup page
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create empty company profile with just user_id, role, and email
  INSERT INTO public.company_profiles (
    user_id,
    role,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'owner',
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate errors
  
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

-- Done! Users can now register and fill out company details later on /company-setup
