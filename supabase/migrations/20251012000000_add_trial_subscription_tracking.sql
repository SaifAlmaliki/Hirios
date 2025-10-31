-- Add trial and subscription tracking fields to company_profiles
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- Update subscription_plan to allow 'trial' and 'paid' values only
COMMENT ON COLUMN public.company_profiles.subscription_plan IS 
  'Subscription plan: trial (14 days free trial), paid (yearly subscription)';

-- Update default subscription plan for new users to 'trial'
ALTER TABLE public.company_profiles 
  ALTER COLUMN subscription_plan SET DEFAULT 'trial';

-- Add index for trial tracking queries
CREATE INDEX IF NOT EXISTS idx_company_profiles_trial_started_at 
  ON public.company_profiles USING btree (trial_started_at) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_company_profiles_trial_expires_at 
  ON public.company_profiles USING btree (trial_expires_at) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_company_profiles_subscription_expires_at 
  ON public.company_profiles USING btree (subscription_expires_at) 
  TABLESPACE pg_default;

-- Function to start trial on first login
-- Note: Uses company_members to find company profile (no user_id in company_profiles)
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
  UPDATE public.company_profiles
  SET 
    trial_started_at = NOW(),
    trial_expires_at = NOW() + INTERVAL '7 days',
    subscription_plan = 'trial'
  WHERE 
    id = v_company_profile_id
    AND trial_started_at IS NULL
    AND subscription_plan = 'trial';
END;
$$;

-- Function to check if subscription is active
-- Note: Uses company_members to find company profile (no user_id in company_profiles)
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

COMMENT ON FUNCTION public.start_trial_if_needed(uuid) IS 
  'Starts 14-day trial on first login for trial users';

COMMENT ON FUNCTION public.is_subscription_active(uuid) IS 
  'Checks if user subscription (trial or paid) is currently active';

