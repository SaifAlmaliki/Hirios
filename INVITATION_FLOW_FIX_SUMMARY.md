# Team Invitation Flow - Complete Fix

## Problem

When an invited user clicks "Accept Invitation" and registers a new account, they end up with a **new separate company profile** instead of being linked to the inviter's company.

### What Was Happening:
1. ✅ User receives invitation email
2. ✅ Clicks invitation link → sees "You're Invited" page  
3. ✅ Clicks "Accept Invitation" → redirected to `/auth` to sign up
4. ❌ After signup, database trigger creates **NEW company profile** as owner
5. ❌ User never actually accepts the invitation
6. ❌ User can't see inviter's jobs or resumes

## Root Causes

### Issue 1: Session Storage Key Mismatch
- `JoinTeam.tsx` stored: `team_invitation_token`
- `Auth.tsx` checked for: `postLoginRedirectUrl`
- Result: After login, user wasn't redirected back to invitation page

### Issue 2: Premature Profile Creation
- Database trigger creates company profile immediately on user registration
- Invited users got a new profile before accepting invitation
- The `accept_team_invitation` function never ran

## The Fix

### 1. Fixed Session Storage (JoinTeam.tsx)
Changed from:
```typescript
sessionStorage.setItem("team_invitation_token", token || "");
navigate(`/auth?redirect=/join/${token}`);
```

To:
```typescript
sessionStorage.setItem("postLoginRedirectUrl", `/join/${token}`);
navigate(`/auth`);
```

### 2. Updated Database Trigger (FIX_INVITATION_FLOW.sql)
The trigger now:
- ✅ Checks if user has a pending invitation
- ✅ If invitation exists → Skips profile creation
- ✅ If no invitation → Creates profile as owner
- ✅ Profile will be created when invitation is accepted

## Apply the Fix

### Step 1: Update Database Trigger
Run this in Supabase SQL Editor:

```sql
-- Copy and run: FIX_INVITATION_FLOW.sql
```

### Step 2: Test the Flow

#### Test Case 1: Regular Signup (No Invitation)
1. Go to `/auth`
2. Sign up with new email
3. Confirm email
4. Login
5. ✅ Should have company profile as owner
6. ✅ Can create jobs and upload resumes

#### Test Case 2: Invitation Signup
1. Owner sends invitation to `newuser@example.com`
2. New user receives email
3. Clicks invitation link → sees "You're Invited" page
4. Clicks "Accept Invitation" → redirected to `/auth`
5. Signs up with `newuser@example.com`
6. Confirms email
7. Logs in
8. ✅ Automatically redirected back to `/join/:token`
9. ✅ Invitation is accepted
10. ✅ User is linked to company as member
11. ✅ Can see all jobs and resumes from the company

## Expected Behavior After Fix

### For Invited Users:
1. Click invitation link
2. Register with invited email
3. Confirm email
4. Login
5. **Automatically redirected to invitation page**
6. Invitation accepted automatically
7. Linked to company as member
8. Can access all company data

### For Regular Users:
1. Register normally
2. Confirm email
3. Login
4. Company profile created as owner
5. Can set up company and start using platform

## Technical Details

### Database Trigger Logic:
```sql
-- Check for pending invitation
SELECT * FROM team_invitations 
WHERE invited_email = NEW.email AND used = false

-- If found: Skip profile creation
-- If not found: Create profile as owner
```

### Session Flow:
```
User clicks "Accept Invitation"
  ↓
Store: postLoginRedirectUrl = "/join/:token"
  ↓
Redirect to /auth
  ↓
User signs up & confirms email
  ↓
User logs in
  ↓
Auth page checks postLoginRedirectUrl
  ↓
Redirect to /join/:token
  ↓
JoinTeam page calls accept_team_invitation()
  ↓
User linked to company as member
```

## Verification

After applying the fix, verify:

1. ✅ Invited user can register and accept invitation
2. ✅ Invited user sees company's jobs and resumes
3. ✅ Invited user has `role = 'member'`
4. ✅ Invited user has correct `company_name`
5. ✅ Regular users still work normally
6. ✅ No duplicate company profiles created

## Files Modified

- ✅ `src/pages/JoinTeam.tsx` - Fixed session storage key
- ✅ `FIX_INVITATION_FLOW.sql` - Updated database trigger

## Common Issues

### Issue: User still creates separate profile
**Solution**: Make sure you ran the `FIX_INVITATION_FLOW.sql` script

### Issue: User not redirected after login
**Solution**: Clear browser cache and sessionStorage, try again

### Issue: Email mismatch error
**Solution**: User must register with the exact email that received the invitation

## Success Criteria

✅ Invited users are linked to existing company
✅ Invited users can see all company data
✅ Invited users have `role = 'member'`
✅ Regular users still create their own company
✅ No duplicate profiles created
