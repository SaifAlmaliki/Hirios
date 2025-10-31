-- Migration: Update trial period from 7 days to 14 days for new users
-- Date: 2025-10-20
-- Note: This only affects new registrations. Existing users keep their current trial period.

-- Update start_trial_if_needed function to use 14 days instead of 7 days
CREATE OR REPLACE FUNCTION public.start_trial_if_needed(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_profile_id uuid;
BEGIN
  -- Get the user's company profile ID from company_members
  SELECT company_profile_id INTO v_company_profile_id
  FROM public.company_members
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If no membership found, return (user might not have a company yet)
  IF v_company_profile_id IS NULL THEN
    RETURN;
  END IF;

  -- Update the company profile
  -- Only updates if trial_started_at IS NULL (new users only)
  UPDATE public.company_profiles
  SET 
    trial_started_at = NOW(),
    trial_expires_at = NOW() + INTERVAL '14 days',
    subscription_plan = 'trial'
  WHERE 
    id = v_company_profile_id
    AND trial_started_at IS NULL
    AND subscription_plan = 'trial';
END;
$$;

COMMENT ON FUNCTION public.start_trial_if_needed(uuid) IS 
  'Starts 14-day trial on first login for trial users who haven''t started trial yet';

