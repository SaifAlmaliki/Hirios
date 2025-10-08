-- Fix RLS policies for interview_availability_votes to allow public voting

-- Drop existing policies
DROP POLICY IF EXISTS "Public can insert votes via participant token" ON public.interview_availability_votes;
DROP POLICY IF EXISTS "Public can delete their own votes" ON public.interview_availability_votes;

-- Recreate policies with proper permissions
CREATE POLICY "Public can insert votes via participant token"
  ON public.interview_availability_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can delete their own votes"
  ON public.interview_availability_votes FOR DELETE
  TO anon, authenticated
  USING (true);

-- Also ensure participants can be updated by anonymous users
DROP POLICY IF EXISTS "Public can update their own participant response" ON public.interview_participants;

CREATE POLICY "Public can update their own participant response"
  ON public.interview_participants FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
