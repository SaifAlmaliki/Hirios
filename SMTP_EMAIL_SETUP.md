# SMTP Email Setup Guide - Simplified

## ✅ What You Get

Your platform now sends emails **directly from your company's email** (e.g., `recruitment@idraq.com`) using SMTP. 

**No third-party services needed!** Works with:
- ✅ Namecheap Private Email
- ✅ Zoho Mail
- ✅ Gmail / Google Workspace
- ✅ Microsoft 365 / Outlook
- ✅ Any SMTP email server

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Apply Database Migration
```bash
cd supabase
npx supabase migration up
```

### Step 2: Configure Your Email

1. Go to: http://localhost:8080/company-setup
2. Scroll to **"Email Configuration (SMTP)"**
3. Fill in your email server details

---

## 📧 SMTP Configuration Examples

### Namecheap Private Email
```
SMTP Host: mail.privateemail.com
SMTP Port: 587
SMTP Username: recruitment@idraq.com
SMTP Password: your_email_password
From Email: recruitment@idraq.com
From Name: Idraq Hiring Team
Use secure connection: ✓ (checked)
```

### Zoho Mail
```
SMTP Host: smtp.zoho.com
SMTP Port: 587
SMTP Username: recruitment@idraq.com
SMTP Password: your_email_password
From Email: recruitment@idraq.com
From Name: Idraq Hiring Team
Use secure connection: ✓ (checked)
```

### Gmail (Requires App Password)
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: your-app-password (16 characters)
From Email: your-email@gmail.com
From Name: Your Company Hiring Team
Use secure connection: ✓ (checked)
```

**Gmail Setup:**
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password (not your regular password)

### Microsoft 365 / Outlook
```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP Username: recruitment@yourcompany.com
SMTP Password: your_email_password
From Email: recruitment@yourcompany.com
From Name: Your Company Hiring Team
Use secure connection: ✓ (checked)
```

---

## 📬 Emails That Will Be Sent

### 1. Voice Interview Invitation
**When**: Recruiter clicks "Invite" button
**To**: Candidate
**From**: Your configured email (e.g., `recruitment@idraq.com`)
**Contains**: Link to AI voice interview

### 2. Rejection Email
**When**: Recruiter clicks "Reject" button
**To**: Candidate
**From**: Your configured email
**Contains**: Professional rejection message

### 3. Job Offer Email
**When**: Recruiter sends job offer
**To**: Candidate (with CC support)
**From**: Your configured email
**Contains**: Offer details + PDF attachment

---

## 🧪 Testing

1. Complete the SMTP configuration in Company Setup
2. Go to screening results page
3. Click "Invite" on any candidate
4. Check if candidate receives email from `recruitment@idraq.com`

---

## ❌ Common Issues & Solutions

### Issue: "SMTP connection failed"
**Solution**: 
- Verify SMTP host and port are correct
- Check username and password
- For Gmail: Use App Password, not regular password
- Check firewall isn't blocking SMTP ports

### Issue: Emails going to spam
**Solution**:
- Use your company domain email (not Gmail/Outlook for business)
- Ask your email provider to configure SPF/DKIM records
- Ensure "From Email" matches your SMTP username

### Issue: "Incomplete SMTP configuration"
**Solution**:
- All fields marked with * are required
- Make sure no fields are empty
- Click "Update Profile" to save

---

## 🔒 Security Notes

1. **Passwords are stored in database** - Consider encryption for production
2. **Use strong passwords** - Don't share your email password
3. **Port 587 (TLS)** - Recommended for security
4. **Keep "Use secure connection" checked** - Ensures encryption

---

## 📦 What Changed from n8n

| Before (n8n) | After (SMTP) |
|--------------|-------------|
| External n8n webhooks | Direct SMTP |
| Setup in n8n | Setup in UI |
| One email for all | Each company their email |
| Generic sender | Your company domain |
| Complex | Simple ✅ |

---

## 🎯 Benefits

✅ **Your Company Email**: Candidates receive from `recruitment@idraq.com`  
✅ **No Extra Cost**: Use your existing email  
✅ **Simple Setup**: Just SMTP credentials  
✅ **Professional**: Company-branded emails  
✅ **Works Everywhere**: Any SMTP provider  
✅ **No n8n Needed**: Independent platform  

---

## 📝 Files Modified

- `src/services/emailService.ts` - SMTP only, removed Resend/SendGrid
- `src/pages/CompanySetup.tsx` - Simple SMTP form (no tabs)
- `supabase/migrations/20250213000000_...` - SMTP columns only
- `src/services/emailTemplates.ts` - Email templates (unchanged)

---

## ✨ Quick Start

1. **Apply migration** (1 command)
2. **Get your email SMTP settings** (from provider)
3. **Configure in Company Setup** (5 fields)
4. **Test** (send invite)
5. **Done!** 🎉

---

## 📞 Need Help?

**Where to find SMTP settings:**
- **Namecheap**: https://www.namecheap.com/support/knowledgebase/article.aspx/1090/
- **Zoho**: https://www.zoho.com/mail/help/zoho-smtp.html
- **Gmail**: https://support.google.com/mail/answer/7126229
- **Outlook**: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings

**Common SMTP Ports:**
- **587** - TLS (recommended)
- **465** - SSL (older)
- **25** - Unencrypted (not recommended)

---

**That's it!** Your platform is ready to send emails from your company domain. 📧✨

