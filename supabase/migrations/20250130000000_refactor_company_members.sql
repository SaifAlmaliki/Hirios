-- Migration: Refactor company_profiles to support multiple users per company
-- This allows team members to share the same company_profile_id and see the same jobs/resumes
-- Date: 2025-01-30

-- Step 1: Create company_members junction table
CREATE TABLE IF NOT EXISTS public.company_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_profile_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT company_members_pkey PRIMARY KEY (id),
    CONSTRAINT company_members_company_profile_id_fkey FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    CONSTRAINT company_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT company_members_role_check CHECK (role IN ('owner', 'member')),
    CONSTRAINT company_members_company_profile_id_user_id_key UNIQUE (company_profile_id, user_id)
);

-- Create indexes for company_members
CREATE INDEX IF NOT EXISTS idx_company_members_company_profile_id ON public.company_members USING btree (company_profile_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON public.company_members USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_role ON public.company_members USING btree (role);

COMMENT ON TABLE public.company_members IS 'Junction table linking users to company profiles with their roles';

-- Enable RLS on company_members
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing RLS policies that reference user_id in company_profiles
-- We'll recreate them in the next steps

-- Drop company_profiles policies
DROP POLICY IF EXISTS "Team members can view their company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Only owners can update company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can view their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can update their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can insert their own profile" ON public.company_profiles;

-- Drop jobs policies
DROP POLICY IF EXISTS "Team members can view their company jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Only owners can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Only owners can delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON public.jobs;

-- Drop resume_pool policies
DROP POLICY IF EXISTS "Team members can view their company resumes" ON public.resume_pool;
DROP POLICY IF EXISTS "Team members can insert resumes" ON public.resume_pool;
DROP POLICY IF EXISTS "Team members can update resumes" ON public.resume_pool;
DROP POLICY IF EXISTS "Only owners can delete resumes" ON public.resume_pool;
DROP POLICY IF EXISTS "Users can insert resumes to their company" ON public.resume_pool;
DROP POLICY IF EXISTS "Users can delete resumes from their company" ON public.resume_pool;
DROP POLICY IF EXISTS "Users can view resumes from their company" ON public.resume_pool;
DROP POLICY IF EXISTS "Users can update resumes from their company" ON public.resume_pool;

-- Drop screening_results policies
DROP POLICY IF EXISTS "Team members can view screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Team members can update screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Team members can insert screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Companies can view screening results for their jobs" ON public.screening_results;
DROP POLICY IF EXISTS "Companies can update screening results for their jobs" ON public.screening_results;

-- Drop team_invitations policies
DROP POLICY IF EXISTS "Only owners can create team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can view team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners can delete team invitations" ON public.team_invitations;

-- Drop other related policies
DROP POLICY IF EXISTS "Team members can manage candidate comments" ON public.candidate_comments;
DROP POLICY IF EXISTS "Users can manage candidate comments for their company" ON public.candidate_comments;
DROP POLICY IF EXISTS "Team members can insert job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Team members can view job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Team members can update job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Team members can delete job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Users can view job offers for their company jobs" ON public.job_offers;
DROP POLICY IF EXISTS "Users can insert job offers for their company jobs" ON public.job_offers;
DROP POLICY IF EXISTS "Users can update job offers for their company jobs" ON public.job_offers;
DROP POLICY IF EXISTS "Team members can view candidate status" ON public.candidate_status;
DROP POLICY IF EXISTS "Team members can insert candidate status" ON public.candidate_status;
DROP POLICY IF EXISTS "Team members can update candidate status" ON public.candidate_status;

-- Step 3: Create new RLS policies using company_members

-- company_members policies
CREATE POLICY "Users can view their own memberships"
ON public.company_members
FOR SELECT
USING (auth.uid() = user_id);

-- company_profiles policies
CREATE POLICY "Company members can view their company profile"
ON public.company_profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = company_profiles.id
        AND company_members.user_id = auth.uid()
    )
);

CREATE POLICY "Only owners can update company profile"
ON public.company_profiles
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = company_profiles.id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

CREATE POLICY "Users can insert company profiles"
ON public.company_profiles
FOR INSERT
WITH CHECK (true); -- Will be handled by trigger function

-- jobs policies
CREATE POLICY "Company members can view their company jobs"
ON public.jobs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = jobs.company_profile_id
        AND company_members.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = jobs.company_profile_id
        AND company_members.user_id = auth.uid()
    )
);

CREATE POLICY "Only owners can update jobs"
ON public.jobs
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = jobs.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

CREATE POLICY "Only owners can delete jobs"
ON public.jobs
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = jobs.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- resume_pool policies
CREATE POLICY "Company members can view their company resumes"
ON public.resume_pool
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = resume_pool.company_profile_id
        AND company_members.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can insert resumes"
ON public.resume_pool
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = resume_pool.company_profile_id
        AND company_members.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can update resumes"
ON public.resume_pool
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = resume_pool.company_profile_id
        AND company_members.user_id = auth.uid()
    )
);

CREATE POLICY "Only owners can delete resumes"
ON public.resume_pool
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = resume_pool.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- screening_results policies
CREATE POLICY "Company members can view screening results"
ON public.screening_results
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = screening_results.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can update screening results"
ON public.screening_results
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = screening_results.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can insert screening results"
ON public.screening_results
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = screening_results.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can delete screening results"
ON public.screening_results
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = screening_results.job_id
        AND cm.user_id = auth.uid()
    )
);

-- team_invitations policies
CREATE POLICY "Only owners can create team invitations"
ON public.team_invitations
FOR INSERT
WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

CREATE POLICY "Owners can view team invitations"
ON public.team_invitations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

CREATE POLICY "Owners can delete team invitations"
ON public.team_invitations
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- Policy: Public can read invitation by token (for signup page)
CREATE POLICY "Public can read invitation by token"
ON public.team_invitations
FOR SELECT
TO anon
USING (true);

-- candidate_comments policies
CREATE POLICY "Company members can manage candidate comments"
ON public.candidate_comments
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = candidate_comments.job_id
        AND cm.user_id = auth.uid()
    )
);

-- job_offers policies
CREATE POLICY "Company members can view job offers"
ON public.job_offers
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_offers.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can insert job offers"
ON public.job_offers
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_offers.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can update job offers"
ON public.job_offers
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_offers.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can delete job offers"
ON public.job_offers
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_offers.job_id
        AND cm.user_id = auth.uid()
    )
);

-- candidate_status policies
CREATE POLICY "Company members can view candidate status"
ON public.candidate_status
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = candidate_status.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can insert candidate status"
ON public.candidate_status
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = candidate_status.job_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can update candidate status"
ON public.candidate_status
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = candidate_status.job_id
        AND cm.user_id = auth.uid()
    )
);

-- Step 4: Update accept_team_invitation function
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
    existing_membership_id uuid;
    current_user_email text;
BEGIN
    -- Get current user's email
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Get invitation details
    SELECT * INTO invitation_record
    FROM public.team_invitations
    WHERE token = invitation_token
    AND used = false;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
    END IF;

    -- Verify email matches
    IF current_user_email != invitation_record.invited_email THEN
        RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
    END IF;

    -- Check if user already has a membership
    SELECT id INTO existing_membership_id
    FROM public.company_members
    WHERE user_id = auth.uid();

    IF existing_membership_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'User already belongs to a company');
    END IF;

    -- Add user to company_members as a member
    INSERT INTO public.company_members (
        company_profile_id,
        user_id,
        role,
        created_at
    ) VALUES (
        invitation_record.company_profile_id,
        auth.uid(),
        'member',
        NOW()
    );

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

-- Step 5: Update create_company_profile_for_user function
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation_count integer;
  v_new_profile_id uuid;
BEGIN
  -- Check if this user has a pending invitation (for team invites)
  BEGIN
    SELECT COUNT(*) INTO v_pending_invitation_count
    FROM public.team_invitations
    WHERE invited_email = NEW.email
      AND used = false;
  EXCEPTION
    WHEN OTHERS THEN
      -- If there's an error checking invitations, assume no invitation
      v_pending_invitation_count := 0;
      RAISE WARNING 'Error checking invitations for %: %', NEW.email, SQLERRM;
  END;

  -- If there's a pending invitation, DON'T create a new company profile
  -- The profile will be created when they accept the invitation
  IF v_pending_invitation_count > 0 THEN
    RAISE NOTICE 'User % has % pending invitation(s), skipping profile creation', NEW.email, v_pending_invitation_count;
    RETURN NEW;
  END IF;

  -- No invitation found, create a new company profile and add user as owner
  BEGIN
    -- Create company profile
    INSERT INTO public.company_profiles (
      email,
      created_at,
      updated_at
    ) VALUES (
      NEW.email,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_new_profile_id;
    
    -- Add user as owner in company_members
    INSERT INTO public.company_members (
      company_profile_id,
      user_id,
      role,
      created_at
    ) VALUES (
      v_new_profile_id,
      NEW.id,
      'owner',
      NOW()
    );
    
    RAISE NOTICE 'Created company profile and membership for user %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
      -- Return NEW to allow user creation to succeed even if profile creation fails
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function is owned by postgres (which bypasses RLS)
ALTER FUNCTION public.create_company_profile_for_user() OWNER TO postgres;

-- Step 6: Drop all RLS policies that reference company_profiles.user_id
-- These policies need to be dropped before we can remove the user_id column

-- Drop policies on applications table
DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON public.applications;

-- Drop policies on job_invitations table
DROP POLICY IF EXISTS "Users can view invitations for their jobs" ON public.job_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their jobs" ON public.job_invitations;
DROP POLICY IF EXISTS "Users can update invitations for their jobs" ON public.job_invitations;
DROP POLICY IF EXISTS "Users can delete invitations for their jobs" ON public.job_invitations;

-- Drop policies on job_collaborators table
DROP POLICY IF EXISTS "Users can view collaborators for their jobs" ON public.job_collaborators;
DROP POLICY IF EXISTS "Users can add collaborators to their jobs" ON public.job_collaborators;
DROP POLICY IF EXISTS "Users can remove collaborators from their jobs" ON public.job_collaborators;

-- Drop policies on storage.objects
DROP POLICY IF EXISTS "Company users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Company users can view their uploaded resumes" ON storage.objects;
DROP POLICY IF EXISTS "Company users can delete their uploaded resumes" ON storage.objects;

-- Drop policies on candidate_status table
DROP POLICY IF EXISTS "Users can manage candidate status for their company" ON public.candidate_status;

-- Drop policies on interview_schedules table
DROP POLICY IF EXISTS "Users can view interview schedules for their jobs" ON public.interview_schedules;
DROP POLICY IF EXISTS "Users can create interview schedules for their jobs" ON public.interview_schedules;
DROP POLICY IF EXISTS "Users can update interview schedules for their jobs" ON public.interview_schedules;

-- Drop policies on interview_time_slots table
DROP POLICY IF EXISTS "Users can manage time slots for their interview schedules" ON public.interview_time_slots;

-- Drop policies on interview_participants table
DROP POLICY IF EXISTS "Users can manage participants for their interview schedules" ON public.interview_participants;

-- Drop policies on interview_availability_votes table
DROP POLICY IF EXISTS "Users can view votes for their interview schedules" ON public.interview_availability_votes;

-- Drop policies on screening_results table
DROP POLICY IF EXISTS "Companies can delete screening results for their jobs" ON public.screening_results;

-- Drop policies on team_invitations table
DROP POLICY IF EXISTS "Owners can read company invitations" ON public.team_invitations;

-- Step 7: Remove user_id and role columns from company_profiles
-- First drop the unique constraint
ALTER TABLE public.company_profiles
DROP CONSTRAINT IF EXISTS company_profiles_user_id_unique;

-- Drop the index on user_id
DROP INDEX IF EXISTS idx_company_profiles_user_id;

-- Drop the role check constraint if it exists
ALTER TABLE public.company_profiles
DROP CONSTRAINT IF EXISTS company_profiles_role_check;

-- Drop the columns (now safe since all dependent policies are dropped)
ALTER TABLE public.company_profiles
DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.company_profiles
DROP COLUMN IF EXISTS role;

-- Step 8: Recreate RLS policies that were dropped, using company_members instead of user_id

-- Recreate policies on applications table
CREATE POLICY "Company members can view applications for their jobs"
ON public.applications
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = applications.job_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on job_invitations table
CREATE POLICY "Company members can view invitations for their jobs"
ON public.job_invitations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_invitations.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can create invitations for their jobs"
ON public.job_invitations
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_invitations.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can update invitations for their jobs"
ON public.job_invitations
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_invitations.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can delete invitations for their jobs"
ON public.job_invitations
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_invitations.job_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on job_collaborators table
CREATE POLICY "Company members can view collaborators for their jobs"
ON public.job_collaborators
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_collaborators.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can add collaborators to their jobs"
ON public.job_collaborators
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_collaborators.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can remove collaborators from their jobs"
ON public.job_collaborators
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = job_collaborators.job_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on candidate_status table
CREATE POLICY "Company members can manage candidate status"
ON public.candidate_status
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = candidate_status.job_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on interview_schedules table
CREATE POLICY "Company members can view interview schedules for their jobs"
ON public.interview_schedules
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = interview_schedules.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can create interview schedules for their jobs"
ON public.interview_schedules
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = interview_schedules.job_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Company members can update interview schedules for their jobs"
ON public.interview_schedules
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = interview_schedules.job_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on interview_time_slots table
CREATE POLICY "Company members can manage time slots for their interview schedules"
ON public.interview_time_slots
USING (
    EXISTS (
        SELECT 1 FROM public.interview_schedules s
        JOIN public.jobs j ON s.job_id = j.id
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE s.id = interview_time_slots.interview_schedule_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on interview_participants table
CREATE POLICY "Company members can manage participants for their interview schedules"
ON public.interview_participants
USING (
    EXISTS (
        SELECT 1 FROM public.interview_schedules s
        JOIN public.jobs j ON s.job_id = j.id
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE s.id = interview_participants.interview_schedule_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on interview_availability_votes table
CREATE POLICY "Company members can view votes for their interview schedules"
ON public.interview_availability_votes
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.interview_participants p
        JOIN public.interview_schedules s ON p.interview_schedule_id = s.id
        JOIN public.jobs j ON s.job_id = j.id
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE p.id = interview_availability_votes.interview_participant_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on screening_results table
CREATE POLICY "Company members can delete screening results for their jobs"
ON public.screening_results
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.company_members cm ON j.company_profile_id = cm.company_profile_id
        WHERE j.id = screening_results.job_id AND cm.user_id = auth.uid()
    )
);

-- Recreate policies on team_invitations table (additional to existing ones)
-- Note: The "Owners can read company invitations" policy might be redundant with existing policies
-- but we'll add it back for safety
CREATE POLICY "Owners can read company invitations"
ON public.team_invitations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_members
        WHERE company_members.company_profile_id = team_invitations.company_profile_id
        AND company_members.user_id = auth.uid()
        AND company_members.role = 'owner'
    )
);

-- Note: Storage policies (for company_uploads bucket) are handled in a separate migration
-- They reference user_id indirectly through folder structure, so they may need separate handling
-- For now, we'll assume those policies will be updated separately or work with the folder structure

-- Step 9: Grant permissions
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO anon;

-- Comments
COMMENT ON TABLE public.company_members IS 'Links users to company profiles with their roles (owner/member)';

