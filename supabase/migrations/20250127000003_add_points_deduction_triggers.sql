-- Add triggers for automatic points deduction
-- This migration creates triggers to automatically deduct points when screening results are generated and voice interviews are completed

-- Create function to deduct points when screening results are created
CREATE OR REPLACE FUNCTION public.deduct_screening_points_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  points_deducted BOOLEAN;
BEGIN
  -- Get the user_id from the job's company profile
  SELECT cp.user_id INTO user_id
  FROM public.jobs j
  JOIN public.company_profiles cp ON j.company_profile_id = cp.id
  WHERE j.id = NEW.job_id;
  
  -- Check if user exists and has enough points
  IF user_id IS NOT NULL THEN
    -- Check if points have already been deducted for this screening result
    IF NOT EXISTS (
      SELECT 1 FROM public.point_transactions 
      WHERE reference_id = NEW.id 
      AND transaction_type = 'screening'
    ) THEN
      -- Deduct 1 point for resume screening
      SELECT public.deduct_points(
        user_id,
        1,
        'screening',
        'Resume screening completed',
        NEW.id
      ) INTO points_deducted;
      
      IF NOT points_deducted THEN
        RAISE WARNING 'Failed to deduct points for screening result %', NEW.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to deduct points when voice interview is completed
CREATE OR REPLACE FUNCTION public.deduct_voice_interview_points_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  points_deducted BOOLEAN;
BEGIN
  -- Only process if interview_completed_at is being set (not null) and wasn't null before
  IF NEW.interview_completed_at IS NOT NULL AND OLD.interview_completed_at IS NULL THEN
    -- Get the user_id from the job's company profile
    SELECT cp.user_id INTO user_id
    FROM public.jobs j
    JOIN public.company_profiles cp ON j.company_profile_id = cp.id
    WHERE j.id = NEW.job_id;
    
    -- Check if user exists and has enough points
    IF user_id IS NOT NULL THEN
      -- Check if points have already been deducted for this voice interview
      IF NOT EXISTS (
        SELECT 1 FROM public.point_transactions 
        WHERE reference_id = NEW.id 
        AND transaction_type = 'voice_interview'
      ) THEN
        -- Deduct 2 points for voice interview
        SELECT public.deduct_points(
          user_id,
          2,
          'voice_interview',
          'Voice interview completed',
          NEW.id
        ) INTO points_deducted;
        
        IF NOT points_deducted THEN
          RAISE WARNING 'Failed to deduct points for voice interview %', NEW.id;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for screening results (after insert)
DROP TRIGGER IF EXISTS trigger_deduct_screening_points ON public.screening_results;
CREATE TRIGGER trigger_deduct_screening_points
  AFTER INSERT ON public.screening_results
  FOR EACH ROW EXECUTE FUNCTION public.deduct_screening_points_trigger();

-- Create trigger for voice interview completion (after update)
DROP TRIGGER IF EXISTS trigger_deduct_voice_interview_points ON public.screening_results;
CREATE TRIGGER trigger_deduct_voice_interview_points
  AFTER UPDATE ON public.screening_results
  FOR EACH ROW EXECUTE FUNCTION public.deduct_voice_interview_points_trigger();

-- Add comments for documentation
COMMENT ON FUNCTION public.deduct_screening_points_trigger IS 'Automatically deducts 1 point when screening results are created';
COMMENT ON FUNCTION public.deduct_voice_interview_points_trigger IS 'Automatically deducts 2 points when voice interview is completed (interview_completed_at is set)';
