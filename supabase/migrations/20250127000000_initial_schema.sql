

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'B2B Resume Screening Platform - Company profiles created by frontend only';



CREATE OR REPLACE FUNCTION "public"."accept_job_invitation"("invitation_token" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  invitation_record RECORD;
  user_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM public.job_invitations 
  WHERE token = invitation_token 
  AND status = 'pending' 
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Get current user
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Check if user email matches invitation
  IF user_record.email != invitation_record.invited_email THEN
    RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Add user as collaborator
  INSERT INTO public.job_collaborators (job_id, user_id, invited_by)
  VALUES (invitation_record.job_id, user_record.id, invitation_record.invited_by)
  ON CONFLICT (job_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.job_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object('success', true, 'job_id', invitation_record.job_id);
END;
$$;


ALTER FUNCTION "public"."accept_job_invitation"("invitation_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_expired_offers"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE job_offers 
    SET offer_status = 'expired',
        updated_at = now()
    WHERE offer_status IN ('sent', 'draft')
    AND expiry_date < CURRENT_DATE;
END;
$$;


ALTER FUNCTION "public"."check_expired_offers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_invitations"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.job_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_company_profile_for_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Create company profile for all new users (B2B platform)
  INSERT INTO public.company_profiles (
    user_id, 
    company_name, 
    company_website,
    company_description,
    company_size,
    industry,
    address,
    phone,
    subscription_plan
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
    NEW.raw_user_meta_data ->> 'company_website',
    NEW.raw_user_meta_data ->> 'company_description',
    NEW.raw_user_meta_data ->> 'company_size',
    NEW.raw_user_meta_data ->> 'industry',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'phone',
    'free'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Points will be added by application code instead
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_company_profile_for_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_job_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.company_profiles 
  SET jobs_posted_this_month = GREATEST(0, jobs_posted_this_month - 1)
  WHERE id = OLD.company_profile_id;
  
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."decrement_job_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.company_profiles (user_id, company_name)
  VALUES (new.id, 'My Company');
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_job_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.company_profiles 
  SET jobs_posted_this_month = jobs_posted_this_month + 1
  WHERE id = NEW.company_profile_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_job_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer DEFAULT NULL::integer, "filter" "jsonb" DEFAULT '{}'::"jsonb") RETURNS TABLE("id" bigint, "content" "text", "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;


ALTER FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer, "filter" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_monthly_job_counts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.company_profiles 
  SET jobs_posted_this_month = 0, 
      last_job_count_reset = now()
  WHERE last_job_count_reset < date_trunc('month', now());
END;
$$;


ALTER FUNCTION "public"."reset_monthly_job_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_offer_expiry_date"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Set expiry date based on offer_date + expiry_period_days
    NEW.expiry_date = NEW.offer_date + INTERVAL '1 day' * NEW.expiry_period_days;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_offer_expiry_date"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_candidate_status_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_candidate_status_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_email_configurations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_email_configurations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_resume_pool_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_resume_pool_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "resume_url" "text",
    "resume_text" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "original_filename" "text",
    "uploaded_by_user_id" "uuid",
    "storage_path" "text",
    "resume_pool_id" "uuid"
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


COMMENT ON TABLE "public"."applications" IS 'Job applications from candidates with company upload support';



COMMENT ON COLUMN "public"."applications"."resume_pool_id" IS 'References the resume_pool item that was used to create this application. NULL for applications created from direct uploads.';



CREATE TABLE IF NOT EXISTS "public"."candidate_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resume_pool_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "comment" "text" NOT NULL,
    "created_by_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."candidate_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resume_pool_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "updated_by_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "candidate_status_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'screened'::"text", 'shortlisted'::"text", 'first_interview'::"text", 'second_interview'::"text", 'interview_scheduled'::"text", 'accepted'::"text", 'rejected'::"text", 'blocked'::"text", 'offer_sent'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."candidate_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "company_name" "text",
    "company_description" "text",
    "company_website" "text",
    "company_size" "text",
    "industry" "text",
    "address" "text",
    "phone" "text",
    "logo_url" "text",
    "subscription_plan" "text" DEFAULT 'free'::"text",
    "jobs_posted_this_month" integer DEFAULT 0,
    "last_job_count_reset" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."company_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."company_profiles" IS 'Company profiles for B2B platform - all users are companies';



CREATE TABLE IF NOT EXISTS "public"."job_collaborators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "user_id" "uuid",
    "invited_by" "uuid",
    "role" "text" DEFAULT 'collaborator'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_collaborators" OWNER TO "postgres";


COMMENT ON TABLE "public"."job_collaborators" IS 'Collaborators for job postings';



CREATE TABLE IF NOT EXISTS "public"."job_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "invited_email" "text",
    "invited_by" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "token" "text" DEFAULT ("gen_random_uuid"())::"text",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_invitations" OWNER TO "postgres";


COMMENT ON TABLE "public"."job_invitations" IS 'Invitations to collaborate on jobs';



CREATE TABLE IF NOT EXISTS "public"."job_offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resume_pool_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "salary_amount" numeric(12,2) NOT NULL,
    "salary_currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "bonus_amount" numeric(12,2),
    "bonus_description" "text",
    "benefits" "text" NOT NULL,
    "reports_to" "text" NOT NULL,
    "insurance_details" "text",
    "offer_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "offer_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "expiry_date" "date" NOT NULL,
    "expiry_period_days" integer DEFAULT 14 NOT NULL,
    "pdf_file_path" "text",
    "pdf_file_url" "text",
    "email_cc_addresses" "text"[],
    "created_by_user_id" "uuid" NOT NULL,
    "sent_at" timestamp with time zone,
    "responded_at" timestamp with time zone,
    "response_comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "job_offers_offer_status_check" CHECK (("offer_status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'accepted'::"text", 'rejected'::"text", 'expired'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."job_offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_profile_id" "uuid",
    "title" "text",
    "description" "text",
    "requirements" "text",
    "responsibilities" "text",
    "location" "text",
    "employment_type" "text" DEFAULT 'full-time'::"text",
    "experience_level" "text" DEFAULT 'mid-level'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "benefits" "text",
    "department" "text" NOT NULL,
    "company" "text" NOT NULL,
    CONSTRAINT "jobs_employment_type_check" CHECK (("employment_type" = ANY (ARRAY['full-time'::"text", 'part-time'::"text", 'contract'::"text", 'temporary'::"text", 'internship'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."jobs" IS 'Job postings by companies';



CREATE TABLE IF NOT EXISTS "public"."resume_pool" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_profile_id" "uuid" NOT NULL,
    "original_filename" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "uploaded_by_user_id" "uuid" NOT NULL,
    "resume_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone" "text",
    "home_address" "text",
    "skills" "text"[]
);


ALTER TABLE "public"."resume_pool" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."screening_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "application_id" "uuid",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "home_address" "text",
    "resume_url" "text",
    "resume_text" "text",
    "overall_fit" integer,
    "strengths" "text",
    "weaknesses" "text",
    "risk_factor" "text",
    "reward_factor" "text",
    "justification" "text",
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "voice_screening_requested" boolean DEFAULT false,
    "voice_screening_completed" boolean DEFAULT false,
    "voice_screening_notes" "text",
    "interview_summary" "text",
    "interview_completed_at" timestamp with time zone,
    "is_favorite" boolean DEFAULT false,
    "is_dismissed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "skills" "text"[]
);


ALTER TABLE "public"."screening_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."screening_results" IS 'AI-powered candidate screening and evaluation results. Notes functionality moved to candidate_comments table for better organization and history tracking.';



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_comments"
    ADD CONSTRAINT "candidate_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_status"
    ADD CONSTRAINT "candidate_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_status"
    ADD CONSTRAINT "candidate_status_resume_pool_id_job_id_key" UNIQUE ("resume_pool_id", "job_id");



ALTER TABLE ONLY "public"."company_profiles"
    ADD CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_profiles"
    ADD CONSTRAINT "company_profiles_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."job_collaborators"
    ADD CONSTRAINT "job_collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_invitations"
    ADD CONSTRAINT "job_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_offers"
    ADD CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_offers"
    ADD CONSTRAINT "job_offers_resume_pool_id_job_id_key" UNIQUE ("resume_pool_id", "job_id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_pool"
    ADD CONSTRAINT "resume_pool_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."screening_results"
    ADD CONSTRAINT "screening_results_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_applications_job_id" ON "public"."applications" USING "btree" ("job_id");



CREATE INDEX "idx_applications_original_filename" ON "public"."applications" USING "btree" ("original_filename");



CREATE INDEX "idx_applications_resume_pool_id" ON "public"."applications" USING "btree" ("resume_pool_id");



CREATE INDEX "idx_applications_resume_text" ON "public"."applications" USING "gin" ("to_tsvector"('"english"'::"regconfig", "resume_text"));



CREATE INDEX "idx_applications_storage_path" ON "public"."applications" USING "btree" ("storage_path");



CREATE INDEX "idx_applications_uploaded_by_user_id" ON "public"."applications" USING "btree" ("uploaded_by_user_id");



CREATE INDEX "idx_candidate_comments_created_at" ON "public"."candidate_comments" USING "btree" ("created_at");



CREATE INDEX "idx_candidate_comments_created_by" ON "public"."candidate_comments" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_candidate_comments_job_id" ON "public"."candidate_comments" USING "btree" ("job_id");



CREATE INDEX "idx_candidate_comments_resume_pool_id" ON "public"."candidate_comments" USING "btree" ("resume_pool_id");



CREATE INDEX "idx_candidate_status_job_id" ON "public"."candidate_status" USING "btree" ("job_id");



CREATE INDEX "idx_candidate_status_resume_pool_id" ON "public"."candidate_status" USING "btree" ("resume_pool_id");



CREATE INDEX "idx_candidate_status_status" ON "public"."candidate_status" USING "btree" ("status");



CREATE INDEX "idx_candidate_status_updated_by" ON "public"."candidate_status" USING "btree" ("updated_by_user_id");



CREATE INDEX "idx_company_profiles_subscription_plan" ON "public"."company_profiles" USING "btree" ("subscription_plan");



CREATE INDEX "idx_company_profiles_user_id" ON "public"."company_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_job_collaborators_job_id" ON "public"."job_collaborators" USING "btree" ("job_id");



CREATE INDEX "idx_job_collaborators_user_id" ON "public"."job_collaborators" USING "btree" ("user_id");



CREATE INDEX "idx_job_invitations_email" ON "public"."job_invitations" USING "btree" ("invited_email");



CREATE INDEX "idx_job_invitations_job_id" ON "public"."job_invitations" USING "btree" ("job_id");



CREATE INDEX "idx_job_invitations_token" ON "public"."job_invitations" USING "btree" ("token");



CREATE INDEX "idx_job_offers_created_at" ON "public"."job_offers" USING "btree" ("created_at");



CREATE INDEX "idx_job_offers_created_by" ON "public"."job_offers" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_job_offers_expiry_date" ON "public"."job_offers" USING "btree" ("expiry_date");



CREATE INDEX "idx_job_offers_job_id" ON "public"."job_offers" USING "btree" ("job_id");



CREATE INDEX "idx_job_offers_resume_pool_id" ON "public"."job_offers" USING "btree" ("resume_pool_id");



CREATE INDEX "idx_job_offers_status" ON "public"."job_offers" USING "btree" ("offer_status");



CREATE INDEX "idx_jobs_company_profile_id" ON "public"."jobs" USING "btree" ("company_profile_id");



CREATE INDEX "idx_resume_pool_company_profile_id" ON "public"."resume_pool" USING "btree" ("company_profile_id");



CREATE INDEX "idx_resume_pool_email" ON "public"."resume_pool" USING "btree" ("email");



CREATE INDEX "idx_resume_pool_first_name" ON "public"."resume_pool" USING "btree" ("first_name");



CREATE INDEX "idx_resume_pool_last_name" ON "public"."resume_pool" USING "btree" ("last_name");



CREATE INDEX "idx_resume_pool_original_filename" ON "public"."resume_pool" USING "btree" ("original_filename");



CREATE INDEX "idx_resume_pool_phone" ON "public"."resume_pool" USING "btree" ("phone");



CREATE INDEX "idx_resume_pool_resume_text" ON "public"."resume_pool" USING "gin" ("to_tsvector"('"english"'::"regconfig", "resume_text"));



CREATE INDEX "idx_resume_pool_skills" ON "public"."resume_pool" USING "gin" ("skills");



CREATE INDEX "idx_resume_pool_uploaded_by_user_id" ON "public"."resume_pool" USING "btree" ("uploaded_by_user_id");



CREATE INDEX "idx_screening_results_application_id" ON "public"."screening_results" USING "btree" ("application_id");



CREATE INDEX "idx_screening_results_home_address" ON "public"."screening_results" USING "btree" ("home_address");



CREATE INDEX "idx_screening_results_is_dismissed" ON "public"."screening_results" USING "btree" ("is_dismissed");



CREATE INDEX "idx_screening_results_is_favorite" ON "public"."screening_results" USING "btree" ("is_favorite");



CREATE INDEX "idx_screening_results_job_id" ON "public"."screening_results" USING "btree" ("job_id");



CREATE INDEX "idx_screening_results_phone" ON "public"."screening_results" USING "btree" ("phone");



CREATE INDEX "idx_screening_results_skills" ON "public"."screening_results" USING "gin" ("skills");



CREATE INDEX "idx_screening_results_voice_screening_requested" ON "public"."screening_results" USING "btree" ("voice_screening_requested");



CREATE OR REPLACE TRIGGER "decrement_job_count_trigger" AFTER DELETE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_job_count"();



CREATE OR REPLACE TRIGGER "increment_job_count_trigger" AFTER INSERT ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."increment_job_count"();



CREATE OR REPLACE TRIGGER "trigger_set_offer_expiry_date" BEFORE INSERT OR UPDATE ON "public"."job_offers" FOR EACH ROW EXECUTE FUNCTION "public"."set_offer_expiry_date"();



CREATE OR REPLACE TRIGGER "trigger_update_candidate_status_updated_at" BEFORE UPDATE ON "public"."candidate_status" FOR EACH ROW EXECUTE FUNCTION "public"."update_candidate_status_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_resume_pool_updated_at" BEFORE UPDATE ON "public"."resume_pool" FOR EACH ROW EXECUTE FUNCTION "public"."update_resume_pool_updated_at"();



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_resume_pool_id_fkey" FOREIGN KEY ("resume_pool_id") REFERENCES "public"."resume_pool"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."candidate_comments"
    ADD CONSTRAINT "candidate_comments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_comments"
    ADD CONSTRAINT "candidate_comments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_comments"
    ADD CONSTRAINT "candidate_comments_resume_pool_id_fkey" FOREIGN KEY ("resume_pool_id") REFERENCES "public"."resume_pool"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_status"
    ADD CONSTRAINT "candidate_status_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_status"
    ADD CONSTRAINT "candidate_status_resume_pool_id_fkey" FOREIGN KEY ("resume_pool_id") REFERENCES "public"."resume_pool"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_status"
    ADD CONSTRAINT "candidate_status_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_offers"
    ADD CONSTRAINT "job_offers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_offers"
    ADD CONSTRAINT "job_offers_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_offers"
    ADD CONSTRAINT "job_offers_resume_pool_id_fkey" FOREIGN KEY ("resume_pool_id") REFERENCES "public"."resume_pool"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_pool"
    ADD CONSTRAINT "resume_pool_company_profile_id_fkey" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_pool"
    ADD CONSTRAINT "resume_pool_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."screening_results"
    ADD CONSTRAINT "screening_results_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."screening_results"
    ADD CONSTRAINT "screening_results_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public access to applications for voice interviews" ON "public"."applications" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public access to jobs for voice interviews" ON "public"."jobs" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public access to screening_results for voice interviews" ON "public"."screening_results" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can insert applications" ON "public"."applications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can delete jobs" ON "public"."jobs" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert jobs" ON "public"."jobs" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update jobs" ON "public"."jobs" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view jobs" ON "public"."jobs" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Companies can insert their own profile" ON "public"."company_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Companies can update screening results for their jobs" ON "public"."screening_results" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Companies can update their own profile" ON "public"."company_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Companies can view applications for their jobs" ON "public"."applications" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."jobs"
     JOIN "public"."company_profiles" ON (("company_profiles"."id" = "jobs"."company_profile_id")))
  WHERE (("jobs"."id" = "applications"."job_id") AND ("company_profiles"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."jobs"
     JOIN "public"."job_collaborators" ON (("job_collaborators"."job_id" = "jobs"."id")))
  WHERE (("jobs"."id" = "applications"."job_id") AND ("job_collaborators"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Companies can view screening results for their jobs" ON "public"."screening_results" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Companies can view their own profile" ON "public"."company_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Public can view job offers by ID" ON "public"."job_offers" FOR SELECT USING (true);



CREATE POLICY "Users can add collaborators to their jobs" ON "public"."job_collaborators" FOR INSERT WITH CHECK ((("invited_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_collaborators"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can create invitations for their jobs" ON "public"."job_invitations" FOR INSERT WITH CHECK ((("invited_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_invitations"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can delete invitations for their jobs" ON "public"."job_invitations" FOR DELETE USING ((("invited_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_invitations"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can delete resumes from their company" ON "public"."resume_pool" FOR DELETE USING (("company_profile_id" IN ( SELECT "company_profiles"."id"
   FROM "public"."company_profiles"
  WHERE ("company_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert job offers for their company jobs" ON "public"."job_offers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."jobs" "j"
     JOIN "public"."company_profiles" "cp" ON (("j"."company_profile_id" = "cp"."id")))
  WHERE (("j"."id" = "job_offers"."job_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert resumes to their company" ON "public"."resume_pool" FOR INSERT WITH CHECK ((("company_profile_id" IN ( SELECT "company_profiles"."id"
   FROM "public"."company_profiles"
  WHERE ("company_profiles"."user_id" = "auth"."uid"()))) AND ("uploaded_by_user_id" = "auth"."uid"())));



CREATE POLICY "Users can manage candidate comments for their company" ON "public"."candidate_comments" USING ((EXISTS ( SELECT 1
   FROM ("public"."resume_pool" "rp"
     JOIN "public"."company_profiles" "cp" ON (("rp"."company_profile_id" = "cp"."id")))
  WHERE (("rp"."id" = "candidate_comments"."resume_pool_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage candidate status for their company" ON "public"."candidate_status" USING ((EXISTS ( SELECT 1
   FROM ("public"."resume_pool" "rp"
     JOIN "public"."company_profiles" "cp" ON (("rp"."company_profile_id" = "cp"."id")))
  WHERE (("rp"."id" = "candidate_status"."resume_pool_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can remove collaborators from their jobs" ON "public"."job_collaborators" FOR DELETE USING ((("invited_by" = "auth"."uid"()) OR ("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_collaborators"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can update invitations for their jobs" ON "public"."job_invitations" FOR UPDATE USING ((("invited_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_invitations"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can update job offers for their company jobs" ON "public"."job_offers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."jobs" "j"
     JOIN "public"."company_profiles" "cp" ON (("j"."company_profile_id" = "cp"."id")))
  WHERE (("j"."id" = "job_offers"."job_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update resumes from their company" ON "public"."resume_pool" FOR UPDATE USING (("company_profile_id" IN ( SELECT "company_profiles"."id"
   FROM "public"."company_profiles"
  WHERE ("company_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view collaborators for their jobs" ON "public"."job_collaborators" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_collaborators"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can view invitations for their jobs" ON "public"."job_invitations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."jobs"
  WHERE (("jobs"."id" = "job_invitations"."job_id") AND ("jobs"."company_profile_id" IN ( SELECT "company_profiles"."id"
           FROM "public"."company_profiles"
          WHERE ("company_profiles"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view job offers for their company jobs" ON "public"."job_offers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."jobs" "j"
     JOIN "public"."company_profiles" "cp" ON (("j"."company_profile_id" = "cp"."id")))
  WHERE (("j"."id" = "job_offers"."job_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view resumes from their company" ON "public"."resume_pool" FOR SELECT USING (("company_profile_id" IN ( SELECT "company_profiles"."id"
   FROM "public"."company_profiles"
  WHERE ("company_profiles"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_collaborators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_pool" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."screening_results" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_job_invitation"("invitation_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_job_invitation"("invitation_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_job_invitation"("invitation_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_expired_offers"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_expired_offers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_expired_offers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_company_profile_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_company_profile_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_company_profile_for_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_job_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_job_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_job_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_job_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_job_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_job_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer, "filter" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer, "filter" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer, "filter" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_monthly_job_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_monthly_job_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_monthly_job_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_offer_expiry_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_offer_expiry_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_offer_expiry_date"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_candidate_status_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_candidate_status_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_candidate_status_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_email_configurations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_email_configurations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_email_configurations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_resume_pool_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_resume_pool_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_resume_pool_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_comments" TO "anon";
GRANT ALL ON TABLE "public"."candidate_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_comments" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_status" TO "anon";
GRANT ALL ON TABLE "public"."candidate_status" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_status" TO "service_role";



GRANT ALL ON TABLE "public"."company_profiles" TO "anon";
GRANT ALL ON TABLE "public"."company_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."company_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."job_collaborators" TO "anon";
GRANT ALL ON TABLE "public"."job_collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."job_collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."job_invitations" TO "anon";
GRANT ALL ON TABLE "public"."job_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."job_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."job_offers" TO "anon";
GRANT ALL ON TABLE "public"."job_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."job_offers" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."resume_pool" TO "anon";
GRANT ALL ON TABLE "public"."resume_pool" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_pool" TO "service_role";



GRANT ALL ON TABLE "public"."screening_results" TO "anon";
GRANT ALL ON TABLE "public"."screening_results" TO "authenticated";
GRANT ALL ON TABLE "public"."screening_results" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
