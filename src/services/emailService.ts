/**
 * Email Service - Handles sending emails through SMTP via Supabase Edge Function
 * Supports any SMTP server (Namecheap, Zoho, Gmail, Outlook, etc.)
 */

import { supabase } from '@/integrations/supabase/client';

// Email configuration interface
export interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name?: string;
  smtp_secure: boolean;
}

// Email payload interface
export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

/**
 * Get email configuration for a company
 */
export async function getCompanyEmailConfig(companyId: string): Promise<EmailConfig | null> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_secure')
    .eq('id', companyId)
    .single();

  if (error || !data) {
    console.error('Failed to fetch email config:', error);
    return null;
  }

  // Validate required fields
  if (!data.smtp_host || !data.smtp_user || !data.smtp_password || !data.smtp_from_email) {
    console.error('Incomplete SMTP configuration');
    return null;
  }

  return {
    smtp_host: data.smtp_host,
    smtp_port: data.smtp_port || 587,
    smtp_user: data.smtp_user,
    smtp_password: data.smtp_password,
    smtp_from_email: data.smtp_from_email,
    smtp_from_name: data.smtp_from_name || undefined,
    smtp_secure: data.smtp_secure !== false,
  };
}

/**
 * Get email configuration by user ID
 */
export async function getCompanyEmailConfigByUserId(userId: string): Promise<EmailConfig | null> {
  // Get user's company membership to find company_profile_id
  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('company_profile_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (membershipError || !membership) {
    console.error('Failed to fetch company membership by user ID:', membershipError);
    return null;
  }

  // Get email config from company profile
  const { data, error } = await supabase
    .from('company_profiles')
    .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_secure')
    .eq('id', membership.company_profile_id)
    .single();

  if (error || !data) {
    console.error('Failed to fetch email config by company profile ID:', error);
    return null;
  }

  // Validate required fields
  if (!data.smtp_host || !data.smtp_user || !data.smtp_password || !data.smtp_from_email) {
    console.error('Incomplete SMTP configuration');
    return null;
  }

  return {
    smtp_host: data.smtp_host,
    smtp_port: data.smtp_port || 587,
    smtp_user: data.smtp_user,
    smtp_password: data.smtp_password,
    smtp_from_email: data.smtp_from_email,
    smtp_from_name: data.smtp_from_name || undefined,
    smtp_secure: data.smtp_secure !== false,
  };
}

/**
 * Send email via SMTP using Supabase Edge Function
 */
async function sendViaSMTP(config: EmailConfig, payload: EmailPayload): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('send-smtp-email', {
    body: {
      config,
      payload,
      action: 'send',
    },
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`);
  }

  if (!data?.success) {
    console.error('Email sending failed:', data);
    throw new Error(data?.message || data?.error || 'Failed to send email');
  }

  return true;
}

/**
 * Main function to send email via SMTP
 */
export async function sendEmail(config: EmailConfig, payload: EmailPayload): Promise<boolean> {
  try {
    return await sendViaSMTP(config, payload);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

/**
 * Send email by fetching config from current user's company
 */
export async function sendEmailFromCurrentUser(payload: EmailPayload): Promise<boolean> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get company email config
  const config = await getCompanyEmailConfigByUserId(user.id);
  
  if (!config) {
    throw new Error('Email configuration not found for company');
  }

  return await sendEmail(config, payload);
}

/**
 * Test SMTP connection with given configuration using Edge Function
 */
export async function testSMTPConnection(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        config,
        action: 'test',
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return {
        success: false,
        message: `Failed to test connection: ${error.message || JSON.stringify(error)}`,
      };
    }

    if (!data) {
      return {
        success: false,
        message: 'No response from Edge Function',
      };
    }

    return {
      success: data.success || false,
      message: data.message || 'Unknown response',
    };
  } catch (error: any) {
    console.error('Test connection error:', error);
    return {
      success: false,
      message: error.message || 'Failed to test SMTP connection',
    };
  }
}

/**
 * Test SMTP connection for current user's company
 */
export async function testCurrentUserSMTPConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    // Get company email config
    const config = await getCompanyEmailConfigByUserId(user.id);
    
    if (!config) {
      return {
        success: false,
        message: 'Email configuration not found. Please complete all SMTP settings first.',
      };
    }

    return await testSMTPConnection(config);
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to test SMTP connection',
    };
  }
}

