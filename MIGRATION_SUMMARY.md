# Database Schema Migration Summary

## Date: 2025-10-01

## Problem Identified
When deleting a job, all screening results were automatically deleted (due to CASCADE), but applications remained orphaned in the database. Additionally, there was redundant resume data stored across multiple tables (`applications`, `screening_results`, and `resume_pool`).

## Solution Implemented

### 1. Database Migration
**File:** `supabase/migrations/20251001000000_fix_applications_cascade_and_remove_redundancy.sql`

#### Changes Made:
- **Added CASCADE deletion** to `applications.job_id` foreign key
  - Applications now automatically delete when their associated job is deleted
  
- **Updated `applications.resume_pool_id`** constraint:
  - Changed to `NOT NULL` (required field)
  - Added `ON DELETE CASCADE` to maintain referential integrity
  
- **Removed redundant columns** from `applications` table:
  - `resume_url` (now accessed via `resume_pool.storage_path`)
  - `resume_text` (now accessed via `resume_pool.resume_text`)
  - `storage_path` (now accessed via `resume_pool.storage_path`)
  
- **Removed redundant columns** from `screening_results` table:
  - `resume_url` (now accessed via `application_id -> resume_pool_id -> storage_path`)
  - `resume_text` (now accessed via `application_id -> resume_pool_id -> resume_text`)

- **Dropped unused index:**
  - `idx_applications_storage_path`

### 2. TypeScript Type Updates
**File:** `src/integrations/supabase/types.ts`

- Updated `applications` table types to remove `resume_url`, `resume_text`, `storage_path`
- Changed `resume_pool_id` from optional to required in Row and Insert types
- Updated `screening_results` table types to remove `resume_url`, `resume_text`
- Added missing `is_rejected` and `rejected_at` fields to `screening_results`

### 3. Hook Updates

#### `src/hooks/useScreeningResults.ts`
- Removed `resume_url` and `resume_text` from ScreeningResult interface
- Updated query to only fetch `resume_pool_id` from applications
- Removed redundant data fetching for resume URL and text

#### `src/hooks/useApplications.ts`
- Updated Application interface to replace `resume_url` with `resume_pool_id`
- Changed `resume_pool_id` from optional to required

#### `src/hooks/useJobs.ts`
- Removed manual deletion logic for applications and screening_results
- Added comment noting that CASCADE handles automatic deletion
- Removed storage file cleanup logic (no longer needed)

### 4. Component Updates

#### `src/components/ApplicationCard.tsx`
- Added React state to fetch resume URL from `resume_pool` table
- Implemented useEffect to dynamically load `storage_path` based on `resume_pool_id`
- Updated download handler to use fetched resume URL

#### `src/components/ScreeningResultActions.tsx`
- Replaced `resumeUrl` prop with `resumePoolId`
- Added React state and useEffect to fetch resume URL from `resume_pool`
- Updated download handler to use dynamically fetched URL

#### `src/components/ScreeningResultCard.tsx`
- Updated to pass `resumePoolId` instead of `resumeUrl` to ScreeningResultActions

#### `src/pages/ScreeningResultDetail.tsx`
- Updated resume download handler to fetch storage path from `resume_pool` table
- Changed condition from `result.resume_url` to `result.resume_pool_id`

#### `src/components/CompanyResumeUpload.tsx`
- Updated application insert to only include `resume_pool_id`
- Removed `resume_url` from insert statement

#### `src/components/ResumePoolSelector.tsx`
- Updated application insert to only include `resume_pool_id`
- Removed `resume_url`, `resume_text`, and `storage_path` from insert statement

## Data Flow After Migration

### Resume Access Pattern:
```
screening_results -> application_id -> applications -> resume_pool_id -> resume_pool -> storage_path
```

### Cascade Deletion Flow:
```
DELETE job -> CASCADE DELETE applications -> CASCADE DELETE screening_results
DELETE resume_pool -> CASCADE DELETE applications -> CASCADE DELETE screening_results
```

## Benefits

1. **Data Consistency:** Single source of truth for resume data in `resume_pool` table
2. **Automatic Cleanup:** Jobs, applications, and screening results cascade delete properly
3. **Reduced Redundancy:** No duplicate resume URLs or text across tables
4. **Referential Integrity:** All foreign keys properly enforce CASCADE rules
5. **Simplified Maintenance:** Resume files managed centrally in `resume_pool`

## Testing Checklist

- [ ] Run the migration on development database
- [ ] Verify applications cascade delete when job is deleted
- [ ] Verify screening results cascade delete when job is deleted
- [ ] Test resume download functionality in ApplicationCard
- [ ] Test resume download functionality in ScreeningResultCard
- [ ] Test resume download functionality in ScreeningResultDetail
- [ ] Test creating new applications from CompanyResumeUpload
- [ ] Test creating new applications from ResumePoolSelector
- [ ] Verify no TypeScript compilation errors
- [ ] Test in production environment

## Notes

- The migration assumes all existing applications have `resume_pool_id` populated
- If there are orphaned applications without `resume_pool_id`, they need to be cleaned up before running this migration
- The lint warnings in CompanyResumeUpload.tsx and ResumePoolSelector.tsx are pre-existing and not related to this migration
