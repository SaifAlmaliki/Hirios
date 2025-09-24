-- Create candidate_status table for tracking candidate status per job
CREATE TABLE IF NOT EXISTS candidate_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_pool_id UUID NOT NULL REFERENCES resume_pool(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'screened', 
        'shortlisted',
        'first_interview',
        'second_interview',
        'interview_scheduled',
        'accepted',
        'rejected',
        'blocked',
        'offer_sent',
        'withdrawn'
    )),
    updated_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure one status record per candidate per job
    UNIQUE(resume_pool_id, job_id)
);

-- Create candidate_comments table for job-specific comment history
CREATE TABLE IF NOT EXISTS candidate_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_pool_id UUID NOT NULL REFERENCES resume_pool(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_status_resume_pool_id ON candidate_status(resume_pool_id);
CREATE INDEX IF NOT EXISTS idx_candidate_status_job_id ON candidate_status(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_status_status ON candidate_status(status);
CREATE INDEX IF NOT EXISTS idx_candidate_status_updated_by ON candidate_status(updated_by_user_id);

CREATE INDEX IF NOT EXISTS idx_candidate_comments_resume_pool_id ON candidate_comments(resume_pool_id);
CREATE INDEX IF NOT EXISTS idx_candidate_comments_job_id ON candidate_comments(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_comments_created_by ON candidate_comments(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_comments_created_at ON candidate_comments(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_candidate_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_status_updated_at
    BEFORE UPDATE ON candidate_status
    FOR EACH ROW
    EXECUTE FUNCTION update_candidate_status_updated_at();

-- Add RLS policies
ALTER TABLE candidate_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_comments ENABLE ROW LEVEL SECURITY;

-- Policy for candidate_status: Users can only see/update status for their company's candidates
CREATE POLICY "Users can manage candidate status for their company" ON candidate_status
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM resume_pool rp
            JOIN company_profiles cp ON rp.company_profile_id = cp.id
            WHERE rp.id = candidate_status.resume_pool_id
            AND cp.user_id = auth.uid()
        )
    );

-- Policy for candidate_comments: Users can only see/add comments for their company's candidates
CREATE POLICY "Users can manage candidate comments for their company" ON candidate_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM resume_pool rp
            JOIN company_profiles cp ON rp.company_profile_id = cp.id
            WHERE rp.id = candidate_comments.resume_pool_id
            AND cp.user_id = auth.uid()
        )
    );
