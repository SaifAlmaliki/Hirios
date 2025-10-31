-- Update the trigger function to set 'trial' instead of 'free' for new users
-- Note: This function uses the refactored approach with company_members (no user_id in company_profiles)
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation_count integer;
  v_new_profile_id uuid;
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

  -- No invitation found, create a new company profile and add user as owner
  BEGIN
    -- Create company profile with 'trial' subscription plan (14 days free trial)
    INSERT INTO public.company_profiles (
      email,
      subscription_plan,
      created_at,
      updated_at
    ) VALUES (
      NEW.email,
      'trial',  -- New users start with 'trial' plan (14 days free)
      NOW(),
      NOW()
    )
    RETURNING id INTO v_new_profile_id;
    
    -- Add user as owner in company_members
    INSERT INTO public.company_members (
      company_profile_id,
      user_id,
      role,
      created_at
    ) VALUES (
      v_new_profile_id,
      NEW.id,
      'owner',
      NOW()
    );
    
    RAISE NOTICE 'Created company profile and membership for user %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
      -- Return NEW to allow user creation to succeed even if profile creation fails
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function is owned by postgres (which bypasses RLS)
ALTER FUNCTION public.create_company_profile_for_user() OWNER TO postgres;

COMMENT ON FUNCTION public.create_company_profile_for_user() IS 
  'Creates company profile with trial plan for new users on signup (uses company_members for user association)';

