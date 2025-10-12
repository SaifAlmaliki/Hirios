-- Convert any existing users with 'free' to 'trial'
-- This migrates all free users to the new trial system
UPDATE public.company_profiles
SET subscription_plan = 'trial'
WHERE subscription_plan = 'free' 
  AND trial_started_at IS NULL;

-- Log the conversion
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Converted % users from free to trial plan', updated_count;
END $$;

