# Email System - Quick Start Guide

## 🚀 3-Minute Setup

### Step 1: Apply Database Migration (30 seconds)
```bash
cd supabase
npx supabase migration up
```

### Step 2: Get Resend API Key (1 minute)
1. Go to https://resend.com/signup
2. Sign up (free)
3. Get API key from https://resend.com/api-keys
4. Copy the key (starts with `re_`)

### Step 3: Configure in Platform (1 minute)
1. Go to http://localhost:8080/company-setup
2. Scroll to "Email Configuration"
3. Click "Resend (Recommended)" tab
4. Fill in:
   - **Resend API Key**: `re_your_key_here`
   - **From Email**: `onboarding@resend.dev` (for testing)
   - **From Name**: `Your Company Name`
5. Click "Update Profile"

### Step 4: Test (30 seconds)
1. Go to screening results page
2. Click "Invite" button on any candidate
3. Check Resend dashboard for delivered email

**Done!** 🎉

---

## 📧 What Works Now

| Action | Email Sent |
|--------|------------|
| Click "Invite" button | ✅ Voice interview invitation |
| Click "Reject" button | ✅ Rejection email |
| Send job offer | ✅ Offer email with PDF |

---

## 🎯 Production Setup

For production, verify your domain:

1. Add domain in Resend: https://resend.com/domains
2. Add DNS records they provide
3. Wait for verification
4. Update "From Email" to `jobs@yourdomain.com`

---

## 🔧 Troubleshooting

**Email not sending?**
- Check console for errors
- Verify API key is correct
- Make sure "From Email" is set

**Need help?**
- See `EMAIL_SETUP_GUIDE.md` for detailed guide
- See `IMPLEMENTATION_SUMMARY.md` for technical details

---

## 🎁 Providers Supported

- ✅ **Resend** (recommended)
- ✅ **SendGrid** 
- ✅ **Custom SMTP** (Gmail, Outlook, etc.)

---

That's it! Your platform can now send emails directly without n8n.

