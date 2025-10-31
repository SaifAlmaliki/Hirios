-- Migration: Cleanup duplicate company_profiles and company_members
-- This fixes cases where users have multiple profiles/memberships due to trigger running multiple times
-- Date: 2025-01-30

-- Step 1: Cleanup duplicate company_members
-- Keep only the first membership for each user (by created_at)
WITH ranked_memberships AS (
  SELECT 
    id,
    company_profile_id,
    user_id,
    role,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY created_at ASC
    ) as rn
  FROM public.company_members
)
DELETE FROM public.company_members
WHERE id IN (
  SELECT id FROM ranked_memberships WHERE rn > 1
);

-- Step 2: Cleanup duplicate company_profiles that have no members
-- Delete company_profiles that don't have any members in company_members
DELETE FROM public.company_profiles
WHERE id NOT IN (
  SELECT DISTINCT company_profile_id 
  FROM public.company_members
);

-- Step 3: Verify no duplicates remain
-- This will show if there are still duplicates (should return 0)
DO $$
DECLARE
  duplicate_count integer;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM public.company_members
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Warning: % users still have duplicate memberships', duplicate_count;
  ELSE
    RAISE NOTICE 'Success: No duplicate memberships found';
  END IF;
END $$;

