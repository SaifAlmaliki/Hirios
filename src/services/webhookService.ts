
interface ApplicationWebhookData {
  full_name: string;
  email: string;
  phone: string;
  resume_base64?: string;
  resume_filename?: string;
  job_title: string;
  company: string;
  applied_at: string;
  job_details: {
    job_id: string;
    title: string;
    company: string;
    department: string;
    location: string;
    employment_type: string;
    salary?: string;
    description: string;
    requirements?: string;
    benefits?: string;
  };
}

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

// Validate environment variable
if (!WEBHOOK_URL) {
  throw new Error(
    'Missing webhook URL environment variable. Please check your .env.local file and ensure VITE_WEBHOOK_URL is set.'
  );
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const sendApplicationToWebhook = async (
  applicationData: ApplicationWebhookData
) => {
  try {
    console.log('Sending application data to webhook:', WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
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

export { fileToBase64 };
