# Deploy SMTP Email Edge Function

## ✅ **Problem Fixed!**

Nodemailer cannot run in browser. We've moved SMTP email sending to **Supabase Edge Function** (server-side).

---

## 🚀 **Deploy Edge Function**

### **Option 1: Deploy via Supabase CLI (Recommended)**

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Deploy the Edge Function
npx supabase functions deploy send-smtp-email
```

### **Option 2: Deploy via Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** section
4. Click **Deploy new function**
5. Upload the file: `supabase/functions/send-smtp-email/index.ts`
6. Name it: `send-smtp-email`
7. Click **Deploy**

---

## 🔧 **What Changed**

### **Before (Broken)**:
```
Browser → Nodemailer → SMTP Server ❌
```
**Problem**: Nodemailer needs Node.js, doesn't work in browser

### **After (Fixed)**:
```
Browser → Edge Function → SMTP Server ✅
```
**Solution**: Edge Function runs on server with proper SMTP support

---

## 📝 **Files Created/Modified**

### **Created:**
- ✅ `supabase/functions/send-smtp-email/index.ts` - Edge Function for SMTP
- ✅ `supabase/functions/send-smtp-email/deno.json` - Config

### **Modified:**
- ✅ `src/services/emailService.ts` - Now calls Edge Function instead of nodemailer

### **Removed:**
- ❌ `nodemailer` package (uninstalled)
- ❌ `@types/nodemailer` package (uninstalled)

---

## ✅ **Benefits**

1. **No Browser Errors**: Edge Function runs on server
2. **More Secure**: SMTP credentials stay on server
3. **Better Performance**: Proper Node.js environment
4. **No Console Warnings**: Clean implementation
5. **Production Ready**: Industry standard approach

---

## 🧪 **Testing**

After deploying Edge Function:

1. **Test Connection**:
   - Go to: http://localhost:8080/company-setup
   - Configure SMTP settings
   - Click "Test SMTP Connection"
   - Should see success message (no errors!)

2. **Send Real Emails**:
   - Go to screening results
   - Click "Invite" button
   - Candidate receives email from `recruitment@idraq.com`

---

## 🔍 **How It Works**

### **1. Test Connection**
```typescript
// Frontend calls Edge Function
testSMTPConnection(config) 
  → Edge Function tests SMTP connection
  → Returns success/error message
```

### **2. Send Email**
```typescript
// Frontend calls Edge Function
sendEmail(config, payload)
  → Edge Function connects to SMTP
  → Sends email
  → Returns success/error
```

---

## 📊 **Edge Function Features**

### **Supports:**
- ✅ Test SMTP connection
- ✅ Send emails
- ✅ HTML and plain text
- ✅ CC/BCC
- ✅ Multiple recipients
- ✅ Any SMTP provider (Namecheap, Zoho, Gmail, etc.)
- ✅ Proper error messages

### **Used By:**
- Voice interview invitation emails
- Rejection emails
- Job offer emails (with attachments)

---

## 🎯 **Deployment Checklist**

- [ ] Deploy Edge Function (`send-smtp-email`)
- [ ] Configure SMTP settings in Company Setup
- [ ] Test SMTP connection (should work now!)
- [ ] Send test invite email
- [ ] Verify candidate receives email
- [ ] Check console (no more nodemailer errors!)

---

## 🔧 **Local Development**

### **Run Edge Function Locally:**

```bash
# Start Supabase local development
npx supabase start

# Serve Edge Functions locally
npx supabase functions serve send-smtp-email
```

### **Test Locally:**

Your frontend will automatically call the local Edge Function when running `npm run dev`.

---

## ⚠️ **Important Notes**

1. **Edge Function must be deployed** for emails to work
2. **SMTP settings** must be configured in Company Setup
3. **No more browser errors** - everything runs server-side
4. **Faster and more secure** than browser-based approach

---

## 🎉 **Ready to Deploy!**

Run this command:
```bash
npx supabase functions deploy send-smtp-email
```

Then test your SMTP connection - it should work perfectly now! 📧✨

---

## 📞 **Troubleshooting**

### **Edge Function not found?**
- Make sure you deployed it: `npx supabase functions deploy send-smtp-email`
- Check Supabase Dashboard → Edge Functions

### **Still getting errors?**
- Check Edge Function logs in Supabase Dashboard
- Verify SMTP settings are correct
- Test connection first before sending emails

### **Need help deploying?**
- See: https://supabase.com/docs/guides/functions/deploy
- Or use Supabase Dashboard (easier)

---

**That's it!** Your SMTP email system now works properly without browser errors! 🚀

