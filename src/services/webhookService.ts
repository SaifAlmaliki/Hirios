
interface ResumeWebhookData {
  application_id: string;
  resume_pool_id?: string; // Add resume_pool_id for n8n
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

// Use different webhook URLs for different purposes
// Screening results use VITE_SCREENING_WEBHOOK_URL
// Resume pool uploads use VITE_WEBHOOK_RESUME_POOL_URL
const WEBHOOK_URL = import.meta.env.VITE_SCREENING_WEBHOOK_URL;
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
      resume_pool_id: data.resume_pool_id, // Log resume_pool_id
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
    console.warn('⚠️ No webhook URL configured');
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

    console.log('✅ Resume pool webhook delivered successfully');
    return true;
  } catch (error) {
    console.error('❌ Resume pool webhook failed:', error);
    // Don't fail the upload if webhook fails - just log the error
    console.warn('⚠️ Continuing with upload despite webhook failure');
    return false;
  }
};

// Reject candidate webhook data interface
export interface RejectCandidateWebhookData {
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  company_name: string;
  rejection_reason?: string;
  rejected_at: string;
  screening_result_id: string;
  application_id?: string;
}

// Send reject candidate webhook to n8n
export const sendRejectCandidateWebhook = async (data: RejectCandidateWebhookData): Promise<boolean> => {
  const webhookUrl = import.meta.env.VITE_REJECT_EMAIL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ No reject email webhook URL configured');
    return false;
  }
  
  try {
    console.log('📤 Sending reject candidate webhook for:', data.candidate_name);
    console.log('📋 Webhook payload:', {
      candidate_name: data.candidate_name,
      candidate_email: data.candidate_email,
      job_title: data.job_title,
      company_name: data.company_name,
      rejection_reason: data.rejection_reason,
      rejected_at: data.rejected_at,
      screening_result_id: data.screening_result_id,
      application_id: data.application_id
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

    console.log('✅ Reject candidate webhook delivered successfully');
    return true;
  } catch (error) {
    console.error('❌ Reject candidate webhook failed:', error);
    return false;
  }
};

export { fileToBase64 };
