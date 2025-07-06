
interface ApplicationWebhookData {
  full_name: string;
  email: string;
  phone: string;
  resume_url?: string;
  job_title: string;
  company: string;
  applied_at: string;
}

const HARDCODED_WEBHOOK_URL = 'https://n8n.cognitechx.com/webhook-test/easyhire';

export const sendApplicationToWebhook = async (
  applicationData: ApplicationWebhookData
) => {
  try {
    console.log('Sending application data to webhook:', HARDCODED_WEBHOOK_URL);
    
    const response = await fetch(HARDCODED_WEBHOOK_URL, {
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
