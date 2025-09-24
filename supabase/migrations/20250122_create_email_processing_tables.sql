-- Create email_configurations table for storing email account settings
CREATE TABLE IF NOT EXISTS public.email_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  company_profile_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT email_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT email_configurations_company_profile_id_fkey 
    FOREIGN KEY (company_profile_id) REFERENCES company_profiles (id) ON DELETE CASCADE,
  CONSTRAINT email_configurations_email_address_unique UNIQUE (email_address)
);

-- Create processed_emails table for tracking processed emails
CREATE TABLE IF NOT EXISTS public.processed_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  email_config_id UUID NOT NULL,
  email_uid TEXT NOT NULL,
  subject TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT processed_emails_pkey PRIMARY KEY (id),
  CONSTRAINT processed_emails_email_config_id_fkey 
    FOREIGN KEY (email_config_id) REFERENCES email_configurations (id) ON DELETE CASCADE,
  CONSTRAINT processed_emails_unique_uid_per_config 
    UNIQUE (email_config_id, email_uid)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_configurations_company_profile_id 
  ON public.email_configurations USING btree (company_profile_id);

CREATE INDEX IF NOT EXISTS idx_email_configurations_is_active 
  ON public.email_configurations USING btree (is_active);

CREATE INDEX IF NOT EXISTS idx_processed_emails_email_config_id 
  ON public.processed_emails USING btree (email_config_id);

CREATE INDEX IF NOT EXISTS idx_processed_emails_processed_at 
  ON public.processed_emails USING btree (processed_at);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_configurations_updated_at
  BEFORE UPDATE ON email_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_email_configurations_updated_at();

-- Create system user for automated processing
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'system@hirios.com',
  crypt('system_password', gen_salt('bf')),
  now(),
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "System User", "avatar_url": null}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_emails ENABLE ROW LEVEL SECURITY;

-- Policy for email_configurations: users can only see their company's configurations
CREATE POLICY "Users can view their company email configurations" ON email_configurations
  FOR SELECT USING (
    company_profile_id IN (
      SELECT id FROM company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert email configurations for their company" ON email_configurations
  FOR INSERT WITH CHECK (
    company_profile_id IN (
      SELECT id FROM company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company email configurations" ON email_configurations
  FOR UPDATE USING (
    company_profile_id IN (
      SELECT id FROM company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company email configurations" ON email_configurations
  FOR DELETE USING (
    company_profile_id IN (
      SELECT id FROM company_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy for processed_emails: users can only see processed emails for their company's configurations
CREATE POLICY "Users can view processed emails for their company" ON processed_emails
  FOR SELECT USING (
    email_config_id IN (
      SELECT id FROM email_configurations 
      WHERE company_profile_id IN (
        SELECT id FROM company_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Service role can access all records for processing
CREATE POLICY "Service role can access all email configurations" ON email_configurations
  FOR ALL USING (true);

CREATE POLICY "Service role can access all processed emails" ON processed_emails
  FOR ALL USING (true);
