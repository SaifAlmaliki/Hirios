
interface ResumeWebhookData {
  application_id: string;
  resume_base64: string;
  resume_filename: string;
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

interface ResumePoolWebhookData {
  resume_id: string;
  resume_base64: string;
  resume_filename: string;
  company_id: string;
  uploaded_at: string;
  upload_source: 'resume_pool';
  uploaded_by_company: true;
}

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
const RESUME_POOL_WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_RESUME_POOL_URL;

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

export const sendResumeToWebhook = async (data: ResumeWebhookData): Promise<boolean> => {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ No webhook URL configured');
    return false;
  }

  try {
    console.log('📤 Sending resume webhook for:', data.resume_filename);
    console.log('📋 Webhook payload:', {
      application_id: data.application_id,
      resume_filename: data.resume_filename,
      resume_base64_length: data.resume_base64.length,
      job_id: data.job_id,
      job_title: data.job_title,
      company: data.company,
      applied_at: data.applied_at,
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

    console.log('✅ Resume webhook delivered successfully');
    return true;
  } catch (error) {
    console.error('❌ Resume webhook failed:', error);
    return false;
  }
};

export const sendResumePoolToWebhook = async (data: ResumePoolWebhookData): Promise<boolean> => {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_RESUME_POOL_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ No resume pool webhook URL configured');
    return false;
  }

  try {
    console.log('📤 Sending resume pool webhook for:', data.resume_filename);
    console.log('📋 Webhook payload:', {
      resume_id: data.resume_id,
      resume_filename: data.resume_filename,
      resume_base64_length: data.resume_base64.length,
      company_id: data.company_id,
      uploaded_at: data.uploaded_at,
      upload_source: data.upload_source,
      uploaded_by_company: data.uploaded_by_company
    });

    // Use CORS proxy for development if the URL doesn't support CORS
    const isDevelopment = import.meta.env.DEV;
    const finalUrl = isDevelopment && webhookUrl.includes('n8n.cognitechx.com') 
      ? `https://cors-anywhere.herokuapp.com/${webhookUrl}`
      : webhookUrl;

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers for the proxy
        ...(isDevelopment && finalUrl.includes('cors-anywhere') && {
          'X-Requested-With': 'XMLHttpRequest'
        })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Resume pool webhook delivered successfully');
    return true;
  } catch (error) {
    console.error('❌ Resume pool webhook failed:', error);
    // Don't fail the upload if webhook fails - just log the error
    console.warn('⚠️ Continuing with upload despite webhook failure');
    return false;
  }
};

export { fileToBase64 };
