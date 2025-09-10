-- Add job collaboration system
-- This migration creates tables for job invitations and collaborators

-- Create job_invitations table
CREATE TABLE public.job_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_collaborators table
CREATE TABLE public.job_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('collaborator', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.job_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_invitations
CREATE POLICY "Users can view invitations for their jobs" 
  ON public.job_invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create invitations for their jobs" 
  ON public.job_invitations 
  FOR INSERT 
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update invitations for their jobs" 
  ON public.job_invitations 
  FOR UPDATE 
  USING (
    invited_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete invitations for their jobs" 
  ON public.job_invitations 
  FOR DELETE 
  USING (
    invited_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS policies for job_collaborators
CREATE POLICY "Users can view collaborators for their jobs" 
  ON public.job_collaborators 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_collaborators.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add collaborators to their jobs" 
  ON public.job_collaborators 
  FOR INSERT 
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_collaborators.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can remove collaborators from their jobs" 
  ON public.job_collaborators 
  FOR DELETE 
  USING (
    invited_by = auth.uid() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_collaborators.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Update jobs RLS policies to allow collaborators
DROP POLICY IF EXISTS "Companies can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Companies can delete their own jobs" ON public.jobs;

-- New policies that include collaborators
CREATE POLICY "Companies and collaborators can update jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = jobs.company_profile_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.job_collaborators 
      WHERE job_collaborators.job_id = jobs.id 
      AND job_collaborators.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = company_profile_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.job_collaborators 
      WHERE job_collaborators.job_id = jobs.id 
      AND job_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies and collaborators can delete jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = jobs.company_profile_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.job_collaborators 
      WHERE job_collaborators.job_id = jobs.id 
      AND job_collaborators.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_invitations_job_id ON public.job_invitations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_email ON public.job_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_job_invitations_token ON public.job_invitations(token);
CREATE INDEX IF NOT EXISTS idx_job_collaborators_job_id ON public.job_collaborators(job_id);
CREATE INDEX IF NOT EXISTS idx_job_collaborators_user_id ON public.job_collaborators(user_id);

-- Create function to clean up expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.job_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$;

-- Create function to handle invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_job_invitation(invitation_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM public.job_invitations 
  WHERE token = invitation_token 
  AND status = 'pending' 
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Get current user
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Check if user email matches invitation
  IF user_record.email != invitation_record.invited_email THEN
    RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Add user as collaborator
  INSERT INTO public.job_collaborators (job_id, user_id, invited_by)
  VALUES (invitation_record.job_id, user_record.id, invitation_record.invited_by)
  ON CONFLICT (job_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.job_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object('success', true, 'job_id', invitation_record.job_id);
END;
$$;
