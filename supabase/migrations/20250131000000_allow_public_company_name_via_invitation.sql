-- Migration: Allow public access to company_name via team_invitations
-- Date: 2025-01-31
-- This allows anonymous users to view the company name when accessing a valid team invitation
-- This fixes the "Unknown Company" issue on the invitation join page

-- Add policy to allow anon users to read company_name when accessed through a valid team_invitation
CREATE POLICY "Public can view company name via team invitation"
ON public.company_profiles
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 
        FROM public.team_invitations
        WHERE team_invitations.company_profile_id = company_profiles.id
        AND team_invitations.used = false
    )
);

-- Also allow authenticated users (in case they're viewing before accepting)
CREATE POLICY "Authenticated can view company name via team invitation"
ON public.company_profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.team_invitations
        WHERE team_invitations.company_profile_id = company_profiles.id
        AND team_invitations.used = false
    )
);

