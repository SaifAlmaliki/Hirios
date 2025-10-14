# Email Configuration Guide

## Overview

The Hirios platform sends emails directly using SMTP (Simple Mail Transfer Protocol). Each company configures their own SMTP server credentials for sending candidate communications.

## Supported SMTP Providers

### **Any SMTP Server**
- Gmail, Outlook, Yahoo
- Namecheap, Zoho, GoDaddy
- Custom business email servers
- Full control over email infrastructure
- Works with any email provider that supports SMTP

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
3. Enter your SMTP settings

---

## SMTP Configuration

### Common SMTP Settings

| Provider | SMTP Host | Port | Security |
|----------|-----------|------|----------|
| **Gmail** | smtp.gmail.com | 587 | TLS |
| **Outlook** | smtp.office365.com | 587 | TLS |
| **Yahoo** | smtp.mail.yahoo.com | 587 | TLS |
| **Namecheap** | mail.privateemail.com | 587 | TLS |
| **Zoho** | smtp.zoho.com | 587 | TLS |
| **GoDaddy** | smtpout.secureserver.net | 587 | TLS |

### Configuration Steps

1. **Get SMTP credentials** from your email provider
2. **Navigate to Company Setup**: `http://localhost:8080/company-setup`
3. **Scroll to Email Configuration** section
4. **Enter your SMTP settings**:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 (TLS) or 465 (SSL)
   - **SMTP Username**: Your email address
   - **SMTP Password**: Your email password
   - **From Email**: Email address shown to candidates
   - **From Name**: Name shown to candidates (optional)
5. **Test your configuration** using the "Test Connection" button
6. **Send a test email** to verify everything works

---

## Provider-Specific Examples

### Gmail Configuration

1. **Enable 2-Factor Authentication** on your Google account
2. **Create an App Password**: https://myaccount.google.com/apppasswords
3. **Configure in Company Setup**:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: `your-email@gmail.com`
   - **SMTP Password**: `your-app-password` (not your regular password)
   - **From Email**: `your-email@gmail.com`
   - **From Name**: `Your Company Name`

### Outlook/Office 365 Configuration

1. **Use your Office 365 credentials**
2. **Configure in Company Setup**:
   - **SMTP Host**: `smtp.office365.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: `your-email@company.com`
   - **SMTP Password**: `your-office-password`
   - **From Email**: `your-email@company.com`
   - **From Name**: `Your Company Name`

### Namecheap Configuration

1. **Get SMTP settings** from Namecheap cPanel
2. **Configure in Company Setup**:
   - **SMTP Host**: `mail.privateemail.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: `your-email@yourdomain.com`
   - **SMTP Password**: `your-email-password`
   - **From Email**: `your-email@yourdomain.com`
   - **From Name**: `Your Company Name`

---

## Testing Your Configuration

### Test Connection
1. Click **"Test Connection"** button in Company Setup
2. This validates your SMTP settings without sending an email
3. Look for success message: "SMTP connection successful!"

### Send Test Email
1. Enter a test email address (optional - defaults to your From Email)
2. Click **"Send Test Email"** button
3. Check your inbox for the test email
4. Verify the email looks professional and is delivered properly

---

## Troubleshooting

### Common Issues

#### "Authentication failed"
- **Gmail**: Make sure you're using an App Password, not your regular password
- **Other providers**: Double-check username and password
- **2FA**: Ensure 2-Factor Authentication is enabled for Gmail

#### "Connection refused"
- Check your SMTP host and port settings
- Try port 587 instead of 465 (or vice versa)
- Verify your email provider supports SMTP

#### "Connection timeout"
- Check your firewall settings
- Ensure your network allows SMTP connections
- Try a different port (587 vs 465)

#### "TLS/SSL error"
- Try port 587 with STARTTLS
- Ensure your email provider supports TLS
- Check if your provider requires SSL on port 465

### Email Deliverability

#### Improve Email Reputation
1. **Use a professional domain** (not Gmail for business)
2. **Set up SPF records** in your DNS
3. **Configure DKIM** with your email provider
4. **Set up DMARC** policy
5. **Use consistent "From" addresses**

#### Test Email Score
- Use services like [mail-tester.com](https://mail-tester.com)
- Check your domain reputation
- Monitor bounce rates and spam complaints

---

## Security Best Practices

### SMTP Credentials
- **Never share** your SMTP credentials
- **Use strong passwords** for email accounts
- **Enable 2FA** on email accounts when possible
- **Rotate passwords** regularly

### Email Content
- **Avoid spam trigger words** in subject lines
- **Include unsubscribe links** in marketing emails
- **Use professional language** and formatting
- **Test emails** before sending to candidates

---

## Production Deployment

### Domain Setup
1. **Use your company domain** for email addresses
2. **Configure DNS records** (SPF, DKIM, DMARC)
3. **Set up proper email authentication**
4. **Monitor email deliverability**

### Monitoring
- **Track email delivery rates**
- **Monitor bounce rates**
- **Check spam folder placement**
- **Review email logs** for errors

---

## Support

If you need help with email configuration:

1. **Check the troubleshooting section** above
2. **Test with a simple provider** (Gmail) first
3. **Verify your SMTP settings** with your email provider
4. **Contact support** if issues persist

---

## Quick Reference

### Required Fields
- ✅ **SMTP Host** - Your email provider's server
- ✅ **SMTP Port** - Usually 587 or 465
- ✅ **SMTP Username** - Your email address
- ✅ **SMTP Password** - Your email password
- ✅ **From Email** - Email shown to candidates

### Optional Fields
- **From Name** - Name shown to candidates
- **Secure Connection** - Use TLS/SSL (recommended)

### Test Your Setup
1. **Test Connection** - Validates SMTP settings
2. **Send Test Email** - Verifies email delivery
3. **Check Inbox** - Confirm email received

That's it! Your platform can now send emails directly using your SMTP server.