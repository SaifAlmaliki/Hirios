// @deno-types="npm:@types/nodemailer@6.4.14"
import nodemailer from "npm:nodemailer@6.9.8";
import { serve } from "std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { to, jobTitle, companyName, inviterCompany, invitationLink, expiresAt, companyId } = await req.json();
    // Create email content
    const subject = `You're invited to collaborate on "${jobTitle}" at ${companyName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Job Collaboration Invitation</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>You're invited to collaborate!</h2>
          <p>Hello,</p>
          <p><strong>${inviterCompany}</strong> has invited you to collaborate on a job posting:</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${jobTitle}</h3>
            <p style="margin: 0; color: #6b7280;">${companyName}</p>
          </div>
          
          <p>As a collaborator, you'll be able to:</p>
          <ul>
            <li>Edit job details and requirements</li>
            <li>View and manage applications</li>
            <li>Access screening results</li>
            <li>Delete the job posting if needed</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            This invitation expires on ${new Date(expiresAt).toLocaleDateString()}.
            If you don't have an account, you'll be prompted to create one.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p>This invitation was sent from Hirios Job Portal</p>
        </div>
      </div>
    `;
    // Get SMTP configuration from company profile
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📧 Sending invitation email to:', to);
    console.log('🏢 Company ID:', companyId);

    // Fetch company SMTP configuration
    const { data: companyData, error: companyError } = await supabase
      .from('company_profiles')
      .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_secure')
      .eq('id', companyId)
      .single();

    if (companyError || !companyData) {
      console.error('❌ Failed to fetch company SMTP config:', companyError);
      return new Response(JSON.stringify({
        error: 'Company SMTP configuration not found',
        details: companyError?.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate SMTP configuration
    if (!companyData.smtp_host || !companyData.smtp_user || !companyData.smtp_password || !companyData.smtp_from_email) {
      console.error('❌ Incomplete SMTP configuration');
      return new Response(JSON.stringify({
        error: 'Incomplete SMTP configuration',
        message: 'Please configure SMTP settings in Company Setup',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine connection settings
    const useSecure = companyData.smtp_port === 465;
    const useSTARTTLS = companyData.smtp_port === 587;

    // Create nodemailer transporter
    const transportConfig: any = {
      host: companyData.smtp_host,
      port: companyData.smtp_port,
      secure: useSecure,
      auth: {
        user: companyData.smtp_user,
        pass: companyData.smtp_password,
      },
    };

    // Add STARTTLS for port 587
    if (useSTARTTLS) {
      transportConfig.requireTLS = true;
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const textContent = `
Job Collaboration Invitation

Hello,

${inviterCompany} has invited you to collaborate on a job posting:

Job Title: ${jobTitle}
Company: ${companyName}

As a collaborator, you'll be able to:
- Edit job details and requirements
- View and manage applications
- Access screening results
- Delete the job posting if needed

Accept the invitation: ${invitationLink}

This invitation expires on ${new Date(expiresAt).toLocaleDateString()}.
If you don't have an account, you'll be prompted to create one.

This invitation was sent from Hirios Job Portal
    `;

    // Send email using SMTP
    const mailOptions = {
      from: companyData.smtp_from_name 
        ? `${companyData.smtp_from_name} <${companyData.smtp_from_email}>`
        : companyData.smtp_from_email,
      to: to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    console.log('📤 Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully. Message ID:', info.messageId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation email sent successfully via SMTP',
      messageId: info.messageId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Email send failed:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    let errorMessage = 'Failed to send email. ';
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage += 'Authentication failed. Check your SMTP username and password.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += 'Connection refused. Check your SMTP host and port.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      errorMessage += 'Connection timeout. Check your SMTP host and firewall settings.';
    } else if (error.message?.includes('TLS') || error.message?.includes('SSL')) {
      errorMessage += 'TLS/SSL error. Try using port 587 with STARTTLS.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }
    
    return new Response(JSON.stringify({
      error: 'Failed to send email via SMTP',
      message: errorMessage,
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
