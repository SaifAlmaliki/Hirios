-- Create job_offers table for managing job offers to candidates
CREATE TABLE IF NOT EXISTS job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_pool_id UUID NOT NULL REFERENCES resume_pool(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Offer details
    salary_amount DECIMAL(12,2) NOT NULL,
    salary_currency TEXT NOT NULL DEFAULT 'USD',
    bonus_amount DECIMAL(12,2) NULL,
    bonus_description TEXT NULL,
    benefits TEXT NOT NULL,
    reports_to TEXT NOT NULL,
    insurance_details TEXT NULL,
    
    -- Offer management
    offer_status TEXT NOT NULL DEFAULT 'draft' CHECK (offer_status IN (
        'draft',
        'sent',
        'accepted',
        'rejected',
        'expired',
        'withdrawn'
    )),
    offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    expiry_period_days INTEGER NOT NULL DEFAULT 14,
    
    -- File management
    pdf_file_path TEXT NULL,
    pdf_file_url TEXT NULL,
    
    -- Email details
    email_cc_addresses TEXT[] NULL, -- Array of additional CC email addresses
    
    -- Tracking
    created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NULL,
    responded_at TIMESTAMPTZ NULL,
    response_comment TEXT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure one active offer per candidate per job
    UNIQUE(resume_pool_id, job_id)
);

-- Note: We'll reuse the existing candidate_comments table for offer-related comments
-- The comment_type can be indicated in the comment text or we can add a comment_type field to candidate_comments if needed

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_offers_resume_pool_id ON job_offers(resume_pool_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_job_id ON job_offers(job_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(offer_status);
CREATE INDEX IF NOT EXISTS idx_job_offers_created_by ON job_offers(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_expiry_date ON job_offers(expiry_date);
CREATE INDEX IF NOT EXISTS idx_job_offers_created_at ON job_offers(created_at);

-- Note: Using existing candidate_comments indexes

-- Add RLS policies
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- Policy for job_offers: Users can only see offers for their company's jobs
CREATE POLICY "Users can view job offers for their company jobs" ON job_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN company_profiles cp ON j.company_profile_id = cp.id
            WHERE j.id = job_offers.job_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert job offers for their company jobs" ON job_offers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN company_profiles cp ON j.company_profile_id = cp.id
            WHERE j.id = job_offers.job_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update job offers for their company jobs" ON job_offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN company_profiles cp ON j.company_profile_id = cp.id
            WHERE j.id = job_offers.job_id 
            AND cp.user_id = auth.uid()
        )
    );

-- Note: Using existing candidate_comments RLS policies

-- Function to automatically set expiry date when offer is created
CREATE OR REPLACE FUNCTION set_offer_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry date based on offer_date + expiry_period_days
    NEW.expiry_date = NEW.offer_date + INTERVAL '1 day' * NEW.expiry_period_days;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set expiry date
CREATE TRIGGER trigger_set_offer_expiry_date
    BEFORE INSERT OR UPDATE ON job_offers
    FOR EACH ROW
    EXECUTE FUNCTION set_offer_expiry_date();

-- Function to update offer status to expired when expiry date is reached
CREATE OR REPLACE FUNCTION check_expired_offers()
RETURNS void AS $$
BEGIN
    UPDATE job_offers 
    SET offer_status = 'expired',
        updated_at = now()
    WHERE offer_status IN ('sent', 'draft')
    AND expiry_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to check for expired offers (this would need to be set up in your cron/scheduler)
-- For now, this can be called manually or via a Supabase Edge Function
