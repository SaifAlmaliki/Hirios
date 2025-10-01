import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Send email using Resend
    console.log('📧 Sending interview scheduling email to:', to);
    
    // Use Resend test domain for development, or your verified domain for production
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';
    
    const emailPayload = {
      from: `Hirios <${fromEmail}>`,
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
    };

    console.log('📤 Email payload:', JSON.stringify(emailPayload, null, 2));

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('📊 Resend response status:', resendResponse.status);

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('❌ Resend error details:', errorData);
      return new Response(
        JSON.stringify({
          error: 'Failed to send email via Resend',
          details: errorData,
          status: resendResponse.status,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const responseData = await resendResponse.json();
    console.log('✅ Resend success response:', responseData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Interview scheduling email sent successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
