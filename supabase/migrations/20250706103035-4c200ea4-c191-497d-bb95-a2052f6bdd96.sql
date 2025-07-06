
-- Drop and recreate the upsert_setting function with correct syntax
DROP FUNCTION IF EXISTS public.upsert_setting(text, text);

CREATE OR REPLACE FUNCTION public.upsert_setting(setting_key TEXT, setting_value TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.settings (key, value, updated_at)
  VALUES (setting_key, setting_value, now())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
