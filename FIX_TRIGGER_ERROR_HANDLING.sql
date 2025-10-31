-- Fix: Improved trigger with better error handling
-- This version won't fail user registration even if there's an error
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation_count integer;
BEGIN
  -- Safely check if this user has a pending invitation
  BEGIN
    SELECT COUNT(*) INTO v_pending_invitation_count
    FROM team_invitations
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
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();

-- Test the trigger
SELECT 'Trigger updated successfully' as status;
