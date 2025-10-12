# Email Configuration Guide

## Overview

The Hirios platform now sends emails directly without requiring n8n webhooks. Each company can configure their own email provider and credentials.

## Supported Email Providers

### 1. **Resend** (Recommended)
- Easy to set up
- Great deliverability
- Generous free tier
- Best for production use

### 2. **SendGrid**
- Enterprise-grade email service
- Advanced analytics
- Good for high-volume sending

### 3. **Custom SMTP**
- Use any SMTP server (Gmail, Outlook, etc.)
- Full control over email infrastructure
- Requires SMTP credentials

---

## Setup Instructions

### Step 1: Run Database Migration

First, apply the database migration to add email configuration columns:

```bash
# Navigate to your Supabase project directory
cd supabase

# Apply the migration
npx supabase migration up
```

Or manually apply the migration file:
- File: `supabase/migrations/20250213000000_add_smtp_config_to_company_profiles.sql`

### Step 2: Configure Email Settings

1. Navigate to **Company Setup** page: `http://localhost:8080/company-setup`
2. Scroll down to the **Email Configuration** section
3. Choose your email provider and configure it

---

## Provider-Specific Configuration

### Resend Configuration

1. **Sign up for Resend**: https://resend.com/signup
2. **Get your API Key**: https://resend.com/api-keys
3. **Verify your domain** (or use the test domain for development)
4. In Company Setup, select **Resend** tab and enter:
   - **Resend API Key**: `re_...` (from step 2)
   - **From Email**: `jobs@yourdomain.com` (must be verified in Resend)
   - **From Name**: `Company HR Team` (optional)

**Example:**
```
Resend API Key: re_123abc456def
From Email: jobs@hirios.com
From Name: Hirios Hiring Team
```

### SendGrid Configuration

1. **Sign up for SendGrid**: https://signup.sendgrid.com/
2. **Create an API Key**: https://app.sendgrid.com/settings/api_keys
3. **Verify your sender identity**: https://app.sendgrid.com/settings/sender_auth
4. In Company Setup, select **SendGrid** tab and enter:
   - **SendGrid API Key**: `SG.` (from step 2)
   - **From Email**: `jobs@yourdomain.com` (must be verified)
   - **From Name**: `Company HR Team` (optional)

**Example:**
```
SendGrid API Key: SG.abcdef123456
From Email: jobs@hirios.com
From Name: Hirios Hiring Team
```

### Custom SMTP Configuration

You can use any SMTP server (Gmail, Outlook, Office 365, etc.)

#### Gmail Example:

1. **Enable 2-Factor Authentication** on your Google account
2. **Create an App Password**: https://myaccount.google.com/apppasswords
3. In Company Setup, select **Custom SMTP** tab and enter:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: `your-email@gmail.com`
   - **SMTP Password**: `your-app-password` (16-character password from step 2)
   - **From Email**: `your-email@gmail.com`
   - **From Name**: `Company HR Team`
   - **Use secure connection**: ✓ (checked)

**Example:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: hr@company.com
SMTP Password: abcd efgh ijkl mnop
From Email: hr@company.com
From Name: Company Hiring Team
Use secure connection: ✓
```

#### Microsoft 365 / Outlook Example:

```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP Username: hr@company.com
SMTP Password: your-password
From Email: hr@company.com
From Name: Company Hiring Team
Use secure connection: ✓
```

#### Other SMTP Providers:

Refer to your email provider's documentation for SMTP settings.

---

## Email Types

The platform sends three types of emails:

### 1. Voice Interview Invitation
**Sent when**: Recruiter clicks "Invite" button on screening results
**Recipient**: Candidate
**Contains**: Link to start AI voice interview

### 2. Rejection Email
**Sent when**: Recruiter clicks "Reject" button on screening results
**Recipient**: Candidate
**Contains**: Polite rejection message

### 3. Job Offer Email
**Sent when**: Recruiter creates and sends a job offer
**Recipient**: Candidate (with CC support)
**Contains**: 
- Complete offer details
- Link to download offer
- PDF attachment of offer letter

---

## Testing Email Configuration

### Test 1: Voice Interview Invitation

1. Go to: `http://localhost:8080/screening-results/job/[job-id]`
2. Find a candidate
3. Click the **Invite** button
4. Confirm the dialog
5. Check the candidate's email inbox

**Expected**: Candidate receives email with interview link

### Test 2: Rejection Email

1. Go to: `http://localhost:8080/screening-results/job/[job-id]`
2. Find a candidate
3. Click the **Reject** button
4. Confirm the dialog
5. Check the candidate's email inbox

**Expected**: Candidate receives rejection email

### Test 3: Job Offer Email

1. Mark a candidate as "Accepted" status
2. Click "Create Offer" in the status manager
3. Fill out the job offer form
4. Click "Send Offer"
5. Check the candidate's email inbox

**Expected**: Candidate receives:
- Email with offer details
- PDF attachment of offer letter
- Link to download offer

---

## Troubleshooting

### Email Not Sending

1. **Check Configuration**: Ensure all required fields are filled in Company Setup
2. **Check Console Logs**: Open browser DevTools → Console for error messages
3. **Verify Email Provider**:
   - Resend: Check API key is valid and domain is verified
   - SendGrid: Check API key has "Mail Send" permission
   - SMTP: Test credentials with an email client first

### Common Errors

#### "Email configuration not found"
**Solution**: Complete Company Setup → Email Configuration section

#### "Resend API error: 403"
**Solution**: Verify your domain in Resend or use their test domain

#### "SMTP connection failed"
**Solution**: 
- Check SMTP credentials are correct
- Verify firewall isn't blocking SMTP ports
- For Gmail: Use App Password, not regular password

#### "From email not configured"
**Solution**: Set the "From Email" field in Company Setup

### Gmail Specific Issues

If using Gmail with "Less secure app access":
1. This is deprecated - use App Passwords instead
2. Enable 2FA on your Google account
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use the 16-character app password in SMTP Password field

---

## Security Notes

1. **API Keys/Passwords are stored in the database**
   - Consider encrypting sensitive fields in production
   - Use environment variables for additional security

2. **SMTP Port Selection**:
   - Port 587: TLS (recommended)
   - Port 465: SSL (older, but still secure)
   - Port 25: Unencrypted (NOT recommended)

3. **Email Verification**:
   - Always verify your sender domain
   - Use proper SPF, DKIM, and DMARC records
   - This prevents emails from going to spam

---

## Migration from n8n

### What Changed:

**Before:**
- Emails sent via n8n webhooks
- Required separate n8n workflow setup
- Environment variables: `VITE_SCREENING_WEBHOOK_URL`, `VITE_REJECT_EMAIL_WEBHOOK_URL`, `VITE_OFFER_EMAIL_WEBHOOK_URL`

**After:**
- Emails sent directly from platform
- Each company configures their own provider
- No n8n dependency for candidate emails

### Old Webhook Environment Variables (No Longer Needed):
```bash
# These can be removed from .env
VITE_SCREENING_WEBHOOK_URL=...
VITE_REJECT_EMAIL_WEBHOOK_URL=...
VITE_OFFER_EMAIL_WEBHOOK_URL=...
```

### Interview Scheduling Emails:
Note: Interview scheduling emails still use Supabase Edge Functions (separate system)

---

## Production Checklist

- [ ] Database migration applied
- [ ] Email provider selected and configured
- [ ] Sender domain verified (for Resend/SendGrid)
- [ ] Test emails sent successfully for all 3 types
- [ ] From email matches company brand
- [ ] SPF/DKIM/DMARC records configured
- [ ] Remove old n8n webhook environment variables
- [ ] Monitor email delivery rates
- [ ] Set up email bounce handling (if needed)

---

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify email configuration in Company Setup
3. Test with a simple SMTP provider first (like Gmail)
4. Review the troubleshooting section above

---

## Technical Details

### Files Modified:
- `src/services/emailService.ts` - Core email sending logic
- `src/services/emailTemplates.ts` - Email templates
- `src/pages/CompanySetup.tsx` - UI for configuration
- `src/hooks/useScreeningResults.ts` - Rejection emails
- `src/hooks/useJobOffers.ts` - Offer emails
- `src/services/voiceInterviewService.ts` - Invitation emails
- `supabase/migrations/20250213000000_add_smtp_config_to_company_profiles.sql` - Database schema

### Dependencies Added:
- `nodemailer` - SMTP email sending
- `@types/nodemailer` - TypeScript types
- `resend` - Resend SDK (already installed)

---

## Quick Start for Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Apply migration:**
   ```bash
   npx supabase migration up
   ```

3. **Use Resend test mode:**
   - Get free API key: https://resend.com
   - Use test domain: `onboarding@resend.dev`
   - Emails will be delivered to your Resend dashboard

4. **Configure in Company Setup:**
   ```
   Provider: Resend
   API Key: re_your_key
   From Email: onboarding@resend.dev
   From Name: Test Company
   ```

5. **Test:**
   - Send test invite/reject/offer
   - Check Resend dashboard for delivered emails

---

## Advanced Configuration

### Custom Email Templates

Email templates are in `src/services/emailTemplates.ts`. You can customize:
- HTML structure
- Styling
- Content
- Plain text versions

### Adding New Email Types

1. Create template function in `emailTemplates.ts`
2. Import and use in your component/hook
3. Call `sendEmailFromCurrentUser()` with template output

### Email Tracking

To add tracking:
1. Use SendGrid (has built-in tracking)
2. Or add tracking pixels to HTML templates
3. Or use third-party email tracking service

---

End of Email Configuration Guide

