
import { supabase } from '@/integrations/supabase/client';

interface ApplicationWebhookData {
  full_name: string;
  email: string;
  phone: string;
  resume_url?: string;
  job_title: string;
  company: string;
  applied_at: string;
}

export const sendApplicationToWebhook = async (
  applicationData: ApplicationWebhookData,
  webhookUrl?: string
) => {
  const url = webhookUrl || await getWebhookUrl();
  
  if (!url) {
    console.warn('No webhook URL configured for application notifications');
    return;
  }

  try {
    console.log('Sending application data to webhook:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'job_application',
        data: applicationData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }

    console.log('Application data sent successfully to webhook');
    return true;
  } catch (error) {
    console.error('Failed to send application to webhook:', error);
    throw error;
  }
};

const getWebhookUrl = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_setting', { setting_key: 'webhook_url' });

    if (error) {
      console.error('Error fetching webhook URL:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting webhook URL:', error);
    return null;
  }
};

export const updateWebhookUrl = async (url: string): Promise<boolean> => {
  try {
    console.log('Attempting to update webhook URL:', url);
    
    // First, try to get the existing setting to see if it exists
    const { data: existingSetting, error: getError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'webhook_url')
      .single();

    if (getError && getError.code !== 'PGRST116') {
      console.error('Error checking existing webhook URL:', getError);
      return false;
    }

    if (existingSetting) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('settings')
        .update({ 
          value: url,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'webhook_url');

      if (updateError) {
        console.error('Error updating webhook URL:', updateError);
        return false;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'webhook_url',
          value: url
        });

      if (insertError) {
        console.error('Error inserting webhook URL:', insertError);
        return false;
      }
    }

    console.log('Webhook URL updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating webhook URL:', error);
    return false;
  }
};
