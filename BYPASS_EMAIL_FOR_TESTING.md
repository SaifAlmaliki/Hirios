# Bypass Email Sending for Testing

## Problem
The `send-team-invitation` Edge Function requires SMTP configuration, which is causing invitations to fail.

## Quick Fix for Testing

You have two options:

### Option 1: Configure SMTP (Recommended)

1. Go to `/company-setup` page
2. Scroll to "Email Settings" section
3. Configure SMTP:
   - **SMTP Host**: `smtp.gmail.com` (for Gmail)
   - **SMTP Port**: `587`
   - **SMTP User**: Your Gmail address
   - **SMTP Password**: [App Password](https://myaccount.google.com/apppasswords)
   - **From Email**: Your email
   - **From Name**: Your company name
4. Save settings
5. Try sending invitation again

### Option 2: Create Invitation Manually (Testing Only)

For testing, you can create invitations directly in the database without sending emails:

```sql
-- Create invitation manually
INSERT INTO team_invitations (
    company_profile_id,
    invited_email,
    invited_by,
    token,
    used
)
SELECT 
    id,
    'test@example.com',  -- Change this to the email you want to invite
    user_id,
    gen_random_uuid()::text,
    false
FROM company_profiles
WHERE user_id = auth.uid()
LIMIT 1;

-- Get the invitation link
SELECT 
    'https://hirios.com/join/' || token as invitation_link,
    invited_email
FROM team_invitations
WHERE used = false
ORDER BY created_at DESC
LIMIT 1;
```

### Option 3: Modify Edge Function to Skip Email (Development Only)

If you want to test without SMTP, you can temporarily modify the Edge Function to skip email sending.

**Note**: This is for development/testing only. Don't use in production.

## Recommended Approach

For testing the invitation flow:
1. Use **Option 2** (manual invitation creation) to test the acceptance flow
2. Once the flow works, configure SMTP using **Option 1** for production

## Gmail SMTP Setup (Most Common)

If using Gmail:
1. Go to https://myaccount.google.com/apppasswords
2. Create an app password
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your Gmail address
   - Password: The app password (not your regular password)
   - Secure: `true`

## Test the Flow

After configuring SMTP:
1. Go to `/team-management`
2. Enter email to invite
3. Click "Send Invitation"
4. ✅ Should see success message
5. ✅ Invited user receives email
6. ✅ Can accept invitation
