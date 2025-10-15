// @deno-types="npm:@types/nodemailer@6.4.14"
import nodemailer from "npm:nodemailer@6.9.8";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      to,
      participantName,
      recruiterName,
      candidateName,
      jobTitle,
      companyName,
      votingLink,
      interviewDuration,
      timeSlots,
      companyId, // Add companyId to get SMTP config
    } = await req.json();

    // Format time slots for display
    const formatTimeSlot = (slot: { start_time: string; end_time: string }) => {
      const start = new Date(slot.start_time);
      const end = new Date(slot.end_time);
      return `${start.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })} - ${end.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    };

    const timeSlotsHtml = timeSlots
      .map((slot: any) => `<li style="margin: 8px 0;">${formatTimeSlot(slot)}</li>`)
      .join('');

    // Create email content
    const subject = `Interview Availability Request: ${candidateName} - ${jobTitle}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Interview Scheduling Request</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>Hello ${participantName},</h2>
          
          <p><strong>${recruiterName}</strong> from <strong>${companyName}</strong> is scheduling an interview for:</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Candidate: ${candidateName}</h3>
            <p style="margin: 0; color: #6b7280;">Position: ${jobTitle}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Duration: ${interviewDuration} minutes</p>
          </div>
          
          <p><strong>Your input is needed!</strong></p>
          <p>Please select all time slots when you are available for this ${interviewDuration}-minute interview:</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Proposed Time Slots:</h4>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
              ${timeSlotsHtml}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${votingLink}" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              Select Your Availability
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            Once all participants have responded, the recruiter will confirm the final interview time 
            and notify everyone involved.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            <strong>Note:</strong> You can select multiple time slots. The system will find the best 
            time that works for everyone.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p>This invitation was sent from Hirios Job Portal</p>
        </div>
      </div>
    `;

    const textContent = `
Interview Scheduling Request

Hello ${participantName},

${recruiterName} from ${companyName} is scheduling an interview for:

Candidate: ${candidateName}
Position: ${jobTitle}
Duration: ${interviewDuration} minutes

Your input is needed!

Please select all time slots when you are available for this ${interviewDuration}-minute interview.

Vote on your availability: ${votingLink}

Once all participants have responded, the recruiter will confirm the final interview time and notify everyone involved.

Note: You can select multiple time slots. The system will find the best time that works for everyone.

This invitation was sent from Hirios Job Portal
    `;

    // Get SMTP configuration from company profile
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📧 Sending interview scheduling email to:', to);
    console.log('🏢 Company ID:', companyId);

    // Fetch company SMTP configuration
    const { data: companyData, error: companyError } = await supabase
      .from('company_profiles')
      .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_secure')
      .eq('id', companyId)
      .single();

    if (companyError || !companyData) {
      console.error('❌ Failed to fetch company SMTP config:', companyError);
      return new Response(
        JSON.stringify({
          error: 'Company SMTP configuration not found',
          details: companyError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate SMTP configuration
    if (!companyData.smtp_host || !companyData.smtp_user || !companyData.smtp_password || !companyData.smtp_from_email) {
      console.error('❌ Incomplete SMTP configuration');
      return new Response(
        JSON.stringify({
          error: 'Incomplete SMTP configuration',
          message: 'Please configure SMTP settings in Company Setup',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Interview scheduling email sent successfully via SMTP',
        messageId: info.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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
    
    return new Response(
      JSON.stringify({
        error: 'Failed to send email via SMTP',
        message: errorMessage,
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
