# Complete Invitation Flow Fix

## Problem
User sees "Invalid Invitation" even though `used = false` in the database.

## Root Cause
**RLS Policy Missing**: The `team_invitations` table has RLS enabled, but there's no policy allowing **authenticated users** to read invitations sent to their email.

Current policies:
- ✅ `anon` users can read invitations (for unauthenticated users)
- ✅ Owners can read their company's invitations
- ❌ **Missing**: Authenticated users can't read invitations for their email

When a user logs in and visits `/join/:token`, they're authenticated but don't have a company profile yet, so the SELECT query fails due to RLS.

## Complete Fix - Run These 3 SQL Scripts

### 1. Fix RLS Policy (CRITICAL - Run First!)
```sql
-- File: FIX_INVITATION_RLS_POLICY.sql

CREATE POLICY "Authenticated users can read invitations for their email"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    invited_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);
```

### 2. Fix Database Trigger
```sql
-- File: FIX_INVITATION_FLOW.sql

CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_invitation record;
BEGIN
  -- Check if this user has a pending invitation
  SELECT * INTO v_pending_invitation
  FROM team_invitations
  WHERE invited_email = NEW.email
    AND used = false
  LIMIT 1;

  -- If there's a pending invitation, DON'T create a new company profile
  IF FOUND THEN
    RAISE NOTICE 'User % has pending invitation, skipping profile creation', NEW.email;
    RETURN NEW;
  END IF;

  -- No invitation found, create a new company profile as owner
  INSERT INTO public.company_profiles (
    user_id, role, email, created_at, updated_at
  ) VALUES (
    NEW.id, 'owner', NEW.email, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Fix Accept Invitation Function
```sql
-- File: FIX_ACCEPT_INVITATION_FUNCTION.sql

CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
    existing_profile_id uuid;
    current_user_email text;
BEGIN
    -- Get current user's email
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Get invitation details
    SELECT * INTO invitation_record
    FROM public.team_invitations
    WHERE token = invitation_token
    AND used = false;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
    END IF;

    -- Verify email matches
    IF current_user_email != invitation_record.invited_email THEN
        RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
    END IF;

    -- Check if user already has a company profile
    SELECT id INTO existing_profile_id
    FROM public.company_profiles
    WHERE user_id = auth.uid();

    IF existing_profile_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'User already has a company profile');
    END IF;

    -- Create a new company profile for the member
    INSERT INTO public.company_profiles (
        user_id,
        email,
        company_name,
        company_description,
        company_website,
        company_size,
        industry,
        address,
        phone,
        logo_url,
        subscription_plan,
        role,
        created_at,
        updated_at
    )
    SELECT
        auth.uid(),
        current_user_email,
        company_name,
        company_description,
        company_website,
        company_size,
        industry,
        address,
        phone,
        logo_url,
        subscription_plan,
        'member',
        NOW(),
        NOW()
    FROM public.company_profiles
    WHERE id = invitation_record.company_profile_id;

    -- Mark invitation as used
    UPDATE public.team_invitations
    SET used = true
    WHERE id = invitation_record.id;

    RETURN json_build_object('success', true, 'company_profile_id', invitation_record.company_profile_id);
END;
$$;
```

## Apply the Fixes

### Step 1: Run all 3 SQL scripts in Supabase SQL Editor

1. **FIX_INVITATION_RLS_POLICY.sql** ← Most important!
2. **FIX_INVITATION_FLOW.sql**
3. **FIX_ACCEPT_INVITATION_FUNCTION.sql**

### Step 2: Test the Flow

1. **Make sure user is logged in** as `saif.wsm@gmail.com`
2. **Go to invitation link**: `https://hirios.com/join/59d158cc-cb9d-4649-9dc1-f584801e5ccf`
3. **Should now see**: "You're Invited!" page with company details
4. **Click "Accept Invitation"**
5. **Should see**: "Welcome to the team! 🎉"
6. **Should be redirected** to `/job-portal`
7. **Should see**: All jobs and resumes from idraq company

## What Each Fix Does

### Fix 1: RLS Policy
- ✅ Allows authenticated users to read invitations sent to their email
- ✅ Fixes the "Invalid Invitation" error for logged-in users

### Fix 2: Database Trigger
- ✅ Prevents creating duplicate company profiles for invited users
- ✅ Skips profile creation if user has pending invitation
- ✅ Profile will be created when invitation is accepted

### Fix 3: Accept Function
- ✅ Includes `email` column when creating member profile
- ✅ Verifies email matches invitation
- ✅ Properly creates member profile with all company details

## Verification

After applying fixes, check:

1. ✅ User can see invitation page when logged in
2. ✅ User can accept invitation successfully
3. ✅ User is linked to correct company
4. ✅ User has `role = 'member'`
5. ✅ User can see all company jobs and resumes
6. ✅ Invitation is marked as `used = true`

## Common Issues

### Still seeing "Invalid Invitation"?
- Make sure you ran **FIX_INVITATION_RLS_POLICY.sql**
- Clear browser cache and try again
- Check browser console for errors

### User creates separate profile?
- Make sure you ran **FIX_INVITATION_FLOW.sql**
- Delete the wrong profile and try again

### Email mismatch error?
- User must log in with the exact email that received the invitation
- Check `invited_email` in database matches user's email

## Success!
After these fixes, the invitation flow will work perfectly! 🎉
