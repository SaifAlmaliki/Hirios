-- =====================================================
-- SUPABASE DATABASE AUDIT QUERIES
-- Run these in the Supabase SQL Editor to get complete database information
-- =====================================================

-- 1. TABLE INFORMATION
-- =====================================================
-- Get all tables with their schemas, sizes, and row counts
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_returned(c.oid) as estimated_rows
FROM pg_tables pt
LEFT JOIN pg_class c ON c.relname = pt.tablename
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. COLUMN INFORMATION
-- =====================================================
-- Get detailed column information for all tables
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as is_primary_key,
    CASE 
        WHEN fk.column_name IS NOT NULL THEN fk.foreign_table_name || '.' || fk.foreign_column_name
        ELSE NULL
    END as foreign_key_reference
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        ku.table_name, 
        ku.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON t.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 3. INDEXES INFORMATION
-- =====================================================
-- Get all indexes with their types and columns
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. CONSTRAINTS INFORMATION
-- =====================================================
-- Get all constraints (primary keys, foreign keys, unique, check)
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 5. FUNCTIONS AND PROCEDURES
-- =====================================================
-- Get all custom functions and procedures
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    l.lanname as language,
    p.prosrc as source_code,
    p.provolatile as volatility,
    p.proisstrict as is_strict,
    p.prosecdef as security_definer
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- 6. TRIGGERS INFORMATION
-- =====================================================
-- Get all triggers with their functions and timing
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_timing,
    t.action_orientation,
    t.action_statement,
    p.proname as trigger_function
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Get all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. SEQUENCES INFORMATION
-- =====================================================
-- Get all sequences (auto-increment fields)
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment,
    cycle_option
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- 9. VIEWS INFORMATION
-- =====================================================
-- Get all views and their definitions
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 10. STORAGE BUCKETS AND POLICIES
-- =====================================================
-- Get storage bucket information (if accessible)
SELECT 
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets
ORDER BY name;

-- 11. STORAGE OBJECTS
-- =====================================================
-- Get storage objects information
SELECT 
    bucket_id,
    name,
    metadata->>'size' as size,
    metadata->>'mimetype' as mime_type,
    created_at,
    updated_at
FROM storage.objects
ORDER BY bucket_id, created_at DESC
LIMIT 100;

-- 12. DATABASE SIZE AND STATISTICS
-- =====================================================
-- Get overall database statistics
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();

-- 13. TABLE SIZES BREAKDOWN
-- =====================================================
-- Get detailed size information for each table
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 14. RECENT ACTIVITY (if pg_stat_statements is enabled)
-- =====================================================
-- Get recent database activity (may not be available in all Supabase plans)
-- First check if pg_stat_statements extension is available
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements')
        THEN 'pg_stat_statements is available'
        ELSE 'pg_stat_statements is not available'
    END as extension_status;

-- If available, run this query:
-- SELECT 
--     query,
--     calls,
--     total_exec_time,
--     mean_exec_time,
--     rows
-- FROM pg_stat_statements
-- ORDER BY total_exec_time DESC
-- LIMIT 20;

-- Alternative: Get basic connection and activity info
SELECT 
    datname,
    numbackends as active_connections,
    xact_commit as committed_transactions,
    xact_rollback as rolled_back_transactions,
    blks_read as blocks_read,
    blks_hit as blocks_hit
FROM pg_stat_database 
WHERE datname = current_database();

-- 15. AUTH USERS AND ROLES
-- =====================================================
-- Get authentication users and their roles
SELECT 
    id,
    email,
    created_at,
    updated_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 16. CUSTOM TYPES AND ENUMS
-- =====================================================
-- Get custom data types and enums
SELECT 
    t.typname as type_name,
    t.typtype as type_type,
    e.enumlabel as enum_value
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY t.typname, e.enumsortorder;

-- 17. EXTENSIONS
-- =====================================================
-- Get installed extensions
SELECT 
    extname,
    extversion,
    extrelocatable,
    extnamespace::regnamespace as schema
FROM pg_extension
ORDER BY extname;

-- 18. GRANTS AND PERMISSIONS
-- =====================================================
-- Get table permissions
SELECT 
    table_name,
    grantor,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_name, grantee;

-- 19. FOREIGN DATA WRAPPERS (if any)
-- =====================================================
-- Get foreign data wrappers (may not be accessible in Supabase)
-- First check if the table exists and is accessible
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foreign_data_wrappers')
        THEN 'foreign_data_wrappers table is accessible'
        ELSE 'foreign_data_wrappers table is not accessible'
    END as fdw_status;

-- Alternative: Check for foreign data wrappers using pg_catalog
-- SELECT 
--     fdwname as fdw_name,
--     fdwowner::regrole as fdw_owner,
--     fdwhandler::regproc as fdw_handler,
--     fdwvalidator::regproc as fdw_validator
-- FROM pg_foreign_data_wrapper
-- ORDER BY fdwname;

-- Check for foreign servers instead (more commonly used)
SELECT 
    srvname as server_name,
    srvowner::regrole as server_owner,
    srvtype as server_type,
    srvversion as server_version
FROM pg_foreign_server
ORDER BY srvname;

-- 20. COMPLETE SCHEMA EXPORT
-- =====================================================
-- Get complete schema definition (DDL)
SELECT 
    'CREATE TABLE ' || t.table_schema || '.' || t.table_name || ' (' || E'\n' ||
    string_agg(
        '  ' || c.column_name || ' ' || c.data_type || 
        CASE 
            WHEN c.character_maximum_length IS NOT NULL 
            THEN '(' || c.character_maximum_length || ')'
            ELSE ''
        END ||
        CASE 
            WHEN c.is_nullable = 'NO' THEN ' NOT NULL'
            ELSE ''
        END ||
        CASE 
            WHEN c.column_default IS NOT NULL 
            THEN ' DEFAULT ' || c.column_default
            ELSE ''
        END,
        ',' || E'\n'
    ) || E'\n' || ');' as ddl
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
GROUP BY t.table_schema, t.table_name
ORDER BY t.table_name;

-- Alternative: Simpler table structure export
SELECT 
    t.table_name,
    string_agg(
        c.column_name || ' (' || c.data_type || 
        CASE 
            WHEN c.character_maximum_length IS NOT NULL 
            THEN '(' || c.character_maximum_length || ')'
            ELSE ''
        END || ')',
        ', '
    ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;
