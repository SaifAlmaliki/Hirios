# N8N Email Template for Job Offers

## Webhook Configuration

### Webhook URL
Set up a webhook node in n8n with the following URL pattern:
```
https://n8n.cognitechx.com/webhook-test/job-offer-email
```

### Expected Payload Structure
The webhook will receive the following data structure:

```json
{
  "candidate_name": "John Doe",
  "candidate_email": "john.doe@email.com",
  "job_title": "Senior Software Engineer",
  "company_name": "TechCorp Inc.",
  "salary_amount": 120000,
  "salary_currency": "USD",
  "bonus_amount": 15000,
  "bonus_description": "Performance bonus",
  "benefits": "Health insurance, 401(k) matching, Paid time off, Flexible work hours",
  "reports_to": "Jane Smith, Engineering Manager",
  "insurance_details": "Comprehensive health, dental, and vision coverage. 80% company contribution.",
  "offer_date": "2024-12-20",
  "expiry_date": "2024-12-27",
  "offer_link": "https://hirios.com/offer/offer-id-123",
  "pdf_url": "https://your-storage.com/offers/offer_john_doe_senior_software_engineer_2024-12-20.pdf",
  "recruiter_email": "idraq.ai@gmail.com",
  "cc_emails": ["manager@techcorp.com", "hr@techcorp.com"]
}
```

## Email Template

### Subject Line
```
🎉 Job Offer: {{$json.job_title}} at {{$json.company_name}}
```

### HTML Email Body
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Offer - {{$json.company_name}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            width: 80px;
            height: 80px;
            background-color: #2563eb;
            border-radius: 8px;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .offer-details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .salary-highlight {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .detail-item {
            padding: 10px;
            background-color: white;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        .detail-label {
            font-weight: bold;
            color: #374151;
            font-size: 14px;
        }
        .detail-value {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
        }
        .benefits-section {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .benefits-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 10px;
        }
        .benefits-list {
            color: #92400e;
            line-height: 1.8;
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 10px;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
        .expiry-notice {
            background-color: #fef2f2;
            border: 1px solid #f87171;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .expiry-text {
            color: #dc2626;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        .attachment-notice {
            background-color: #e0f2fe;
            border: 1px solid #0284c7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .attachment-text {
            color: #0369a1;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">{{$json.company_name}}</div>
            <div class="company-name">{{$json.company_name}}</div>
        </div>

        <!-- Greeting -->
        <div class="greeting">
            Dear {{$json.candidate_name}},
        </div>

        <!-- Main Message -->
        <p>
            We are thrilled to extend a job offer for the position of <strong>{{$json.job_title}}</strong> at {{$json.company_name}}. 
            After careful consideration of your qualifications and our discussions, we believe you would be an excellent addition to our team.
        </p>

        <!-- Offer Details -->
        <div class="offer-details">
            <div class="salary-highlight">
                {{$json.salary_currency}} {{$json.salary_amount}}
            </div>
            <div style="text-align: center; color: #6b7280; margin-bottom: 20px;">
                Annual Base Salary
            </div>

            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Position</div>
                    <div class="detail-value">{{$json.job_title}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Reports to</div>
                    <div class="detail-value">{{$json.reports_to}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Offer Date</div>
                    <div class="detail-value">{{$json.offer_date}}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Expires</div>
                    <div class="detail-value">{{$json.expiry_date}}</div>
                </div>
            </div>

            {{#if $json.bonus_amount}}
            <div class="detail-item" style="margin-top: 15px;">
                <div class="detail-label">Bonus</div>
                <div class="detail-value">
                    {{$json.salary_currency}} {{$json.bonus_amount}}
                    {{#if $json.bonus_description}} - {{$json.bonus_description}}{{/if}}
                </div>
            </div>
            {{/if}}
        </div>

        <!-- Benefits Section -->
        <div class="benefits-section">
            <div class="benefits-title">Benefits & Perks</div>
            <div class="benefits-list">{{$json.benefits}}</div>
            {{#if $json.insurance_details}}
            <div style="margin-top: 15px;">
                <div class="benefits-title">Insurance Coverage</div>
                <div class="benefits-list">{{$json.insurance_details}}</div>
            </div>
            {{/if}}
        </div>

        <!-- PDF Attachment Notice -->
        <div class="attachment-notice">
            <div class="attachment-text">
                📎 A detailed offer letter is attached to this email as a PDF document.
            </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section">
            <p>To view the complete offer details and respond, please click the button below:</p>
            <a href="{{$json.offer_link}}" class="cta-button">View Complete Offer</a>
        </div>

        <!-- Expiry Notice -->
        <div class="expiry-notice">
            <div class="expiry-text">
                ⚠️ This offer expires on {{$json.expiry_date}}. Please respond by this date.
            </div>
        </div>

        <!-- Next Steps -->
        <div style="margin: 30px 0;">
            <h3 style="color: #374151; margin-bottom: 15px;">Next Steps</h3>
            <ol style="color: #6b7280; line-height: 1.8;">
                <li>Review the attached offer letter and all terms carefully</li>
                <li>Contact us if you have any questions about the offer</li>
                <li>Respond to this offer by {{$json.expiry_date}}</li>
                <li>Upon acceptance, we'll coordinate your start date and onboarding</li>
            </ol>
        </div>

        <!-- Contact Information -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 15px;">Questions?</h3>
            <p style="color: #6b7280; margin: 0;">
                If you have any questions about this offer or need clarification on any terms, 
                please don't hesitate to contact our HR team at {{$json.recruiter_email}}.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                This is a confidential job offer letter. Please do not share this document with unauthorized parties.
            </p>
            <p style="margin-top: 10px;">
                We look forward to welcoming you to the {{$json.company_name}} team!
            </p>
        </div>
    </div>
</body>
</html>
```

### Plain Text Version (Fallback)
```
Subject: 🎉 Job Offer: {{$json.job_title}} at {{$json.company_name}}

Dear {{$json.candidate_name}},

We are thrilled to extend a job offer for the position of {{$json.job_title}} at {{$json.company_name}}.

OFFER DETAILS:
- Position: {{$json.job_title}}
- Base Salary: {{$json.salary_currency}} {{$json.salary_amount}}
{{#if $json.bonus_amount}}- Bonus: {{$json.salary_currency}} {{$json.bonus_amount}}{{/if}}
- Reports to: {{$json.reports_to}}
- Offer Date: {{$json.offer_date}}
- Expires: {{$json.expiry_date}}

BENEFITS & PERKS:
{{$json.benefits}}

{{#if $json.insurance_details}}
INSURANCE COVERAGE:
{{$json.insurance_details}}
{{/if}}

A detailed offer letter is attached to this email as a PDF document.

To view the complete offer details: {{$json.offer_link}}

⚠️ This offer expires on {{$json.expiry_date}}. Please respond by this date.

NEXT STEPS:
1. Review the attached offer letter and all terms carefully
2. Contact us if you have any questions about the offer
3. Respond to this offer by {{$json.expiry_date}}
4. Upon acceptance, we'll coordinate your start date and onboarding

Questions? Contact our HR team at {{$json.recruiter_email}}.

This is a confidential job offer letter. Please do not share this document with unauthorized parties.

We look forward to welcoming you to the {{$json.company_name}} team!

Best regards,
The {{$json.company_name}} Team
```

## N8N Workflow Configuration

### 1. Webhook Node
- Method: POST
- Path: `/webhook-test/job-offer-email`
- Response Mode: "On Received"

### 2. Email Node (Gmail/SMTP)
- To: `{{$json.candidate_email}}`
- CC: `{{$json.recruiter_email}}{{#if $json.cc_emails}}, {{$json.cc_emails}}{{/if}}`
- Subject: `🎉 Job Offer: {{$json.job_title}} at {{$json.company_name}}`
- HTML Content: [Use the HTML template above]
- Text Content: [Use the plain text template above]
- Attachments: 
  - URL: `{{$json.pdf_url}}`
  - Filename: `Job_Offer_{{$json.candidate_name}}_{{$json.job_title}}.pdf`

### 3. Optional: Slack Notification
Send a notification to your team when an offer is sent:
```json
{
  "text": "🎉 Job offer sent to {{$json.candidate_name}} for {{$json.job_title}} position",
  "attachments": [
    {
      "color": "good",
      "fields": [
        {
          "title": "Candidate",
          "value": "{{$json.candidate_name}}",
          "short": true
        },
        {
          "title": "Position",
          "value": "{{$json.job_title}}",
          "short": true
        },
        {
          "title": "Salary",
          "value": "{{$json.salary_currency}} {{$json.salary_amount}}",
          "short": true
        },
        {
          "title": "Expires",
          "value": "{{$json.expiry_date}}",
          "short": true
        }
      ]
    }
  ]
}
```

## Environment Variables Required

Add these to your `.env` file:

```env
# N8N Webhook URL
VITE_OFFER_EMAIL_WEBHOOK_URL=https://n8n.cognitechx.com/webhook-test/job-offer-email

# Recruiter Email (will be CC'd on all offers)
RECRUITER_EMAIL=idraq.ai@gmail.com

# Site URL for offer links
NEXT_PUBLIC_SITE_URL=https://hirios.com
```

## Testing the Integration

1. Create a test offer in your application
2. Check the n8n webhook logs to ensure data is received correctly
3. Verify the email is sent with proper formatting and attachments
4. Test the PDF download link
5. Confirm CC recipients receive the email

## Troubleshooting

### Common Issues:
1. **PDF not attaching**: Check if the PDF URL is accessible and returns proper content-type
2. **Email formatting issues**: Verify HTML template syntax in n8n
3. **Webhook not triggering**: Check n8n webhook configuration and URL
4. **Missing data**: Ensure all required fields are passed from the application

### Debug Steps:
1. Check n8n execution logs
2. Verify webhook payload structure
3. Test email template with sample data
4. Validate PDF generation and storage
