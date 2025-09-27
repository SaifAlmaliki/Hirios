import { NextApiRequest, NextApiResponse } from 'next';

interface OfferEmailData {
  offerId: string;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  salaryAmount: number;
  salaryCurrency: string;
  bonusAmount?: number;
  bonusDescription?: string;
  benefits: string;
  reportsTo: string;
  insuranceDetails?: string;
  offerDate: string;
  expiryDate: string;
  pdfUrl: string;
  ccEmails?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const emailData: OfferEmailData = req.body;

    // Validate required fields
    const requiredFields = [
      'offerId',
      'candidateEmail',
      'candidateName',
      'jobTitle',
      'companyName',
      'salaryAmount',
      'salaryCurrency',
      'benefits',
      'reportsTo',
      'offerDate',
      'expiryDate',
      'pdfUrl'
    ];

    for (const field of requiredFields) {
      if (!emailData[field as keyof OfferEmailData]) {
        return res.status(400).json({ 
          error: `Missing required field: ${field}` 
        });
      }
    }

    // Prepare data for n8n webhook
    const webhookData = {
      candidate_name: emailData.candidateName,
      candidate_email: emailData.candidateEmail,
      job_title: emailData.jobTitle,
      company_name: emailData.companyName,
      salary_amount: emailData.salaryAmount,
      salary_currency: emailData.salaryCurrency,
      bonus_amount: emailData.bonusAmount,
      bonus_description: emailData.bonusDescription,
      benefits: emailData.benefits,
      reports_to: emailData.reportsTo,
      insurance_details: emailData.insuranceDetails,
      offer_date: emailData.offerDate,
      expiry_date: emailData.expiryDate,
      offer_link: `${process.env.NEXT_PUBLIC_SITE_URL}/offer/${emailData.offerId}`,
      pdf_url: emailData.pdfUrl,
      recruiter_email: process.env.RECRUITER_EMAIL || 'hr@company.com',
      cc_emails: emailData.ccEmails || [],
    };

    // Send to n8n webhook
    const n8nWebhookUrl = process.env.VITE_OFFER_EMAIL_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.error('N8N webhook URL not configured');
      return res.status(500).json({ 
        error: 'Email service not configured' 
      });
    }

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('N8N webhook error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to send email via webhook' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Offer email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending offer email:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
