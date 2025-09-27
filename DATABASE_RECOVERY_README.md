# Database Recovery Guide - Hirios

This document provides a comprehensive guide for recovering the Hirios database schema. Use this as a reference when rebuilding the database from scratch.

## Table of Contents
- [Overview](#overview)
- [Database Tables](#database-tables)
- [Table Relationships](#table-relationships)
- [Indexes](#indexes)
- [Triggers](#triggers)
- [Recovery Instructions](#recovery-instructions)
- [Data Migration Notes](#data-migration-notes)

## Overview

The Hirios database consists of 8 main tables that handle:
- Job management and applications
- Resume processing and screening
- Company profiles and collaboration
- Candidate status tracking
- Job offers and invitations

## Database Tables

### 1. applications
**Purpose**: Stores job applications and resume uploads

```sql
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NULL,
  resume_url text NULL,
  resume_text text NULL,
  status text NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  original_filename text NULL,
  uploaded_by_user_id uuid NULL,
  storage_path text NULL,
  resume_pool_id uuid NULL,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_resume_pool_id_fkey FOREIGN KEY (resume_pool_id) REFERENCES resume_pool (id) ON DELETE SET NULL,
  CONSTRAINT applications_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;
```

**Key Features**:
- Links applications to jobs and resume pools
- Stores resume text for full-text search
- Tracks upload metadata and file storage paths

### 2. candidate_comments
**Purpose**: Stores comments on candidates for specific jobs

```sql
CREATE TABLE public.candidate_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resume_pool_id uuid NOT NULL,
  job_id uuid NOT NULL,
  comment text NOT NULL,
  created_by_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_comments_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_comments_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT candidate_comments_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT candidate_comments_resume_pool_id_fkey FOREIGN KEY (resume_pool_id) REFERENCES resume_pool (id) ON DELETE CASCADE
) TABLESPACE pg_default;
```

**Key Features**:
- Collaborative commenting system
- Cascading deletes for data integrity

### 3. candidate_status
**Purpose**: Tracks candidate progression through hiring pipeline

```sql
CREATE TABLE public.candidate_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resume_pool_id uuid NOT NULL,
  job_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  updated_by_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_status_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_status_resume_pool_id_job_id_key UNIQUE (resume_pool_id, job_id),
  CONSTRAINT candidate_status_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT candidate_status_resume_pool_id_fkey FOREIGN KEY (resume_pool_id) REFERENCES resume_pool (id) ON DELETE CASCADE,
  CONSTRAINT candidate_status_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT candidate_status_status_check CHECK (
    status = ANY (ARRAY[
      'pending'::text, 'screened'::text, 'shortlisted'::text,
      'first_interview'::text, 'second_interview'::text, 'interview_scheduled'::text,
      'accepted'::text, 'rejected'::text, 'blocked'::text,
      'offer_sent'::text, 'withdrawn'::text
    ])
  )
) TABLESPACE pg_default;
```

**Key Features**:
- Unique constraint on resume_pool_id + job_id combination
- Status validation with predefined values
- Automatic timestamp updates

### 4. company_profiles
**Purpose**: Stores company information and subscription details

```sql
CREATE TABLE public.company_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  company_name text NULL,
  company_description text NULL,
  company_website text NULL,
  company_size text NULL,
  industry text NULL,
  address text NULL,
  phone text NULL,
  logo_url text NULL,
  subscription_plan text NULL DEFAULT 'free'::text,
  jobs_posted_this_month integer NULL DEFAULT 0,
  last_job_count_reset timestamp with time zone NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT company_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id)
) TABLESPACE pg_default;
```

**Key Features**:
- One-to-one relationship with auth.users
- Subscription tracking with monthly job limits
- Company branding and contact information

### 5. job_collaborators
**Purpose**: Manages team collaboration on job postings

```sql
CREATE TABLE public.job_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NULL,
  user_id uuid NULL,
  invited_by uuid NULL,
  role text NULL DEFAULT 'collaborator'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT job_collaborators_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
```

**Key Features**:
- Multi-user collaboration on jobs
- Role-based access control
- Invitation tracking

### 6. job_invitations
**Purpose**: Manages email invitations for job collaboration

```sql
CREATE TABLE public.job_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NULL,
  invited_email text NULL,
  invited_by uuid NULL,
  status text NULL DEFAULT 'pending'::text,
  token text NULL DEFAULT (gen_random_uuid())::text,
  expires_at timestamp with time zone NULL DEFAULT (now() + '7 days'::interval),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT job_invitations_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
```

**Key Features**:
- Secure token-based invitations
- Automatic expiration (7 days)
- Email-based invitation system

### 7. job_offers
**Purpose**: Manages job offer creation and tracking

```sql
CREATE TABLE public.job_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resume_pool_id uuid NOT NULL,
  job_id uuid NOT NULL,
  salary_amount numeric(12, 2) NOT NULL,
  salary_currency text NOT NULL DEFAULT 'USD'::text,
  bonus_amount numeric(12, 2) NULL,
  bonus_description text NULL,
  benefits text NOT NULL,
  reports_to text NOT NULL,
  insurance_details text NULL,
  offer_status text NOT NULL DEFAULT 'draft'::text,
  offer_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date NOT NULL,
  expiry_period_days integer NOT NULL DEFAULT 14,
  pdf_file_path text NULL,
  pdf_file_url text NULL,
  email_cc_addresses text[] NULL,
  created_by_user_id uuid NOT NULL,
  sent_at timestamp with time zone NULL,
  responded_at timestamp with time zone NULL,
  response_comment text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_offers_pkey PRIMARY KEY (id),
  CONSTRAINT job_offers_resume_pool_id_job_id_key UNIQUE (resume_pool_id, job_id),
  CONSTRAINT job_offers_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT job_offers_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT job_offers_resume_pool_id_fkey FOREIGN KEY (resume_pool_id) REFERENCES resume_pool (id) ON DELETE CASCADE,
  CONSTRAINT job_offers_offer_status_check CHECK (
    offer_status = ANY (ARRAY[
      'draft'::text, 'sent'::text, 'accepted'::text,
      'rejected'::text, 'expired'::text, 'withdrawn'::text
    ])
  )
) TABLESPACE pg_default;
```

**Key Features**:
- Comprehensive offer details (salary, benefits, etc.)
- PDF generation and storage
- Status tracking with validation
- Automatic expiry date calculation

### 8. jobs
**Purpose**: Stores job postings and requirements

```sql
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_profile_id uuid NULL,
  title text NULL,
  description text NULL,
  requirements text NULL,
  responsibilities text NULL,
  location text NULL,
  employment_type text NULL DEFAULT 'full-time'::text,
  experience_level text NULL DEFAULT 'mid-level'::text,
  status text NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  benefits text NULL,
  department text NOT NULL,
  company text NOT NULL,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_employment_type_check CHECK (
    employment_type = ANY (ARRAY[
      'full-time'::text, 'part-time'::text, 'contract'::text,
      'temporary'::text, 'internship'::text
    ])
  )
) TABLESPACE pg_default;
```

**Key Features**:
- Comprehensive job details
- Employment type validation
- Automatic job count tracking

### 9. resume_pool
**Purpose**: Central repository for all uploaded resumes

```sql
CREATE TABLE public.resume_pool (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_profile_id uuid NOT NULL,
  original_filename text NOT NULL,
  storage_path text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by_user_id uuid NOT NULL,
  resume_text text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text NULL,
  last_name text NULL,
  email text NULL,
  phone text NULL,
  home_address text NULL,
  skills text[] NULL,
  CONSTRAINT resume_pool_pkey PRIMARY KEY (id),
  CONSTRAINT resume_pool_company_profile_id_fkey FOREIGN KEY (company_profile_id) REFERENCES company_profiles (id) ON DELETE CASCADE,
  CONSTRAINT resume_pool_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;
```

**Key Features**:
- Extracted candidate information
- Skills array for matching
- Full-text search on resume content
- File metadata tracking

### 10. screening_results
**Purpose**: Stores AI screening analysis results

```sql
CREATE TABLE public.screening_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NULL,
  application_id uuid NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NULL,
  home_address text NULL,
  resume_url text NULL,
  resume_text text NULL,
  overall_fit integer NULL,
  strengths text NULL,
  weaknesses text NULL,
  risk_factor text NULL,
  reward_factor text NULL,
  justification text NULL,
  date timestamp with time zone NOT NULL DEFAULT now(),
  voice_screening_requested boolean NULL DEFAULT false,
  voice_screening_completed boolean NULL DEFAULT false,
  voice_screening_notes text NULL,
  interview_summary text NULL,
  interview_completed_at timestamp with time zone NULL,
  is_favorite boolean NULL DEFAULT false,
  is_dismissed boolean NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  skills text[] NULL,
  CONSTRAINT screening_results_pkey PRIMARY KEY (id),
  CONSTRAINT screening_results_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE SET NULL,
  CONSTRAINT screening_results_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
) TABLESPACE pg_default;
```

**Key Features**:
- AI-powered candidate analysis
- Voice screening integration
- Favorites and dismissal tracking
- Skills matching

## Table Relationships

```
auth.users (Supabase Auth)
    ↓
company_profiles (1:1)
    ↓
jobs (1:many)
    ↓
├── applications (1:many)
├── job_collaborators (1:many)
├── job_invitations (1:many)
├── screening_results (1:many)
└── candidate_status (1:many)

resume_pool (1:many from company_profiles)
    ↓
├── applications (1:many)
├── candidate_comments (1:many)
├── candidate_status (1:many)
└── job_offers (1:many)
```

## Indexes

### Performance Indexes
All tables have strategic indexes for optimal query performance:

**B-tree Indexes** (for equality and range queries):
- Foreign key columns (job_id, resume_pool_id, user_id, etc.)
- Status fields for filtering
- Timestamp fields for sorting
- Email and phone for lookups

**GIN Indexes** (for full-text search):
- `resume_text` in applications and resume_pool
- `skills` arrays in resume_pool and screening_results

**Key Indexes to Note**:
```sql
-- Full-text search on resume content
CREATE INDEX idx_applications_resume_text ON public.applications USING gin (to_tsvector('english'::regconfig, resume_text));
CREATE INDEX idx_resume_pool_resume_text ON public.resume_pool USING gin (to_tsvector('english'::regconfig, resume_text));

-- Skills matching
CREATE INDEX idx_resume_pool_skills ON public.resume_pool USING gin (skills);
CREATE INDEX idx_screening_results_skills ON public.screening_results USING gin (skills);
```

## Triggers

### 1. Candidate Status Update Trigger
```sql
CREATE TRIGGER trigger_update_candidate_status_updated_at 
BEFORE UPDATE ON candidate_status 
FOR EACH ROW 
EXECUTE FUNCTION update_candidate_status_updated_at();
```

### 2. Job Count Management Triggers
```sql
-- Increment job count when new job is created
CREATE TRIGGER increment_job_count_trigger
AFTER INSERT ON jobs 
FOR EACH ROW 
EXECUTE FUNCTION increment_job_count();

-- Decrement job count when job is deleted
CREATE TRIGGER decrement_job_count_trigger
AFTER DELETE ON jobs 
FOR EACH ROW 
EXECUTE FUNCTION decrement_job_count();
```

### 3. Resume Pool Update Trigger
```sql
CREATE TRIGGER trigger_update_resume_pool_updated_at 
BEFORE UPDATE ON resume_pool 
FOR EACH ROW 
EXECUTE FUNCTION update_resume_pool_updated_at();
```

### 4. Job Offer Expiry Trigger
```sql
CREATE TRIGGER trigger_set_offer_expiry_date 
BEFORE INSERT OR UPDATE ON job_offers 
FOR EACH ROW 
EXECUTE FUNCTION set_offer_expiry_date();
```

## Recovery Instructions

### Step 1: Create Database
```sql
-- Create the database (if not exists)
CREATE DATABASE hirios;
```

### Step 2: Enable Extensions
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Step 3: Create Functions
Create the following functions before creating tables with triggers:

```sql
-- Function to update candidate_status updated_at
CREATE OR REPLACE FUNCTION update_candidate_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update resume_pool updated_at
CREATE OR REPLACE FUNCTION update_resume_pool_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment job count
CREATE OR REPLACE FUNCTION increment_job_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE company_profiles 
    SET jobs_posted_this_month = jobs_posted_this_month + 1
    WHERE id = NEW.company_profile_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement job count
CREATE OR REPLACE FUNCTION decrement_job_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE company_profiles 
    SET jobs_posted_this_month = jobs_posted_this_month - 1
    WHERE id = OLD.company_profile_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to set offer expiry date
CREATE OR REPLACE FUNCTION set_offer_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.expiry_date = NEW.offer_date + (NEW.expiry_period_days || ' days')::interval;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Step 4: Create Tables
Execute the table creation statements in this order to respect foreign key dependencies:

1. `company_profiles`
2. `jobs`
3. `resume_pool`
4. `applications`
5. `candidate_comments`
6. `candidate_status`
7. `job_collaborators`
8. `job_invitations`
9. `job_offers`
10. `screening_results`

### Step 5: Create Indexes
Execute all index creation statements as provided in the schema.

### Step 6: Create Triggers
Execute all trigger creation statements as provided in the schema.

### Step 7: Set Up Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for company_profiles)
CREATE POLICY "Users can view own company profile" ON company_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile" ON company_profiles
    FOR UPDATE USING (auth.uid() = user_id);
```

## Data Migration Notes

### Important Considerations:
1. **UUID Generation**: All tables use `gen_random_uuid()` for primary keys
2. **Timestamps**: Most tables have `created_at` and `updated_at` with automatic defaults
3. **Foreign Keys**: Proper cascade rules are set up for data integrity
4. **Full-Text Search**: Resume text is indexed for search functionality
5. **Array Fields**: Skills are stored as text arrays for efficient querying
6. **Status Validation**: Check constraints ensure data consistency

### Backup Strategy:
- Regular automated backups of the entire database
- Export of critical tables (company_profiles, jobs, resume_pool) separately
- Backup of file storage (resume PDFs, offer PDFs) separately

### Recovery Testing:
- Test database recovery in staging environment monthly
- Verify all triggers and functions work correctly
- Test full-text search functionality
- Validate foreign key constraints

---

**Last Updated**: January 2025
**Schema Version**: 1.0
**Database**: PostgreSQL (Supabase)
