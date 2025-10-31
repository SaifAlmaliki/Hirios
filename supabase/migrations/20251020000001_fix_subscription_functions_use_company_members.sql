-- Migration: Fix subscription functions to use company_members instead of user_id
-- Date: 2025-10-20
-- This fixes the broken functions that were created with old schema references

-- Fix is_subscription_active function to use company_members
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_company_profile_id uuid;
BEGIN
  -- Get the user's company profile ID from company_members
  SELECT company_profile_id INTO v_company_profile_id
  FROM public.company_members
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If no membership found, return false
  IF v_company_profile_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get subscription details
  SELECT 
    subscription_plan,
    trial_expires_at,
    subscription_expires_at
  INTO v_profile
  FROM public.company_profiles
  WHERE id = v_company_profile_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Trial plan - check if not expired
  IF v_profile.subscription_plan = 'trial' THEN
    RETURN v_profile.trial_expires_at IS NULL OR v_profile.trial_expires_at > NOW();
  END IF;

  -- Paid plan - check if subscription not expired
  IF v_profile.subscription_plan = 'paid' THEN
    RETURN v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > NOW();
  END IF;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.is_subscription_active(uuid) IS 
  'Checks if user subscription (trial or paid) is currently active';

-- Fix start_trial_if_needed function to use company_members (this was already fixed in 20251020000000, but ensuring consistency)
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

