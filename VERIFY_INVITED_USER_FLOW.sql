-- Verify the invited user registration flow
-- Run this in Supabase SQL Editor

-- 1. Check if saif.wsm@gmail.com was created in auth.users
SELECT 
    'User Created' as status,
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Not Confirmed'
    END as email_status
FROM auth.users
WHERE email = 'saif.wsm@gmail.com';

-- 2. Check if they have a company profile (should be NONE if invitation flow is working)
SELECT 
    'Company Profile' as status,
    cp.id,
    cp.email,
    cp.company_name,
    cp.role
FROM company_profiles cp
JOIN auth.users au ON cp.user_id = au.id
WHERE au.email = 'saif.wsm@gmail.com';

-- 3. Check if they have a pending invitation
SELECT 
    'Pending Invitation' as status,
    invited_email,
    used,
    token,
    created_at
FROM team_invitations
WHERE invited_email = 'saif.wsm@gmail.com'
ORDER BY created_at DESC;

-- Expected results:
-- 1. User should exist in auth.users
-- 2. User should NOT have a company profile yet
-- 3. User should have a pending invitation with used = false

-- If user has a profile, delete it for testing:
-- DELETE FROM company_profiles 
-- WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'saif.wsm@gmail.com');
