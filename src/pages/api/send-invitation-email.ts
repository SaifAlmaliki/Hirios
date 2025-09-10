// This would be a Next.js API route or Vercel serverless function
// For now, we'll create a simple version that you can adapt

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, jobTitle, companyName, inviterCompany, invitationLink, expiresAt } = req.body;

  try {
    // Using Resend (recommended)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hirios <noreply@yourdomain.com>', // Replace with your domain
        to: [to],
        subject: `You're invited to collaborate on "${jobTitle}" at ${companyName}`,
        html: `
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
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
