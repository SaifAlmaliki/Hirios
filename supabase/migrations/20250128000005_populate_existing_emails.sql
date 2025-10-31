-- Migration: Populate existing company_profiles with emails from auth.users
-- This is a one-time data migration to backfill emails

-- Update all company_profiles that don't have an email set
UPDATE public.company_profiles cp
SET email = au.email
FROM auth.users au
WHERE cp.user_id = au.id
  AND cp.email IS NULL;
