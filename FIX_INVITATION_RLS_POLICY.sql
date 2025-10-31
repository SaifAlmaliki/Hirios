-- Fix: Allow authenticated users to read invitations sent to their email
-- This is needed so users can see the invitation page after logging in
-- Run this in Supabase SQL Editor

-- Add policy for authenticated users to read their own invitations
CREATE POLICY "Authenticated users can read invitations for their email"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    invited_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'team_invitations'
ORDER BY policyname;
