# Email Verification Setup Guide

## Issue Description
New job seeker accounts are not receiving verification emails after registration. The accounts are created in the authentication database but remain unverified.

## Root Cause
Supabase email verification requires proper configuration in the Supabase dashboard. The current setup may not have email templates or SMTP settings configured.

## Solution Steps

### 1. Configure Email Templates in Supabase Dashboard

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `bwuomwyodoyyrqgdlwrp`

2. **Navigate to Authentication Settings**
   - Go to `Authentication` → `Settings`
   - Click on `Email Templates` tab

3. **Configure Email Templates**
   - **Confirm signup template**: Customize the email verification template
   - **Reset password template**: Configure password reset emails
   - **Change email address template**: Configure email change notifications

### 2. Configure SMTP Settings (Optional but Recommended)

1. **Go to Authentication Settings**
   - Navigate to `Authentication` → `Settings`
   - Click on `SMTP Settings`

2. **Configure SMTP Provider**
   - Choose a provider (SendGrid, Mailgun, etc.)
   - Enter your SMTP credentials
   - Test the connection

### 3. Alternative: Use Supabase's Built-in Email Service

If you don't want to configure SMTP, Supabase provides a built-in email service:

1. **Enable Built-in Email Service**
   - Go to `Authentication` → `Settings`
   - Ensure "Enable email confirmations" is checked
   - Set sender email address

### 4. Test Email Verification

1. **Create a test account**
   - Register a new job seeker account
   - Check if verification email is received

2. **Check spam folder**
   - Verification emails might go to spam
   - Add `noreply@supabase.co` to safe senders

### 5. Manual Email Verification (Development)

For development/testing, you can manually verify emails:

1. **Go to Supabase Dashboard**
   - Navigate to `Authentication` → `Users`
   - Find the unverified user
   - Click on the user
   - Click "Verify" button

### 6. Code Changes (Optional)

If you want to handle unverified users differently, you can modify the AuthContext:

```typescript
// In src/contexts/AuthContext.tsx
const signUp = async (email: string, password: string, userType: string) => {
  const redirectUrl = `${window.location.origin}/auth/confirm`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        user_type: userType
      }
    }
  });
  
  return { error };
};
```

### 7. Environment Variables Check

Ensure these environment variables are set in your `.env.local`:

```env
VITE_SUPABASE_URL=https://bwuomwyodoyyrqgdlwrp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Verification Flow

1. **User registers** → Account created but unverified
2. **Verification email sent** → User receives email with confirmation link
3. **User clicks link** → Account verified, can now sign in
4. **User signs in** → Access granted to appropriate portal

## Troubleshooting

### Email Not Received
- Check spam folder
- Verify email address is correct
- Check Supabase dashboard for email delivery status
- Ensure SMTP settings are correct

### Verification Link Expired
- Links typically expire after 24 hours
- User needs to request new verification email

### Development vs Production
- In development, emails might not be sent by default
- Use manual verification in Supabase dashboard for testing
- Configure proper SMTP for production

## Security Considerations

1. **Email Verification Required**: Users must verify email before accessing the application
2. **Rate Limiting**: Implement rate limiting for signup attempts
3. **Email Templates**: Use professional email templates
4. **Domain Verification**: Verify your domain in Supabase for better deliverability

## Next Steps

1. Configure email templates in Supabase dashboard
2. Test email verification flow
3. Monitor email delivery rates
4. Consider implementing email verification status checks in the UI 