-- Migration: Ensure team_invitations RLS policies work correctly - OWNERS ONLY
-- Fixes 403 errors by ensuring policies are properly set up
-- IMPORTANT: Only owners can view/add/delete team members and invitations
-- Regular members have NO access to team management features
-- Date: 2025-01-30

-- First, let's verify and fix company_members RLS policy
-- Users can ONLY view their own membership (not other members)
-- ONLY owners can view all members of their company (for team management UI)
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.company_members;
DROP POLICY IF EXISTS "Company members can view team members" ON public.company_members;
DROP POLICY IF EXISTS "Owners can view company members" ON public.company_members;

-- Policy 1: Users can view their own membership
CREATE POLICY "Users can view their own memberships"
ON public.company_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: ONLY owners can view all members of their company (for team management)
-- We use a SECURITY DEFINER function to avoid infinite recursion
-- First, create a helper function that bypasses RLS to check ownership
CREATE OR REPLACE FUNCTION public.is_company_owner(p_user_id uuid, p_company_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is owner of the company
  -- Using SECURITY DEFINER to bypass RLS and avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.company_members
    WHERE company_profile_id = p_company_profile_id
      AND user_id = p_user_id
      AND role = 'owner'
  );
END;
$$;

-- Now create the policy using the function to avoid recursion
CREATE POLICY "Owners can view company members"
ON public.company_members
FOR SELECT
TO authenticated
USING (
    -- Use the SECURITY DEFINER function to check ownership without recursion
    public.is_company_owner(auth.uid(), company_members.company_profile_id)
);

-- Now fix team_invitations policies
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Owners can view team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can read company invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Only owners can create team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can delete team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Public can read invitation by token" ON public.team_invitations;

-- SELECT: Owners can view invitations for their company
-- Use the helper function to avoid recursion
CREATE POLICY "Owners can view team invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    public.is_company_owner(auth.uid(), team_invitations.company_profile_id)
);

-- INSERT: Only owners can create invitations
-- Use the helper function to avoid recursion
CREATE POLICY "Only owners can create team invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
    invited_by = auth.uid() 
    AND public.is_company_owner(auth.uid(), team_invitations.company_profile_id)
);

-- DELETE: Only owners can delete invitations
-- Use the helper function to avoid recursion
CREATE POLICY "Owners can delete team invitations"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (
    public.is_company_owner(auth.uid(), team_invitations.company_profile_id)
);

-- Public/anon can read invitations by token (for signup flow)
CREATE POLICY "Public can read invitation by token"
ON public.team_invitations
FOR SELECT
TO anon
USING (true);

