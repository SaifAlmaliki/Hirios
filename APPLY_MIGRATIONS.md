# How to Apply Database Migrations

## Current Schema Issue

Your `company_profiles` table still has old columns from the multi-provider implementation:
- ❌ `email_provider` (not needed)
- ❌ `resend_api_key` (not needed)
- ❌ `sendgrid_api_key` (not needed)

We need to clean these up!

---

## Option 1: Apply Migrations (Recommended)

Run these migrations in order:

```bash
cd supabase
npx supabase migration up
```

This will apply:
1. `20250213000000_add_smtp_config_to_company_profiles.sql` - Adds SMTP columns
2. `20250213000001_cleanup_smtp_only.sql` - Removes old Resend/SendGrid columns

---

## Option 2: Manual SQL (If migrations don't work)

Run this SQL directly in your Supabase SQL Editor:

```sql
-- Remove old provider columns
ALTER TABLE public.company_profiles
DROP COLUMN IF EXISTS email_provider,
DROP COLUMN IF EXISTS resend_api_key,
DROP COLUMN IF EXISTS sendgrid_api_key;

-- Set default for smtp_port
ALTER TABLE public.company_profiles
ALTER COLUMN smtp_port SET DEFAULT 587;

-- Update comment
COMMENT ON COLUMN public.company_profiles.smtp_port IS 'SMTP server port (587 for TLS recommended, 465 for SSL)';
```

---

## Final Schema

After applying migrations, your `company_profiles` table will have:

```sql
create table public.company_profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  company_name text null,
  company_description text null,
  company_website text null,
  company_size text null,
  industry text null,
  address text null,
  phone text null,
  logo_url text null,
  subscription_plan text null default 'free'::text,
  jobs_posted_this_month integer null default 0,
  last_job_count_reset timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  
  -- SMTP Configuration (ONLY these are needed)
  smtp_host text null,
  smtp_port integer null default 587,
  smtp_user text null,
  smtp_password text null,
  smtp_from_email text null,
  smtp_from_name text null,
  smtp_secure boolean null default true,
  
  constraint company_profiles_pkey primary key (id),
  constraint company_profiles_user_id_unique unique (user_id)
) TABLESPACE pg_default;
```

---

## Verify Migration

After applying, verify the columns are correct:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'company_profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

You should **NOT** see:
- ❌ `email_provider`
- ❌ `resend_api_key`
- ❌ `sendgrid_api_key`

You **SHOULD** see:
- ✅ `smtp_host`
- ✅ `smtp_port` (default: 587)
- ✅ `smtp_user`
- ✅ `smtp_password`
- ✅ `smtp_from_email`
- ✅ `smtp_from_name`
- ✅ `smtp_secure` (default: true)

---

## Next Step

After migrations are applied:

1. ✅ Schema is clean (SMTP only)
2. ✅ Go to Company Setup page
3. ✅ Configure your SMTP settings
4. ✅ Test email sending

---

**Ready to apply?** Run: `npx supabase migration up`

