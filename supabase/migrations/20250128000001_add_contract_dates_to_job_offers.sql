-- Add start_date and end_date fields to job_offers table
-- This migration adds support for contract-based employment offers

-- Add start_date field (required for all offers)
ALTER TABLE public.job_offers 
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE;

-- Add end_date field (optional for contract-based offers)
ALTER TABLE public.job_offers 
ADD COLUMN end_date date NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN public.job_offers.start_date IS 'The start date for the employment contract';
COMMENT ON COLUMN public.job_offers.end_date IS 'The end date for contract-based employment (NULL for permanent positions)';

-- Create index on start_date for performance
CREATE INDEX IF NOT EXISTS idx_job_offers_start_date 
ON public.job_offers USING btree (start_date) TABLESPACE pg_default;

-- Create index on end_date for performance
CREATE INDEX IF NOT EXISTS idx_job_offers_end_date 
ON public.job_offers USING btree (end_date) TABLESPACE pg_default;

-- Add constraint to ensure end_date is after start_date when both are provided
ALTER TABLE public.job_offers 
ADD CONSTRAINT job_offers_end_date_after_start_date 
CHECK (end_date IS NULL OR end_date > start_date);
