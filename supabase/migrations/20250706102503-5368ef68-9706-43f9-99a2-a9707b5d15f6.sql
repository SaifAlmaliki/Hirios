

-- Create function to get a setting value by key
CREATE OR REPLACE FUNCTION public.get_setting(setting_key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT value FROM public.settings WHERE key = setting_key LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to upsert a setting (insert or update)
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

