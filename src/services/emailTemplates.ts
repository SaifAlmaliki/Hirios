/**
 * Email Templates for Candidate Communications
 * Includes: Voice Interview Invitation, Rejection Email, Job Offer Email
 */

export interface VoiceInterviewInviteData {
  candidate_name: string;
  job_title: string;
  company_name: string;
  interview_link: string;
}

export interface RejectionEmailData {
  candidate_name: string;
  job_title: string;
  company_name: string;
}

export interface JobOfferEmailData {
  candidate_name: string;
  job_title: string;
  company_name: string;
  salary_amount: number;
  salary_currency: string;
  bonus_amount?: number;
  bonus_description?: string;
  benefits: string;
  reports_to: string;
  insurance_details?: string;
  offer_date: string;
  expiry_date: string;
  start_date: string;
  end_date?: string;
  offer_link: string;
  pdf_url?: string;
  recruiter_email: string;
}

/**
 * Voice Interview Invitation Email Template
 */
export function generateVoiceInterviewInviteEmail(data: VoiceInterviewInviteData): { subject: string; html: string; text: string } {
  const subject = `AI Voice Interview Invitation - ${data.job_title} at ${data.company_name}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Dear ${data.candidate_name},</p>

    <p>Thank you for your continued interest in the ${data.job_title} position at ${data.company_name}.</p>

    <p>We have reviewed your application and are impressed with your qualifications. As a next step in our hiring process, we would like to invite you to complete a brief AI voice screening interview. This interview is designed to help us learn more about your skills and experience in a convenient and efficient way.</p>

    <p>Please use the following link to access the AI voice interview:</p>

    <p style="text-align: center; margin: 30px 0;">
        <a href="${data.interview_link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Voice Interview</a>
    </p>

    <p><strong>What to expect:</strong></p>
    <ul>
        <li>The interview will be conducted by our AI voice agent.</li>
        <li>It should take approximately 10-15 minutes to complete.</li>
        <li>You can complete it at your convenience from any device with a microphone.</li>
    </ul>

    <p>We recommend finding a quiet place where you can speak clearly and without interruptions.</p>

    <p>We look forward to hearing from you through this interview!</p>

    <p>Sincerely,</p>

    <p>${data.company_name} Hiring Team</p>
</body>
</html>
  `;

  const text = `
Dear ${data.candidate_name},

Thank you for your continued interest in the ${data.job_title} position at ${data.company_name}.

We have reviewed your application and are impressed with your qualifications. As a next step in our hiring process, we would like to invite you to complete a brief AI voice screening interview.

Please use the following link to access the AI voice interview:
${data.interview_link}

What to expect:
- The interview will be conducted by our AI voice agent.
- It should take approximately 10-15 minutes to complete.
- You can complete it at your convenience from any device with a microphone.

We recommend finding a quiet place where you can speak clearly and without interruptions.

We look forward to hearing from you through this interview!

Sincerely,
${data.company_name} Hiring Team
  `;

  return { subject, html, text };
}

/**
 * Rejection Email Template
 */
export function generateRejectionEmail(data: RejectionEmailData): { subject: string; html: string; text: string } {
  const subject = `Update on Your Application - ${data.job_title} at ${data.company_name}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Dear ${data.candidate_name},</p>

    <p>Thank you for your interest in the ${data.job_title} position at ${data.company_name}. We appreciate you taking the time to apply and share your experience with us.</p>

    <p>We've received a large number of applications for this role, and after careful consideration, we've decided to move forward with other candidates whose qualifications more closely align with the specific needs of the position at this time.</p>

    <p>This was a difficult decision, as your background is impressive. We encourage you to keep an eye on our careers page and apply for future openings that may be a better fit.</p>

    <p>We wish you the best of luck in your job search.</p>

    <p>Sincerely,</p>

    <p>${data.company_name} Hiring Team</p>
</body>
</html>
  `;

  const text = `
Dear ${data.candidate_name},

Thank you for your interest in the ${data.job_title} position at ${data.company_name}. We appreciate you taking the time to apply and share your experience with us.

We've received a large number of applications for this role, and after careful consideration, we've decided to move forward with other candidates whose qualifications more closely align with the specific needs of the position at this time.

This was a difficult decision, as your background is impressive. We encourage you to keep an eye on our careers page and apply for future openings that may be a better fit.

We wish you the best of luck in your job search.

Sincerely,
${data.company_name} Hiring Team
  `;

  return { subject, html, text };
}

/**
 * Job Offer Email Template
 */
export function generateJobOfferEmail(data: JobOfferEmailData): { subject: string; html: string; text: string } {
  const subject = `Job Offer - ${data.job_title} at ${data.company_name}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Dear ${data.candidate_name},</p>

    <p>We are thrilled to extend a job offer for the position of <strong>${data.job_title}</strong> at ${data.company_name}. After careful consideration of your qualifications and our discussions, we believe you would be an excellent addition to our team.</p>

    <p><strong>Offer Details:</strong></p>
    <p>Annual Base Salary: ${data.salary_currency} ${data.salary_amount.toLocaleString()}</p>
    <p>Position: ${data.job_title}</p>
    <p>Reports to: ${data.reports_to}</p>
    <p>Start Date: ${data.start_date}</p>
    <p>Offer Date: ${data.offer_date}</p>
    <p>Expires: ${data.expiry_date}</p>
    ${data.bonus_amount ? `<p>Bonus: ${data.salary_currency} ${data.bonus_amount.toLocaleString()}${data.bonus_description ? ` - ${data.bonus_description}` : ''}</p>` : ''}

    <p><strong>Benefits & Perks:</strong></p>
    <p>${data.benefits}</p>

    <p><strong>Insurance Coverage:</strong></p>
    <p>${data.insurance_details || 'Standard company insurance coverage applies'}</p>

    <p>📎 A detailed offer letter is attached to this email as a PDF document.</p>

    <p>To download the complete offer letter, please click the link below:</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href="${data.offer_link}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Offer Letter</a>
    </p>

    <p>⚠️ This offer expires on ${data.expiry_date}. Please respond by this date.</p>

    <p><strong>Next Steps:</strong></p>
    <ol>
        <li>Review the attached offer letter and all terms carefully</li>
        <li>Contact us if you have any questions about the offer</li>
        <li>Respond to this offer by ${data.expiry_date}</li>
        <li>Upon acceptance, we'll coordinate your start date and onboarding</li>
    </ol>

    <p><strong>Questions?</strong></p>
    <p>If you have any questions about this offer or need clarification on any terms, please don't hesitate to contact our HR team at ${data.recruiter_email}.</p>

    <p style="font-size: 14px; color: #666; margin-top: 20px;">This is a confidential job offer letter. Please do not share this document with unauthorized parties.</p>

    <p>We look forward to welcoming you to the ${data.company_name} team!</p>

    <p>Sincerely,</p>
    <p>${data.company_name} Hiring Team</p>
</body>
</html>
  `;

  const text = `
Dear ${data.candidate_name},

We are thrilled to extend a job offer for the position of ${data.job_title} at ${data.company_name}. After careful consideration of your qualifications and our discussions, we believe you would be an excellent addition to our team.

Offer Details:
- Annual Base Salary: ${data.salary_currency} ${data.salary_amount.toLocaleString()}
- Position: ${data.job_title}
- Reports to: ${data.reports_to}
- Start Date: ${data.start_date}
- Offer Date: ${data.offer_date}
- Expires: ${data.expiry_date}
${data.bonus_amount ? `- Bonus: ${data.salary_currency} ${data.bonus_amount.toLocaleString()}${data.bonus_description ? ` - ${data.bonus_description}` : ''}` : ''}

Benefits & Perks:
${data.benefits}

Insurance Coverage:
${data.insurance_details || 'Standard company insurance coverage applies'}

A detailed offer letter is attached to this email as a PDF document.

To download the complete offer letter, please visit:
${data.offer_link}

⚠️ This offer expires on ${data.expiry_date}. Please respond by this date.

Next Steps:
1. Review the attached offer letter and all terms carefully
2. Contact us if you have any questions about the offer
3. Respond to this offer by ${data.expiry_date}
4. Upon acceptance, we'll coordinate your start date and onboarding

Questions?
If you have any questions about this offer or need clarification on any terms, please don't hesitate to contact our HR team at ${data.recruiter_email}.

This is a confidential job offer letter. Please do not share this document with unauthorized parties.

We look forward to welcoming you to the ${data.company_name} team!

Sincerely,
${data.company_name} Hiring Team
  `;

  return { subject, html, text };
}

