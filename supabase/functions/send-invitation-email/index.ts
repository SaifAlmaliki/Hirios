import { serve } from "std/http/server.ts"

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
    const { to, jobTitle, companyName, inviterCompany, invitationLink, expiresAt } = await req.json()

    // Create email content
    const subject = `You're invited to collaborate on "${jobTitle}" at ${companyName}`
    
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
    `

    // Send email using Resend
    console.log('📧 Sending email to:', to)
    console.log('🔑 API Key exists:', !!Deno.env.get('RESEND_API_KEY'))
    console.log('🔑 API Key starts with re_:', Deno.env.get('RESEND_API_KEY')?.startsWith('re_'))
    
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
    `

    const emailPayload = {
      from: 'Hirios <noreply@hirios.com>', // Using your verified domain
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
    }
    
    console.log('📤 Email payload:', JSON.stringify(emailPayload, null, 2))

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    console.log('📊 Resend response status:', resendResponse.status)
    console.log('📊 Resend response headers:', Object.fromEntries(resendResponse.headers.entries()))

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('❌ Resend error details:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email via Resend',
          details: errorData,
          status: resendResponse.status
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const responseData = await resendResponse.json()
    console.log('✅ Resend success response:', responseData)

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully via Resend' }),
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
