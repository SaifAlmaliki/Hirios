import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, jobTitle, companyName, inviterEmail, invitationLink, expiresAt } = await req.json()

    // Create email content
    const subject = `You're invited to collaborate on "${jobTitle}" at ${companyName}`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Job Collaboration Invitation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Job Collaboration Invitation</h1>
            </div>
            <div class="content">
              <h2>You're invited to collaborate!</h2>
              <p>Hello,</p>
              <p><strong>${inviterEmail}</strong> has invited you to collaborate on a job posting:</p>
              
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
              
              <div style="text-align: center;">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">
                This invitation expires on ${new Date(expiresAt).toLocaleDateString()}.
                If you don't have an account, you'll be prompted to create one.
              </p>
            </div>
            <div class="footer">
              <p>This invitation was sent from Hirios Job Portal</p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
Job Collaboration Invitation

Hello,

${inviterEmail} has invited you to collaborate on a job posting:

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
    `

    // Send email using Supabase's built-in email service
    const { error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (error) {
      console.error('Error sending email:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
