-- Fix RLS policies to allow signup/account creation
-- This ensures database triggers can create company_profiles during signup
-- Run this in Supabase SQL Editor

-- Step 1: Add RLS policy that allows service_role to insert during signup
-- SECURITY DEFINER functions should bypass RLS when owned by postgres,
-- but adding this policy ensures the trigger can insert even if RLS is checked
-- This is critical for signup to work properly
DO $$
BEGIN
  -- Drop the policy if it exists to avoid conflicts
  DROP POLICY IF EXISTS "Service role can insert company profiles during signup" ON public.company_profiles;
  
  -- Create policy that allows service_role to insert
  -- service_role bypasses RLS in Supabase, but this ensures compatibility
  CREATE POLICY "Service role can insert company profiles during signup"
  ON public.company_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);
END $$;

-- Step 2: Ensure the trigger function exists and is correct
-- The function is SECURITY DEFINER which means it runs with the privileges of the function owner (postgres)
-- This should bypass RLS, but we've added the service_role policy above as a safety measure
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation_count integer;
BEGIN
  -- Check if this user has a pending invitation (for team invites)
  BEGIN
    SELECT COUNT(*) INTO v_pending_invitation_count
    FROM public.team_invitations
    WHERE invited_email = NEW.email
      AND used = false;
  EXCEPTION
    WHEN OTHERS THEN
      -- If there's an error checking invitations, assume no invitation
      v_pending_invitation_count := 0;
      RAISE WARNING 'Error checking invitations for %: %', NEW.email, SQLERRM;
  END;

  -- If there's a pending invitation, DON'T create a new company profile
  -- The profile will be created when they accept the invitation
  IF v_pending_invitation_count > 0 THEN
    RAISE NOTICE 'User % has % pending invitation(s), skipping profile creation', NEW.email, v_pending_invitation_count;
    RETURN NEW;
  END IF;

  -- No invitation found, create a new company profile as owner
  BEGIN
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
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created company profile for user %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      -- This prevents signup from failing due to profile creation issues
      RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
      -- Return NEW to allow user creation to succeed even if profile creation fails
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function is owned by postgres (which bypasses RLS)
ALTER FUNCTION public.create_company_profile_for_user() OWNER TO postgres;

-- Step 3: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();

-- Step 4: Verify the function has proper grants
GRANT EXECUTE ON FUNCTION public.create_company_profile_for_user() TO anon;
GRANT EXECUTE ON FUNCTION public.create_company_profile_for_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company_profile_for_user() TO service_role;

-- Step 5: Verify existing policies allow authenticated users to insert their own profile
-- This policy should already exist but we'll ensure it's there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_profiles'
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
    ON public.company_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND role = 'owner');
  END IF;
END $$;

-- Verification
SELECT 
  'RLS Policy Check' as check_type,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'company_profiles'
  AND policyname LIKE '%insert%';

SELECT 
  'Trigger Function Check' as check_type,
  COUNT(*) as function_exists
FROM pg_proc 
WHERE proname = 'create_company_profile_for_user';

SELECT 
  'Trigger Check' as check_type,
  COUNT(*) as trigger_exists
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

