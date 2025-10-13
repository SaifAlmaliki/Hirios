-- Update start_trial_if_needed function (already correct in main migration)
-- This migration ensures the function is consistent
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

COMMENT ON FUNCTION public.start_trial_if_needed(uuid) IS 
  'Starts 7-day trial on first login for trial users who haven''t started trial yet';

