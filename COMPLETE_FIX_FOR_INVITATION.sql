-- Complete fix for invitation flow
-- Run this in Supabase SQL Editor

-- Step 1: Delete the wrongly created profile for saif.wsm@gmail.com
DELETE FROM company_profiles 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'saif.wsm@gmail.com'
);

-- Step 2: Ensure the trigger is correct (with better error handling)
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation_count integer;
BEGIN
  -- Check if this user has a pending invitation
  BEGIN
    SELECT COUNT(*) INTO v_pending_invitation_count
    FROM team_invitations
    WHERE invited_email = NEW.email
      AND used = false;
  EXCEPTION
    WHEN OTHERS THEN
      v_pending_invitation_count := 0;
      RAISE WARNING 'Error checking invitations for %: %', NEW.email, SQLERRM;
  END;

  -- If there's a pending invitation, skip profile creation
  IF v_pending_invitation_count > 0 THEN
    RAISE NOTICE 'User % has % pending invitation(s), skipping profile creation', NEW.email, v_pending_invitation_count;
    RETURN NEW;
  END IF;

  -- No invitation, create profile as owner
  BEGIN
    INSERT INTO public.company_profiles (
      user_id, role, email, created_at, updated_at
    ) VALUES (
      NEW.id, 'owner', NEW.email, NOW(), NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created company profile for user %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating company profile for %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();

-- Step 4: Verify the setup
SELECT 
    'Verification' as step,
    COUNT(*) as pending_invitations
FROM team_invitations
WHERE invited_email = 'saif.wsm@gmail.com'
  AND used = false;

-- Step 5: Now have the user log in and manually go to the invitation link
-- https://hirios.com/join/4e00c1a1-6493-4666-a0cf-726ef457ac5c
