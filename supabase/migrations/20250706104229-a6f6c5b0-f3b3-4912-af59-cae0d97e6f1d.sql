
-- Drop the settings table and related functions
DROP FUNCTION IF EXISTS public.get_setting(text);
DROP FUNCTION IF EXISTS public.upsert_setting(text, text);
DROP TABLE IF EXISTS public.settings;
