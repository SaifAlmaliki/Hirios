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
CREATE OR REPLACE FUNCTION public.start_trial_if_needed(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.company_profiles
  SET 
    trial_started_at = NOW(),
    trial_expires_at = NOW() + INTERVAL '7 days',
    subscription_plan = 'trial'
  WHERE 
    user_id = p_user_id 
    AND trial_started_at IS NULL
    AND subscription_plan = 'trial';
END;
$$;

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT 
    subscription_plan,
    trial_expires_at,
    subscription_expires_at
  INTO v_profile
  FROM public.company_profiles
  WHERE user_id = p_user_id;

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

