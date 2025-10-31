-- Check if the trigger function is correct
-- Run this in Supabase SQL Editor

-- 1. Check the current trigger function
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'create_company_profile_for_user';

-- 2. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Test: Check if there's a pending invitation for the test email
SELECT 
    'Pending Invitation Check' as test,
    invited_email,
    used,
    created_at
FROM team_invitations
WHERE invited_email = 'test@example.com'  -- Replace with the email you're testing
  AND used = false;

-- 4. Check recent auth.users creation errors
-- (This won't show errors, but will show if users are being created)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
