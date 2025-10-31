-- Migration: Final working RLS policy for team_invitations
-- Date: 2025-10-31
-- Simple approach: If you created the invitation (invited_by = auth.uid()), you can see it
-- This avoids all the recursion issues with company_members checks

-- Drop ALL existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'team_invitations' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.team_invitations';
    END LOOP;
END $$;

-- SELECT: Users can view invitations they created
CREATE POLICY "team_invitations_select_own"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (invited_by = auth.uid());

-- INSERT: Users can create invitations (ownership checked by edge function)
CREATE POLICY "team_invitations_insert"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (invited_by = auth.uid());

-- DELETE: Users can delete invitations they created
CREATE POLICY "team_invitations_delete_own"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (invited_by = auth.uid());

-- Public/anon can read by token (for signup flow)
CREATE POLICY "team_invitations_select_public"
ON public.team_invitations
FOR SELECT
TO anon
USING (true);

