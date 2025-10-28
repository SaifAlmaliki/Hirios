-- Fix: Prevent creating new company profile for invited users
-- Only create profile if user is NOT accepting an invitation
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation record;
BEGIN
  -- Check if this user has a pending invitation
  SELECT * INTO v_pending_invitation
  FROM team_invitations
  WHERE invited_email = NEW.email
    AND used = false
  LIMIT 1;

  -- If there's a pending invitation, DON'T create a new company profile
  -- The profile will be created when they accept the invitation
  IF FOUND THEN
    RAISE NOTICE 'User % has pending invitation, skipping profile creation', NEW.email;
    RETURN NEW;
  END IF;

  -- No invitation found, create a new company profile as owner
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

-- Test: This will now work correctly for both scenarios:
-- 1. New user without invitation → Creates company profile as owner
-- 2. New user with pending invitation → Skips profile creation, waits for invitation acceptance
