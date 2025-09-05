
interface ApplicationWebhookData {
  application_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_base64?: string;
  resume_filename?: string;
  job_id: string;
  job_title: string;
  company: string;
  applied_at: string;
  upload_source?: string;
  uploaded_by_company?: boolean;
  job_details: {
    job_id: string;
    title: string;
    company: string;
    department: string;
    location: string;
    employment_type: string;
    description: string;
    responsibilities: string;
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

export const sendApplicationToWebhook = async (data: ApplicationWebhookData): Promise<boolean> => {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ No webhook URL configured');
    return false;
  }

  try {
    console.log('📤 Sending webhook for:', data.full_name);
    console.log('📋 Webhook payload:', {
      application_id: data.application_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      job_id: data.job_id,
      job_title: data.job_title,
      company: data.company,
      applied_at: data.applied_at,
      resume_filename: data.resume_filename,
      resume_base64_length: data.resume_base64?.length || 0,
      upload_source: data.upload_source,
      uploaded_by_company: data.uploaded_by_company,
      job_details: {
        job_id: data.job_details.job_id,
        title: data.job_details.title,
        company: data.job_details.company,
        department: data.job_details.department,
        location: data.job_details.location,
        employment_type: data.job_details.employment_type
      }
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Webhook delivered successfully');
    return true;
  } catch (error) {
    console.error('❌ Webhook failed:', error);
    return false;
  }
};

export { fileToBase64 };
