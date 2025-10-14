# Email System - Quick Start Guide

## 🚀 3-Minute Setup

### Step 1: Apply Database Migration (30 seconds)
```bash
cd supabase
npx supabase migration up
```

### Step 2: Get SMTP Credentials (1 minute)
1. **For Gmail**: Enable 2FA and create App Password
2. **For other providers**: Get SMTP settings from your email provider
3. **Common settings**:
   - Gmail: `smtp.gmail.com:587`
   - Outlook: `smtp.office365.com:587`
   - Namecheap: `mail.privateemail.com:587`

### Step 3: Configure in Platform (1 minute)
1. Go to http://localhost:8080/company-setup
2. Scroll to "Email Configuration (SMTP)"
3. Fill in your SMTP settings:
   - **SMTP Host**: `smtp.gmail.com` (or your provider)
   - **SMTP Port**: `587`
   - **SMTP Username**: `your-email@gmail.com`
   - **SMTP Password**: `your-app-password`
   - **From Email**: `your-email@gmail.com`
   - **From Name**: `Your Company Name`
4. Click "Test Connection"
5. Click "Send Test Email"
6. Click "Update Profile"

### Step 4: Test (30 seconds)
1. Go to screening results page
2. Click "Invite" button on any candidate
3. Check your inbox for the email

**Done!** 🎉

---

## 📧 What Works Now

| Action | Email Sent |
|--------|------------|
| Click "Invite" button | ✅ Voice interview invitation |
| Click "Reject" button | ✅ Rejection email |
| Send job offer | ✅ Offer email with PDF |
| Interview scheduling | ✅ Availability request emails |
| Job collaboration | ✅ Invitation emails |

---

## 🎯 Production Setup

For production, use your business domain:

1. **Use company email** (not Gmail for business)
2. **Set up DNS records** (SPF, DKIM, DMARC)
3. **Configure email authentication**
4. **Monitor deliverability**

---

## 🔧 Troubleshooting

**Email not sending?**
- Check console for errors
- Verify SMTP credentials are correct
- Make sure "From Email" is set
- Try "Test Connection" first

**Gmail issues?**
- Use App Password (not regular password)
- Enable 2-Factor Authentication
- Check Gmail security settings

**Other providers?**
- Verify SMTP host and port
- Check firewall settings
- Contact your email provider

**Need help?**
- See `EMAIL_SETUP_GUIDE.md` for detailed guide
- Test with Gmail first (easiest setup)

---

## 🎁 SMTP Providers Supported

- ✅ **Gmail** (with App Password)
- ✅ **Outlook/Office 365**
- ✅ **Yahoo**
- ✅ **Namecheap**
- ✅ **Zoho**
- ✅ **GoDaddy**
- ✅ **Any SMTP server**

---

## 📋 Quick Reference

### Gmail Setup
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Username: your-email@gmail.com
Password: your-app-password (not regular password)
```

### Outlook Setup
```
SMTP Host: smtp.office365.com
SMTP Port: 587
Username: your-email@company.com
Password: your-office-password
```

### Namecheap Setup
```
SMTP Host: mail.privateemail.com
SMTP Port: 587
Username: your-email@yourdomain.com
Password: your-email-password
```

---

That's it! Your platform can now send emails directly using your SMTP server.