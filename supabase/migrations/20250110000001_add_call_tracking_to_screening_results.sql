-- Add phone number and call tracking fields to screening_results table
-- This enables outbound AI voice calls to candidates

ALTER TABLE public.screening_results 
ADD COLUMN phone TEXT,
ADD COLUMN call_status TEXT DEFAULT 'not_initiated' CHECK (call_status IN ('not_initiated', 'initiated', 'in_progress', 'completed', 'failed')),
ADD COLUMN call_initiated_at TIMESTAMPTZ,
ADD COLUMN call_completed_at TIMESTAMPTZ,
ADD COLUMN call_summary TEXT,
ADD COLUMN call_error_message TEXT;

-- Create indexes for better query performance
CREATE INDEX idx_screening_results_call_status ON public.screening_results(call_status);
CREATE INDEX idx_screening_results_phone ON public.screening_results(phone);

-- Add comments to document the purpose
COMMENT ON COLUMN public.screening_results.phone IS 'Candidate phone number for outbound AI calls';
COMMENT ON COLUMN public.screening_results.call_status IS 'Status of AI voice call: not_initiated, initiated, in_progress, completed, failed';
COMMENT ON COLUMN public.screening_results.call_initiated_at IS 'Timestamp when outbound call was initiated';
COMMENT ON COLUMN public.screening_results.call_completed_at IS 'Timestamp when call was completed';
COMMENT ON COLUMN public.screening_results.call_summary IS 'AI-generated summary of the voice screening call';
COMMENT ON COLUMN public.screening_results.call_error_message IS 'Error message if call failed'; 