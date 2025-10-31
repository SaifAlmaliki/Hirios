-- Check the status of the invitation
-- Run this in Supabase SQL Editor to debug

-- 1. Check the specific invitation
SELECT 
    id,
    invited_email,
    token,
    used,
    created_at,
    company_profile_id
FROM team_invitations
WHERE token = '59d158cc-cb9d-4649-9dc1-f584801e5ccf';

-- 2. Check if user saif.wsm@gmail.com exists
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'saif.wsm@gmail.com';

-- 3. Check if user has a company profile
SELECT 
    cp.id,
    cp.user_id,
    cp.email,
    cp.company_name,
    cp.role,
    au.email as user_email
FROM company_profiles cp
LEFT JOIN auth.users au ON cp.user_id = au.id
WHERE au.email = 'saif.wsm@gmail.com';

-- 4. If invitation was already used, reset it for testing
-- UNCOMMENT ONLY IF YOU WANT TO RESET THE INVITATION:
-- UPDATE team_invitations
-- SET used = false
-- WHERE token = '59d158cc-cb9d-4649-9dc1-f584801e5ccf';

-- 5. If user has wrong profile, delete it for testing
-- UNCOMMENT ONLY IF YOU WANT TO DELETE THE PROFILE:
-- DELETE FROM company_profiles
-- WHERE user_id IN (
--     SELECT id FROM auth.users WHERE email = 'saif.wsm@gmail.com'
-- );
