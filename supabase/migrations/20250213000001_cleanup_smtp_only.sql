-- Cleanup migration: Remove Resend/SendGrid columns, keep only SMTP
-- This migration cleans up the company_profiles table to use SMTP only

-- Drop unused email provider columns
ALTER TABLE public.company_profiles
DROP COLUMN IF EXISTS email_provider,
DROP COLUMN IF EXISTS resend_api_key,
DROP COLUMN IF EXISTS sendgrid_api_key;

-- Set default for smtp_port if not already set
ALTER TABLE public.company_profiles
ALTER COLUMN smtp_port SET DEFAULT 587;

-- Update comment on smtp_port
COMMENT ON COLUMN public.company_profiles.smtp_port IS 'SMTP server port (587 for TLS recommended, 465 for SSL)';

