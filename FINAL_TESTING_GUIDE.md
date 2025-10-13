# 🎉 Final Testing Guide - SMTP Email System

## ✅ Deployment Complete!

Your Edge Function is **live and ready**!

**Dashboard**: https://supabase.com/dashboard/project/bwuomwyodoyyrqgdlwrp/functions

---

## 🧪 Step-by-Step Testing

### **Step 1: Configure SMTP Settings**

1. Go to: **http://localhost:8080/company-setup**
2. Scroll to **"Email Configuration (SMTP)"**
3. Fill in your email settings:

#### For Namecheap Private Email:
```
SMTP Host: mail.privateemail.com
SMTP Port: 587
SMTP Username: recruitment@idraq.com
SMTP Password: [your email password]
From Email: recruitment@idraq.com
From Name: Idraq Hiring Team
Use secure connection: ✓ (checked)
```

#### For Zoho Mail:
```
SMTP Host: smtp.zoho.com
SMTP Port: 587
SMTP Username: recruitment@idraq.com
SMTP Password: [your email password]
From Email: recruitment@idraq.com
From Name: Idraq Hiring Team
Use secure connection: ✓ (checked)
```

4. Click **"Update Profile"** button

---

### **Step 2: Test SMTP Connection** ⚡

1. After saving, click **"Test SMTP Connection"** button
2. Wait for response (5-10 seconds)

**Expected Results:**

✅ **Success:**
```
✅ Connection Successful!
SMTP connection successful! Your email settings are working correctly.
```

❌ **If Failed:**
```
❌ Connection Failed
[Specific error message with guidance]
```

**Common Issues:**
- **Authentication failed** → Check username/password
- **Connection refused** → Check SMTP host/port
- **Connection timeout** → Check firewall settings

---

### **Step 3: Send Test Invite Email** 📧

1. Go to: **http://localhost:8080/screening-results/job/[job-id]**
2. Find any candidate in the list
3. Click the **"Invite"** button
4. Confirm the dialog
5. Check console for success message

**Expected:**
- ✅ No errors in console
- ✅ Success toast message
- ✅ Candidate receives email from `recruitment@idraq.com`

---

### **Step 4: Send Test Rejection Email** 📧

1. On same screening results page
2. Find another candidate
3. Click **"Reject"** button
4. Confirm the dialog

**Expected:**
- ✅ Candidate receives rejection email from `recruitment@idraq.com`

---

### **Step 5: Send Test Job Offer Email** 📧

1. Mark a candidate as "Accepted" status
2. Create a job offer for them
3. Fill in offer details
4. Click **"Send Offer"**

**Expected:**
- ✅ Candidate receives offer email from `recruitment@idraq.com`
- ✅ PDF attachment included
- ✅ All offer details correct

---

## 📋 Complete Testing Checklist

- [ ] SMTP settings configured and saved
- [ ] Test SMTP Connection button clicked
- [ ] Connection successful message received
- [ ] Voice interview invitation email sent
- [ ] Candidate received invitation email
- [ ] Email shows from `recruitment@idraq.com`
- [ ] Rejection email sent
- [ ] Candidate received rejection email
- [ ] Job offer email sent with PDF
- [ ] Candidate received offer email
- [ ] No console errors
- [ ] All emails branded with company domain

---

## 🎯 What Should Work

| Feature | Status | Email From |
|---------|--------|------------|
| Test Connection | ✅ | N/A |
| Voice Interview Invite | ✅ | recruitment@idraq.com |
| Rejection Email | ✅ | recruitment@idraq.com |
| Job Offer Email | ✅ | recruitment@idraq.com |
| PDF Attachments | ✅ | Included in offers |
| CC/BCC Support | ✅ | For offers |

---

## 🔍 Debugging

### Check Edge Function Logs:
1. Go to: https://supabase.com/dashboard/project/bwuomwyodoyyrqgdlwrp/functions
2. Click on **"send-smtp-email"**
3. View **Logs** tab
4. Look for any error messages

### Check Browser Console:
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for email-related messages:
   - `📤 Sending email via Edge Function...`
   - `✅ Email sent successfully...`
   - Or error messages

### Common Issues:

**"Email configuration not found"**
- Save SMTP settings in Company Setup first

**"Failed to send email: [error]"**
- Check Edge Function logs for details
- Verify SMTP credentials are correct
- Test connection first

**Emails going to spam**
- Add SPF/DKIM records for your domain
- Contact your email provider for help

---

## 🎉 Success Criteria

✅ **You're successful if:**
1. Test connection shows success ✅
2. Invite email received by candidate ✅
3. Email shows from `recruitment@idraq.com` ✅
4. No console errors ✅
5. Reject and offer emails also work ✅

---

## 📊 System Architecture

```
┌─────────────┐
│   Browser   │ (Frontend)
│  Company    │
│   Setup     │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│  Supabase   │ (Server)
│    Edge     │
│  Function   │
└──────┬──────┘
       │
       │ SMTP
       ▼
┌─────────────┐
│   Email     │
│   Server    │
│ (Namecheap/ │
│    Zoho)    │
└──────┬──────┘
       │
       │ Email
       ▼
┌─────────────┐
│  Candidate  │
│  Inbox      │
└─────────────┘
```

---

## 📞 Support

**If something doesn't work:**

1. **Check Edge Function logs** (link above)
2. **Check browser console** for errors
3. **Verify SMTP settings** are correct
4. **Test connection** before sending emails
5. **Check email spam folder** for test emails

**SMTP Provider Help:**
- **Namecheap**: https://www.namecheap.com/support/knowledgebase/
- **Zoho**: https://www.zoho.com/mail/help/

---

## 🚀 Production Checklist

Before going live:

- [ ] Test all 3 email types (invite, reject, offer)
- [ ] Verify company domain in emails
- [ ] Configure SPF/DKIM records
- [ ] Test with real candidate emails
- [ ] Monitor Edge Function logs
- [ ] Set up email bounce handling (optional)
- [ ] Add backup SMTP server (optional)

---

## 🎊 You're Ready!

Everything is deployed and configured. Start testing! 📧✨

**Next:** Go to Company Setup and test your SMTP connection!

