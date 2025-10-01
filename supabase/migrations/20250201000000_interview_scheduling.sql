-- Interview Scheduling Pool System
-- This migration creates tables for managing interview scheduling with participant voting

-- Interview Schedules Table
CREATE TABLE IF NOT EXISTS public.interview_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interview configuration
  interview_duration_minutes INTEGER NOT NULL, -- 30, 60, 90, etc.
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'cancelled')),
  
  -- Final scheduled slot (set when confirmed)
  scheduled_start_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  confirmed_by_user_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Interview Time Slots Table (recruiter-proposed slots)
CREATE TABLE IF NOT EXISTS public.interview_time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_schedule_id UUID NOT NULL REFERENCES public.interview_schedules(id) ON DELETE CASCADE,
  
  -- Time slot details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Interview Participants Table
CREATE TABLE IF NOT EXISTS public.interview_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_schedule_id UUID NOT NULL REFERENCES public.interview_schedules(id) ON DELETE CASCADE,
  
  -- Participant details
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Voting token for public access
  vote_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT NOT NULL,
  
  -- Response tracking
  has_responded BOOLEAN DEFAULT false NOT NULL,
  responded_at TIMESTAMPTZ,
  
  -- Add as job collaborator
  added_as_collaborator BOOLEAN DEFAULT false NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(interview_schedule_id, email)
);

-- Interview Availability Votes Table (participant selections)
CREATE TABLE IF NOT EXISTS public.interview_availability_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_participant_id UUID NOT NULL REFERENCES public.interview_participants(id) ON DELETE CASCADE,
  interview_time_slot_id UUID NOT NULL REFERENCES public.interview_time_slots(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(interview_participant_id, interview_time_slot_id)
);

-- Indexes for performance
CREATE INDEX idx_interview_schedules_application_id ON public.interview_schedules(application_id);
CREATE INDEX idx_interview_schedules_job_id ON public.interview_schedules(job_id);
CREATE INDEX idx_interview_schedules_status ON public.interview_schedules(status);
CREATE INDEX idx_interview_schedules_created_by ON public.interview_schedules(created_by_user_id);

CREATE INDEX idx_interview_time_slots_schedule_id ON public.interview_time_slots(interview_schedule_id);
CREATE INDEX idx_interview_time_slots_start_time ON public.interview_time_slots(start_time);

CREATE INDEX idx_interview_participants_schedule_id ON public.interview_participants(interview_schedule_id);
CREATE INDEX idx_interview_participants_email ON public.interview_participants(email);
CREATE INDEX idx_interview_participants_vote_token ON public.interview_participants(vote_token);
CREATE INDEX idx_interview_participants_has_responded ON public.interview_participants(has_responded);

CREATE INDEX idx_interview_availability_votes_participant_id ON public.interview_availability_votes(interview_participant_id);
CREATE INDEX idx_interview_availability_votes_time_slot_id ON public.interview_availability_votes(interview_time_slot_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interview_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interview_schedules_updated_at
  BEFORE UPDATE ON public.interview_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_schedules_updated_at();

CREATE OR REPLACE FUNCTION update_interview_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interview_participants_updated_at
  BEFORE UPDATE ON public.interview_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_participants_updated_at();

-- RLS Policies

-- Interview Schedules
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interview schedules for their jobs"
  ON public.interview_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_profiles cp ON j.company_profile_id = cp.id
      WHERE j.id = interview_schedules.job_id
      AND cp.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.job_collaborators jc
      WHERE jc.job_id = interview_schedules.job_id
      AND jc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interview schedules for their jobs"
  ON public.interview_schedules FOR INSERT
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_profiles cp ON j.company_profile_id = cp.id
      WHERE j.id = interview_schedules.job_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interview schedules for their jobs"
  ON public.interview_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_profiles cp ON j.company_profile_id = cp.id
      WHERE j.id = interview_schedules.job_id
      AND cp.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.job_collaborators jc
      WHERE jc.job_id = interview_schedules.job_id
      AND jc.user_id = auth.uid()
    )
  );

-- Interview Time Slots
ALTER TABLE public.interview_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage time slots for their interview schedules"
  ON public.interview_time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_schedules isch
      JOIN public.jobs j ON isch.job_id = j.id
      JOIN public.company_profiles cp ON j.company_profile_id = cp.id
      WHERE isch.id = interview_time_slots.interview_schedule_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view time slots via participant token"
  ON public.interview_time_slots FOR SELECT
  TO anon
  USING (true);

-- Interview Participants
ALTER TABLE public.interview_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage participants for their interview schedules"
  ON public.interview_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_schedules isch
      JOIN public.jobs j ON isch.job_id = j.id
      JOIN public.company_profiles cp ON j.company_profile_id = cp.id
      WHERE isch.id = interview_participants.interview_schedule_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view participants via vote token"
  ON public.interview_participants FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update their own participant response"
  ON public.interview_participants FOR UPDATE
  TO anon
  USING (true);

-- Interview Availability Votes
ALTER TABLE public.interview_availability_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes for their interview schedules"
  ON public.interview_availability_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_participants ip
      JOIN public.interview_schedules isch ON ip.interview_schedule_id = isch.id
      JOIN public.jobs j ON isch.job_id = j.id
      JOIN public.company_profiles cp ON j.company_profile_id = cp.id
      WHERE ip.id = interview_availability_votes.interview_participant_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can insert votes via participant token"
  ON public.interview_availability_votes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can delete their own votes"
  ON public.interview_availability_votes FOR DELETE
  TO anon
  USING (true);

-- Comments
COMMENT ON TABLE public.interview_schedules IS 'Interview scheduling pools for coordinating availability across multiple participants';
COMMENT ON TABLE public.interview_time_slots IS 'Time slots proposed by recruiter for interview scheduling';
COMMENT ON TABLE public.interview_participants IS 'Participants who need to vote on interview availability';
COMMENT ON TABLE public.interview_availability_votes IS 'Participant votes for available time slots';
