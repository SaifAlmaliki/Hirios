-- Add SMTP configuration columns to company_profiles table
-- This allows each company to use their own email server (Namecheap, Zoho, Gmail, etc.)

ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS smtp_host TEXT,
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_user TEXT,
ADD COLUMN IF NOT EXISTS smtp_password TEXT,
ADD COLUMN IF NOT EXISTS smtp_from_email TEXT,
ADD COLUMN IF NOT EXISTS smtp_from_name TEXT,
ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT true;

-- Add comment explaining the new columns
COMMENT ON COLUMN public.company_profiles.smtp_host IS 'SMTP server hostname (e.g., mail.privateemail.com for Namecheap, smtp.zoho.com for Zoho)';
COMMENT ON COLUMN public.company_profiles.smtp_port IS 'SMTP server port (587 for TLS recommended, 465 for SSL)';
COMMENT ON COLUMN public.company_profiles.smtp_user IS 'SMTP username/email for authentication (e.g., recruitment@company.com)';
COMMENT ON COLUMN public.company_profiles.smtp_password IS 'SMTP password for authentication';
COMMENT ON COLUMN public.company_profiles.smtp_from_email IS 'From email address shown to candidates (e.g., recruitment@idraq.com)';
COMMENT ON COLUMN public.company_profiles.smtp_from_name IS 'From name displayed in emails (e.g., Idraq Hiring Team)';
COMMENT ON COLUMN public.company_profiles.smtp_secure IS 'Use TLS/SSL for secure SMTP connection (recommended: true)';

-- Create index for faster lookups by user_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON public.company_profiles(user_id);

