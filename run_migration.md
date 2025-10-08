# Database Migration Instructions

## Adding Contract Dates to Job Offers

This migration adds support for contract-based employment offers by adding `start_date` and `end_date` fields to the `job_offers` table.

### Migration File
- **File**: `supabase/migrations/20250128000001_add_contract_dates_to_job_offers.sql`
- **Purpose**: Add start_date and end_date fields to job_offers table

### What the Migration Does

1. **Adds `start_date` field** (required, defaults to CURRENT_DATE)
   - All job offers must have a start date
   - Defaults to today's date for existing records

2. **Adds `end_date` field** (optional)
   - NULL for permanent employment
   - Set to specific date for contract-based employment

3. **Adds database constraints**
   - Ensures end_date is after start_date when both are provided
   - Adds performance indexes on both date fields

4. **Adds helpful comments**
   - Documents the purpose of each field

### Running the Migration

To apply this migration to your database:

```bash
# If using Supabase CLI
supabase db push

# Or if using direct SQL
psql -h your-host -U your-user -d your-database -f supabase/migrations/20250128000001_add_contract_dates_to_job_offers.sql
```

### After Migration

1. **Update your application** - The TypeScript types have been updated to reflect the new schema
2. **Test the job offer creation** - Verify that start_date and end_date fields work correctly
3. **Verify PDF generation** - Ensure contract dates appear correctly in generated offer PDFs

### Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the new fields
ALTER TABLE public.job_offers DROP COLUMN IF EXISTS start_date;
ALTER TABLE public.job_offers DROP COLUMN IF EXISTS end_date;

-- Remove indexes
DROP INDEX IF EXISTS idx_job_offers_start_date;
DROP INDEX IF EXISTS idx_job_offers_end_date;
```

### Notes

- The migration is designed to be safe and non-destructive
- Existing job offers will have their start_date set to the current date
- The end_date will be NULL for all existing offers (permanent employment)
- No data loss will occur during this migration
