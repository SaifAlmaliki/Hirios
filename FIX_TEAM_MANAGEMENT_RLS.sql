-- Fix: Update RLS policy to allow owners to query invitations by company_profile_id
-- The Team Management page needs to fetch invitations for the owner's company
-- Run this in Supabase SQL Editor

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Owners can view team invitations" ON public.team_invitations;

-- Create a better policy that allows owners to view invitations for their company
CREATE POLICY "Owners can view their company invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    -- Allow if user is querying by their company_profile_id
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
    OR
    -- Also allow if user is the one who sent the invitation
    invited_by = auth.uid()
);

-- Verify all policies are correct
SELECT 
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'team_invitations'
ORDER BY policyname;
