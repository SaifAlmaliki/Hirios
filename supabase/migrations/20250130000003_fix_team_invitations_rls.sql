-- Migration: Fix team_invitations RLS policies - OWNERS ONLY
-- Only account owners can view, create, and delete team invitations
-- Date: 2025-01-30

-- Drop all existing policies on team_invitations to start fresh
DROP POLICY IF EXISTS "Owners can view team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can read company invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Only owners can create team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can delete team invitations" ON public.team_invitations;

-- SELECT: Only owners can view invitations for their company
CREATE POLICY "Owners can view team invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- INSERT: Only owners can create invitations
CREATE POLICY "Only owners can create team invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- DELETE: Only owners can delete invitations
CREATE POLICY "Owners can delete team invitations"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- Ensure the public/anon policy still exists for reading invitations by token (for signup)
-- This should already exist but ensure it's there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations'
      AND policyname = 'Public can read invitation by token'
  ) THEN
    CREATE POLICY "Public can read invitation by token"
    ON public.team_invitations
    FOR SELECT
    TO anon
    USING (true);
  END IF;
END $$;

