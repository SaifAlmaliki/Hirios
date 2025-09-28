# Supabase Migration Setup Guide

This guide will help you set up proper database migrations using Supabase CLI to replace manual SQL script execution.

## Prerequisites

- Supabase CLI installed (you have v2.40.7, latest is v2.45.5)
- Access to your Supabase project dashboard
- Your project reference ID: `bwuomwyodoyyrqgdlwrp`
- **Docker Desktop** (required for `supabase db pull`, `supabase db dump`, and `supabase db diff` commands)

## Current Status

✅ **Project Linked**: Your local project is successfully linked to remote Supabase project  
⚠️ **Migration History Mismatch**: Your local migration files don't match the remote database history  
⚠️ **Database Version Mismatch**: Local config shows PostgreSQL 15, remote is PostgreSQL 17

## Step-by-Step Setup

### Step 1: Update Database Version Configuration

First, update your `supabase/config.toml` to match your remote database version:

```bash
# Edit supabase/config.toml and change:
[db]
major_version = 17  # Change from 15 to 17
```

### Step 2: Repair Migration History

Your remote database has migrations that aren't reflected in your local files. Run these commands to repair the migration history:

```bash
# Mark existing migrations as applied
supabase migration repair --status applied 20241220
supabase migration repair --status applied 20250127
```

### Step 3: Pull Current Database Schema

**Option A: Full Schema Pull (Requires Docker Desktop)**
```bash
supabase db pull
```

**Option B: Schema Dump (Works without Docker) ✅ RECOMMENDED**
```bash
supabase db dump --schema public --file supabase/migrations/20250927181654_remote_schema.sql --linked
```

**Option C: Generate TypeScript Types (Works without Docker)**
```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

**Option D: Manual Schema Export (Alternative approach)**
If Docker is not available, you can manually export your schema from the Supabase dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
4. Copy the schema and create migration files manually

The full schema pull will create a new migration file with your current database state including:
- All tables and columns
- Indexes and constraints
- RLS (Row Level Security) policies
- Functions and triggers
- Custom types and extensions

### Step 4: Pull Edge Functions (Optional)

If you have Edge Functions deployed, download them:

```bash
# List all deployed functions
supabase functions list

# Download specific functions (replace with actual function names)
supabase functions download send-invitation-email
supabase functions download create-checkout-session
supabase functions download stripe-webhook
supabase functions download process-email-resumes
```

**Note**: The `supabase functions download` command requires a specific function name, not a general download command.

### Step 5: Verify Database State

Check the current database schema:

```bash
supabase db diff --schema public
```

### Step 6: Update CLI (Recommended)

Update to the latest Supabase CLI version:

```bash
# On Windows with npm
npm install -g supabase@latest

# Or download from: https://github.com/supabase/cli/releases
```

## Migration Workflow (Going Forward)

### Creating New Migrations

Instead of running SQL manually in Supabase UI:

1. **Make changes locally**:
   ```bash
   # Start local development
   supabase start
   ```

2. **Create migration from changes**:
   ```bash
   # After making schema changes
   supabase db diff --schema public > supabase/migrations/YYYYMMDDHHMMSS_description.sql
   ```

3. **Apply migration to remote**:
   ```bash
   supabase db push
   ```

### Alternative: Direct Migration Creation

For specific changes, create migration files manually:

```bash
# Create a new migration file
supabase migration new add_new_table

# Edit the generated file in supabase/migrations/
# Then apply it
supabase db push
```

## File Structure After Setup

```
supabase/
├── config.toml                 # Project configuration
├── migrations/                 # Database migration files
│   ├── 20241220_initial.sql   # Existing migrations
│   ├── 20250127_update.sql    # Existing migrations
│   └── YYYYMMDD_new_migration.sql  # New migrations
├── functions/                  # Edge Functions
│   ├── send-invitation-email/
│   ├── stripe-webhook/
│   └── ...
└── seed.sql                   # Seed data (optional)
```

## Best Practices

### 1. Always Use Migrations
- ❌ Don't run SQL directly in Supabase UI
- ✅ Create migration files for all changes
- ✅ Test migrations locally first

### 2. Migration Naming
- Use descriptive names: `add_user_preferences_table.sql`
- Include timestamp: `20250127_143022_add_user_preferences_table.sql`

### 3. Version Control
- Commit all migration files to git
- Never edit existing migration files
- Create new migrations for changes

### 4. Testing
- Test migrations locally: `supabase start`
- Verify changes: `supabase db diff`
- Apply to remote: `supabase db push`

## Troubleshooting

### Migration History Issues
```bash
# Reset migration history (use with caution)
supabase migration repair --status reverted <migration_id>

# Check migration status
supabase migration list
```

### Docker Desktop Issues
If you get Docker-related errors:
```bash
# Error: "Docker Desktop is a prerequisite for local development"
# Solution: Install Docker Desktop or use alternative approaches

# Alternative 1: Generate TypeScript types (works without Docker)
supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Alternative 2: Manual schema export from Supabase dashboard
# Go to SQL Editor and run schema queries manually
```

### Database Version Mismatch
```bash
# Check remote database version (requires Docker)
supabase db diff --schema public

# Update local config.toml to match
# Change major_version in supabase/config.toml
```

### Connection Issues
```bash
# Re-link project if needed
supabase link --project-ref bwuomwyodoyyrqgdlwrp
```

## Commands Reference

| Command | Purpose |
|---------|---------|
| `supabase link --project-ref <id>` | Link to remote project |
| `supabase db pull` | Pull current schema as migration (requires Docker) |
| `supabase db dump --schema public --file <file> --linked` | Dump schema to file (works without Docker) |
| `supabase db push` | Apply local migrations to remote |
| `supabase db diff` | Show differences between local/remote (requires Docker) |
| `supabase gen types typescript --linked` | Generate TypeScript types (works without Docker) |
| `supabase functions list` | List all deployed Edge Functions |
| `supabase functions download <name>` | Download specific Edge Function |
| `supabase migration new <name>` | Create new migration file |
| `supabase migration list` | List all migrations |
| `supabase migration repair` | Fix migration history issues |
| `supabase start` | Start local development environment |
| `supabase stop` | Stop local development environment |

## Next Steps

1. ✅ Update `config.toml` database version to 17
2. ✅ Run migration repair commands
3. ✅ Pull current database schema
4. ✅ Verify setup with `supabase db diff`
5. 🔄 Start using migrations for all future changes

## Support

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Migration Best Practices](https://supabase.com/docs/guides/database/migrations)
