// @deno-types="npm:@types/nodemailer@6.4.14"
import nodemailer from "npm:nodemailer@6.9.8";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationPayload {
  invitedEmail: string;
  companyProfileId: string;
  inviterName: string;
  companyName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    const { invitedEmail, companyProfileId, inviterName, companyName } = requestBody as InvitationPayload;

    console.log('📧 Team Invitation Email Function called');
    console.log('Invited email:', invitedEmail);
    console.log('Company:', companyName);

    // Validate input
    if (!invitedEmail || !companyProfileId || !inviterName || !companyName) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get company profile with SMTP config
    const { data: companyProfile, error: profileError } = await supabase
      .from('company_profiles')
      .select('smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_secure')
      .eq('id', companyProfileId)
      .single();

    if (profileError || !companyProfile) {
      console.error('Failed to fetch company profile:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to fetch company profile',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if SMTP is configured
    if (!companyProfile.smtp_host || !companyProfile.smtp_user || !companyProfile.smtp_password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'SMTP not configured. Please configure email settings in Company Setup.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create invitation in database
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .insert({
        company_profile_id: companyProfileId,
        invited_email: invitedEmail,
        invited_by: user.id,
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Failed to create invitation:', invitationError);
      
      // Check if it's a duplicate invitation error
      const isDuplicate = invitationError.code === '23505';
      const errorMessage = isDuplicate 
        ? `This email already has a pending invitation. Please ask them to check their inbox or delete the existing invitation first.`
        : 'Failed to create invitation. Please try again.';
      
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get site URL
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080';
    const invitationLink = `${siteUrl}/join/${invitation.token}`;

    // Create nodemailer transporter
    const useSecure = companyProfile.smtp_port === 465;
    const useSTARTTLS = companyProfile.smtp_port === 587;

    const transportConfig: any = {
      host: companyProfile.smtp_host,
      port: companyProfile.smtp_port,
      secure: useSecure,
      auth: {
        user: companyProfile.smtp_user,
        pass: companyProfile.smtp_password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    };

    if (useSTARTTLS) {
      transportConfig.requireTLS = true;
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Prepare email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                You're Invited! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi there,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                <strong>${inviterName}</strong> has invited you to join the <strong>${companyName}</strong> team on Hirios!
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                As a team member, you'll be able to:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #333333;">
                <li>View and create job postings</li>
                <li>Access the resume pool</li>
                <li>Screen candidates with AI</li>
                <li>Send interview invitations and rejections</li>
                <li>Collaborate with your HR team</li>
              </ul>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${invitationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${invitationLink}" style="color: #667eea; word-break: break-all;">${invitationLink}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                This invitation was sent by ${companyName}
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} Hirios. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailText = `
You're Invited to Join ${companyName} on Hirios!

${inviterName} has invited you to join the ${companyName} team on Hirios.

As a team member, you'll be able to:
- View and create job postings
- Access the resume pool
- Screen candidates with AI
- Send interview invitations and rejections
- Collaborate with your HR team

Accept your invitation by clicking this link:
${invitationLink}

This invitation was sent by ${companyName}.
    `;

    // Send the email
    const mailOptions = {
      from: companyProfile.smtp_from_name 
        ? `${companyProfile.smtp_from_name} <${companyProfile.smtp_from_email}>`
        : companyProfile.smtp_from_email,
      to: invitedEmail,
      subject: `You're invited to join ${companyName} on Hirios`,
      html: emailHtml,
      text: emailText,
    };

    console.log('📨 Sending invitation email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent successfully. Message ID:', info.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error?.message || 'Internal server error',
        error: error?.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
