-- Debug: Check why Team Management is slow
-- Run this in Supabase SQL Editor while logged in as the owner

-- 1. Check current user's profile
SELECT 
    'Current Profile' as check_type,
    id,
    user_id,
    email,
    company_name,
    role
FROM company_profiles
WHERE user_id = auth.uid();

-- 2. Check if company_name is null
SELECT 
    'Company Name Check' as check_type,
    CASE 
        WHEN company_name IS NULL THEN 'NULL - This is the problem!'
        ELSE company_name
    END as company_name_status
FROM company_profiles
WHERE user_id = auth.uid();

-- 3. Try the team members query
SELECT 
    'Team Members Query' as check_type,
    id,
    email,
    company_name,
    role
FROM company_profiles
WHERE company_name = (
    SELECT company_name FROM company_profiles WHERE user_id = auth.uid()
);

-- 4. Try the invitations query
SELECT 
    'Invitations Query' as check_type,
    invited_email,
    used,
    created_at
FROM team_invitations
WHERE company_profile_id = (
    SELECT id FROM company_profiles WHERE user_id = auth.uid()
)
AND used = false;

-- 5. Check RLS policies on company_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'company_profiles'
  AND cmd = 'SELECT'
ORDER BY policyname;
