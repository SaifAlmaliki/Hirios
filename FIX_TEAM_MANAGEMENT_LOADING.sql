-- Fix: Team Management page loading issues
-- The RLS policies are blocking the queries
-- Run this in Supabase SQL Editor

-- 1. Check current policies
SELECT 
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'team_invitations'
ORDER BY policyname;

-- 2. Drop all existing SELECT policies for team_invitations
DROP POLICY IF EXISTS "Owners can view team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can view their company invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Authenticated users can read invitations for their email" ON public.team_invitations;
DROP POLICY IF EXISTS "Public can read invitation by token" ON public.team_invitations;

-- 3. Create comprehensive SELECT policies

-- Policy 1: Anonymous users can read any invitation (for public invitation page)
CREATE POLICY "Anonymous can read invitations"
ON public.team_invitations
FOR SELECT
TO anon
USING (true);

-- Policy 2: Authenticated users can read invitations for their email
CREATE POLICY "Users can read their own invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    invited_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- Policy 3: Owners can read all invitations for their company
CREATE POLICY "Owners can read company invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- 4. Verify the policies
SELECT 
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'team_invitations'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 5. Test query (should return the pending invitation)
SELECT 
    invited_email,
    used,
    created_at,
    token
FROM team_invitations
WHERE company_profile_id IN (
    SELECT id FROM company_profiles WHERE user_id = auth.uid()
)
AND used = false
ORDER BY created_at DESC;
