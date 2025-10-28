-- Migration: Add multi-user team support with owner/member roles
-- This allows multiple HR team members to collaborate on the same company account

-- Step 1: Add role column to company_profiles table
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'owner' NOT NULL
CHECK (role IN ('owner', 'member'));

-- Step 2: Set all existing users as owners
UPDATE public.company_profiles
SET role = 'owner'
WHERE role IS NULL;

-- Step 3: Create team_invitations table for inviting team members
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    company_profile_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    invited_email text NOT NULL,
    invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token text DEFAULT gen_random_uuid()::text NOT NULL UNIQUE,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_pending_invitation UNIQUE (company_profile_id, invited_email, used)
);

-- Step 4: Create indexes for team_invitations
CREATE INDEX IF NOT EXISTS idx_team_invitations_company_profile_id 
ON public.team_invitations(company_profile_id);

CREATE INDEX IF NOT EXISTS idx_team_invitations_token 
ON public.team_invitations(token);

CREATE INDEX IF NOT EXISTS idx_team_invitations_email 
ON public.team_invitations(invited_email);

-- Step 5: Add comment to explain the table
COMMENT ON TABLE public.team_invitations IS 'Invitations for team members to join a company account';

-- Step 6: Update RLS policies for company_profiles to support team access
-- Drop old policies that only check user_id
DROP POLICY IF EXISTS "Companies can view their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can update their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can insert their own profile" ON public.company_profiles;

-- New policy: Team members can view their company profile
CREATE POLICY "Team members can view their company profile"
ON public.company_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- New policy: Only owners can update company profile
CREATE POLICY "Only owners can update company profile"
ON public.company_profiles
FOR UPDATE
USING (auth.uid() = user_id AND role = 'owner');

-- New policy: Users can insert their own profile (they become owner)
CREATE POLICY "Users can insert their own profile"
ON public.company_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id AND role = 'owner');

-- Step 7: Update RLS policies for jobs to support team access
-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON public.jobs;

-- New policy: Team members can view jobs from their company
CREATE POLICY "Team members can view their company jobs"
ON public.jobs
FOR SELECT
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
);

-- New policy: All team members can create jobs
CREATE POLICY "Team members can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
    company_profile_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
);

-- New policy: Only owners can update jobs
CREATE POLICY "Only owners can update jobs"
ON public.jobs
FOR UPDATE
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- New policy: Only owners can delete jobs
CREATE POLICY "Only owners can delete jobs"
ON public.jobs
FOR DELETE
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- Step 8: Update RLS policies for resume_pool to support team access
-- Drop old policies
DROP POLICY IF EXISTS "Users can insert resumes to their company" ON public.resume_pool;
DROP POLICY IF EXISTS "Users can delete resumes from their company" ON public.resume_pool;

-- New policy: Team members can view resumes from their company
CREATE POLICY "Team members can view their company resumes"
ON public.resume_pool
FOR SELECT
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
);

-- New policy: Team members can insert resumes
CREATE POLICY "Team members can insert resumes"
ON public.resume_pool
FOR INSERT
WITH CHECK (
    company_profile_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
);

-- New policy: Team members can update resumes
CREATE POLICY "Team members can update resumes"
ON public.resume_pool
FOR UPDATE
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
);

-- New policy: Only owners can delete resumes
CREATE POLICY "Only owners can delete resumes"
ON public.resume_pool
FOR DELETE
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- Step 9: Update RLS policies for screening_results to support team access
-- Drop old policies
DROP POLICY IF EXISTS "Companies can view screening results for their jobs" ON public.screening_results;
DROP POLICY IF EXISTS "Companies can update screening results for their jobs" ON public.screening_results;

-- New policy: Team members can view screening results for their company jobs
CREATE POLICY "Team members can view screening results"
ON public.screening_results
FOR SELECT
USING (
    job_id IN (
        SELECT j.id FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE cp.user_id = auth.uid()
    )
);

-- New policy: Team members can update screening results
CREATE POLICY "Team members can update screening results"
ON public.screening_results
FOR UPDATE
USING (
    job_id IN (
        SELECT j.id FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE cp.user_id = auth.uid()
    )
);

-- New policy: Team members can insert screening results
CREATE POLICY "Team members can insert screening results"
ON public.screening_results
FOR INSERT
WITH CHECK (
    job_id IN (
        SELECT j.id FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE cp.user_id = auth.uid()
    )
);

-- Step 10: RLS policies for team_invitations
-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Only owners can create invitations
CREATE POLICY "Only owners can create team invitations"
ON public.team_invitations
FOR INSERT
WITH CHECK (
    invited_by = auth.uid() AND
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- Policy: Owners can view their company's invitations
CREATE POLICY "Owners can view team invitations"
ON public.team_invitations
FOR SELECT
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- Policy: Owners can delete invitations
CREATE POLICY "Owners can delete team invitations"
ON public.team_invitations
FOR DELETE
USING (
    company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- Policy: Public can read invitation by token (for signup page)
CREATE POLICY "Public can read invitation by token"
ON public.team_invitations
FOR SELECT
TO anon
USING (true);

-- Step 11: Update other related policies for team access
-- Update candidate_status policies
DROP POLICY IF EXISTS "Users can manage candidate comments for their company" ON public.candidate_comments;

CREATE POLICY "Team members can manage candidate comments"
ON public.candidate_comments
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = candidate_comments.job_id AND cp.user_id = auth.uid()
    )
);

-- Update job_offers policies
DROP POLICY IF EXISTS "Users can insert job offers for their company jobs" ON public.job_offers;

CREATE POLICY "Team members can insert job offers"
ON public.job_offers
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = job_offers.job_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Team members can view job offers"
ON public.job_offers
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = job_offers.job_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Team members can update job offers"
ON public.job_offers
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = job_offers.job_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Team members can delete job offers"
ON public.job_offers
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = job_offers.job_id AND cp.user_id = auth.uid()
    )
);

-- Update candidate_status policies
CREATE POLICY "Team members can view candidate status"
ON public.candidate_status
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = candidate_status.job_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Team members can insert candidate status"
ON public.candidate_status
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = candidate_status.job_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Team members can update candidate status"
ON public.candidate_status
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_profiles cp ON j.company_profile_id = cp.id
        WHERE j.id = candidate_status.job_id AND cp.user_id = auth.uid()
    )
);

-- Step 12: Function to accept team invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
    existing_profile_id uuid;
    new_profile_id uuid;
BEGIN
    -- Get invitation details
    SELECT * INTO invitation_record
    FROM public.team_invitations
    WHERE token = invitation_token
    AND used = false;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
    END IF;

    -- Check if user already has a company profile
    SELECT id INTO existing_profile_id
    FROM public.company_profiles
    WHERE user_id = auth.uid();

    IF existing_profile_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'User already has a company profile');
    END IF;

    -- Get the company profile details to copy
    SELECT id INTO new_profile_id
    FROM public.company_profiles
    WHERE id = invitation_record.company_profile_id;

    IF new_profile_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Company profile not found');
    END IF;

    -- Create a new company profile for the member linked to the same company
    INSERT INTO public.company_profiles (
        user_id,
        company_name,
        company_description,
        company_website,
        company_size,
        industry,
        address,
        phone,
        logo_url,
        subscription_plan,
        role
    )
    SELECT
        auth.uid(),
        company_name,
        company_description,
        company_website,
        company_size,
        industry,
        address,
        phone,
        logo_url,
        subscription_plan,
        'member'
    FROM public.company_profiles
    WHERE id = invitation_record.company_profile_id;

    -- Mark invitation as used
    UPDATE public.team_invitations
    SET used = true
    WHERE id = invitation_record.id;

    RETURN json_build_object(
        'success', true,
        'company_profile_id', invitation_record.company_profile_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO anon;
