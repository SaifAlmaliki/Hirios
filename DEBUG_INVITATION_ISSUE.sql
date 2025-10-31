-- Debug: Check for potential issues with team invitations
-- Run this in Supabase SQL Editor

-- 1. Check if the email is already invited
SELECT 
    'Already Invited' as issue,
    invited_email,
    used,
    created_at,
    token
FROM team_invitations
WHERE invited_email = 'EMAIL_TO_INVITE'  -- Replace with the email you're trying to invite
ORDER BY created_at DESC;

-- 2. Check if the user already exists with that email
SELECT 
    'User Already Exists' as issue,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'EMAIL_TO_INVITE';  -- Replace with the email you're trying to invite

-- 3. Check if user already has a company profile
SELECT 
    'User Has Profile' as issue,
    cp.id,
    cp.email,
    cp.company_name,
    cp.role,
    au.email as user_email
FROM company_profiles cp
JOIN auth.users au ON cp.user_id = au.id
WHERE au.email = 'EMAIL_TO_INVITE';  -- Replace with the email you're trying to invite

-- 4. Check SMTP configuration
SELECT 
    'SMTP Config' as check_type,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_from_email,
    smtp_from_name,
    CASE 
        WHEN smtp_password IS NOT NULL THEN 'Set'
        ELSE 'Not Set'
    END as smtp_password_status
FROM company_profiles
WHERE user_id = auth.uid();

-- 5. Check if there's a unique constraint violation
-- (This would happen if trying to invite the same email twice)
SELECT 
    constraint_name,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'team_invitations'
  AND constraint_type = 'UNIQUE';
