-- Migration: Add email column to company_profiles and populate it
-- This stores user emails directly in company_profiles for easy access

-- Step 1: Add email column (if not already added manually)
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS email text;

-- Step 2: Populate existing emails from auth.users
-- This requires running as a one-time script or manually updating
-- Note: This query needs to be run with service role access
-- UPDATE public.company_profiles cp
-- SET email = (
--   SELECT au.email 
--   FROM auth.users au 
--   WHERE au.id = cp.user_id
-- )
-- WHERE cp.email IS NULL;

-- Step 3: Create a function to automatically set email on profile creation
CREATE OR REPLACE FUNCTION public.set_company_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the email from auth.users
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to auto-populate email on INSERT
DROP TRIGGER IF EXISTS set_email_on_company_profile_insert ON public.company_profiles;
CREATE TRIGGER set_email_on_company_profile_insert
  BEFORE INSERT ON public.company_profiles
  FOR EACH ROW
  WHEN (NEW.email IS NULL)
  EXECUTE FUNCTION public.set_company_profile_email();

-- Step 5: Update the accept_team_invitation function to include email
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation record;
  v_new_profile_id uuid;
  v_user_email text;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM team_invitations
  WHERE token = invitation_token AND used = false;

  -- Check if invitation exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
  END IF;

  -- Get the current user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Verify the email matches
  IF v_user_email != v_invitation.invited_email THEN
    RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Get the company details from the inviter's profile
  DECLARE
    v_company_name text;
    v_company_description text;
    v_company_website text;
    v_company_size text;
    v_industry text;
    v_address text;
    v_phone text;
    v_logo_url text;
  BEGIN
    SELECT 
      company_name, company_description, company_website, 
      company_size, industry, address, phone, logo_url
    INTO 
      v_company_name, v_company_description, v_company_website,
      v_company_size, v_industry, v_address, v_phone, v_logo_url
    FROM company_profiles
    WHERE id = v_invitation.company_profile_id;

    -- Create new company profile for the member
    INSERT INTO company_profiles (
      user_id, 
      company_name, 
      company_description, 
      company_website,
      company_size, 
      industry, 
      address, 
      phone, 
      logo_url,
      role,
      email
    ) VALUES (
      auth.uid(),
      v_company_name,
      v_company_description,
      v_company_website,
      v_company_size,
      v_industry,
      v_address,
      v_phone,
      v_logo_url,
      'member',
      v_user_email
    )
    RETURNING id INTO v_new_profile_id;

    -- Mark invitation as used
    UPDATE team_invitations
    SET used = true
    WHERE id = v_invitation.id;

    RETURN json_build_object('success', true, 'profile_id', v_new_profile_id);
  END;
END;
$$;
