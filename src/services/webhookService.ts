
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
      .from('settings')
      .select('value')
      .eq('key', 'webhook_url')
      .maybeSingle();

    if (error) {
      console.error('Error fetching webhook URL:', error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error('Error getting webhook URL:', error);
    return null;
  }
};

export const updateWebhookUrl = async (url: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'webhook_url', value: url });

    if (error) {
      console.error('Error updating webhook URL:', error);
      return false;
    }

    console.log('Webhook URL updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating webhook URL:', error);
    return false;
  }
};
