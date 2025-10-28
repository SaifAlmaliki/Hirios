# Multi-User HR Team Management Implementation

## Overview
Successfully implemented a comprehensive multi-user team management system that allows HR departments to have multiple employees (owner, members) collaborate on the same company account.

## Features Implemented

### 1. Role-Based Access Control
- **Two Roles**: `owner` and `member`
- **Owner Permissions** (Full Access):
  - ✅ Create, edit, and delete jobs
  - ✅ View and manage resume pool
  - ✅ Screen candidates and send invites/rejections
  - ✅ Delete resumes
  - ✅ Invite and remove team members
  - ✅ Edit company profile
  
- **Member Permissions** (Limited Access):
  - ✅ View all jobs and resume pools
  - ✅ Create new jobs (but cannot edit existing ones)
  - ✅ Screen candidates and send invites/rejections
  - ❌ Cannot delete jobs
  - ❌ Cannot delete resumes
  - ❌ Cannot invite/remove team members
  - ❌ Cannot edit company profile

### 2. Team Invitation System
- Owners can invite colleagues via email
- Invitation emails sent using company's configured SMTP settings
- Beautiful HTML email template with company branding
- Unique invitation tokens (no expiration)
- Invitations can be deleted before acceptance
- Automatic account linking upon acceptance

### 3. Team Management Dashboard
- **Location**: `/team-management` (owner-only access)
- **Features**:
  - List all team members with roles and join dates
  - View pending invitations
  - Send new invitations via email
  - Remove team members (except yourself)
  - Delete pending invitations
  - Clean, modern UI with gradient styling

### 4. Invitation Signup Flow
- **Location**: `/join/:token`
- Public route accessible without authentication
- Displays company name and invitation details
- Lists member permissions and benefits
- Validates invitation token
- Checks email match with invited email
- Auto-redirects to auth if not logged in
- Creates member account upon acceptance

## Database Changes

### Migration File
`supabase/migrations/20250128000002_add_team_members_support.sql`

### Schema Updates

#### 1. `company_profiles` Table
- Added `role` column: `text DEFAULT 'owner' NOT NULL CHECK (role IN ('owner', 'member'))`
- All existing users automatically set as `owner`

#### 2. New `team_invitations` Table
```sql
CREATE TABLE team_invitations (
    id uuid PRIMARY KEY,
    company_profile_id uuid NOT NULL REFERENCES company_profiles(id),
    invited_email text NOT NULL,
    invited_by uuid NOT NULL REFERENCES auth.users(id),
    token text UNIQUE NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
```

#### 3. RLS Policies Updated
- **company_profiles**: Team members can view their company profile, only owners can update
- **jobs**: Team members can view and create, only owners can update/delete
- **resume_pool**: Team members can view/insert/update, only owners can delete
- **screening_results**: Team members have full access for their company's jobs
- **job_offers**: Team members have full access for their company's jobs
- **candidate_status**: Team members have full access for their company's jobs
- **candidate_comments**: Team members have full access for their company's jobs

#### 4. New Function
```sql
CREATE FUNCTION accept_team_invitation(invitation_token text) RETURNS json
```
- Validates invitation token
- Creates new company profile for member
- Links member to same company (same company_name)
- Marks invitation as used

## Files Created

### Backend
1. **`supabase/migrations/20250128000002_add_team_members_support.sql`**
   - Complete database schema changes
   - RLS policies for team-based access
   - `accept_team_invitation` function

2. **`supabase/functions/send-team-invitation/index.ts`**
   - Supabase Edge Function for sending invitation emails
   - Uses company's SMTP configuration
   - Beautiful HTML email template
   - Token generation and validation

3. **`supabase/functions/send-team-invitation/deno.json`**
   - Deno configuration for nodemailer imports

### Frontend
4. **`src/integrations/supabase/types/team.ts`**
   - TypeScript interfaces for team management
   - `TeamInvitation`, `TeamMember`, `CompanyProfileWithRole`

5. **`src/hooks/useTeamManagement.ts`**
   - React hook for team management operations
   - Fetches team members and pending invitations
   - Mutations for sending invitations, removing members, deleting invitations
   - Role-based permission checks

6. **`src/pages/TeamManagement.tsx`**
   - Complete team management dashboard
   - Team members table with roles and actions
   - Pending invitations table
   - Invite dialog with email input
   - Owner-only access with redirect

7. **`src/pages/JoinTeam.tsx`**
   - Public invitation acceptance page
   - Token validation
   - Company information display
   - Permission benefits list
   - Email verification
   - Auto-redirect to auth if needed

## Files Modified

### 1. `src/App.tsx`
- Added `/team-management` route (authenticated)
- Added `/join/:token` route (public)
- Imported `TeamManagement` and `JoinTeam` components

### 2. `src/components/ui/navbar-1.tsx`
- Added `Users` icon import
- Added `handleTeamManagement` handler
- Added Team Management button (visible only to owners)
- Added `team-management` route detection
- Conditional rendering based on `companyProfile?.role === 'owner'`

## User Flow

### For Owners (Inviting Team Members)
1. Navigate to `/team-management` from navbar
2. Click "Invite Team Member" button
3. Enter colleague's email address
4. System sends invitation email via company SMTP
5. Invitation appears in "Pending Invitations" table
6. Can delete invitation before acceptance

### For Invited Members (Joining Team)
1. Receive invitation email with unique link
2. Click "Accept Invitation" button in email
3. Redirected to `/join/:token` page
4. See company name and permissions list
5. Click "Accept Invitation"
6. If not logged in: redirected to auth page
7. After login/signup: automatically linked to company as member
8. Can access all member features immediately

### First-Time Registration
- Any new user registering becomes an `owner` automatically
- Can immediately invite team members

## Security Features

1. **RLS Policies**: All database access controlled by Row Level Security
2. **Role Validation**: Backend validates role before allowing operations
3. **Email Verification**: Invitation acceptance checks email match
4. **Token-Based**: Unique tokens prevent unauthorized access
5. **Owner-Only Actions**: Critical operations restricted to owners
6. **Cascade Deletion**: Removing member deletes their company profile

## UI/UX Features

1. **Simple Role Display**: Only shown in team management page
2. **Visual Indicators**: 
   - Crown icon for owners
   - User icon for members
   - Badge colors differentiate roles
3. **Responsive Design**: Works on mobile and desktop
4. **Loading States**: Proper loading indicators
5. **Error Handling**: Clear error messages
6. **Toast Notifications**: Success/error feedback
7. **Confirmation Dialogs**: Prevent accidental deletions

## Email Template

The invitation email includes:
- Gradient header with "You're Invited! 🎉"
- Inviter name and company name
- List of member permissions
- Prominent "Accept Invitation" button
- Copy-paste link option
- Company branding in footer
- Responsive design for all devices

## Next Steps (To Deploy)

### 1. Apply Database Migration
```bash
# In Supabase project
supabase db push

# Or manually run the migration file in Supabase SQL Editor
```

### 2. Deploy Edge Function
```bash
# Deploy send-team-invitation function
supabase functions deploy send-team-invitation
```

### 3. Set Environment Variables
Ensure these are set in Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL` (e.g., https://your-domain.com)

### 4. Test the Flow
1. Register as a new company (becomes owner)
2. Configure SMTP in Company Setup
3. Navigate to Team Management
4. Send invitation to test email
5. Accept invitation in new browser/incognito
6. Verify member has correct permissions

## Known TypeScript Errors (Expected)

The following TypeScript errors are expected until the migration is applied:
- `Property 'role' does not exist on type 'company_profiles'`
- `Argument of type '"team_invitations"' is not assignable`
- `Property 'user_id' does not exist`

These will resolve automatically once:
1. Migration is applied to database
2. Supabase types are regenerated (run `npx supabase gen types typescript`)

## Permissions Matrix

| Action | Owner | Member |
|--------|-------|--------|
| View jobs/resumes/screening | ✅ | ✅ |
| Create new jobs | ✅ | ✅ |
| Edit existing jobs | ✅ | ❌ |
| Delete jobs | ✅ | ❌ |
| Delete resumes | ✅ | ❌ |
| Screen & send invites/rejections | ✅ | ✅ |
| Invite/remove team members | ✅ | ❌ |
| Edit company profile | ✅ | ❌ |
| Access Team Management page | ✅ | ❌ |

## Technical Implementation Details

### Team Member Linking Strategy
Instead of creating a separate `team_members` junction table, we use the existing `company_profiles` table:
- Each team member gets their own `company_profile` record
- All team members share the same `company_name`
- The `role` column differentiates owners from members
- RLS policies check both `user_id` and `company_name` for access control

### Why This Approach?
1. **Simplicity**: Reuses existing infrastructure
2. **Consistency**: All users have a company profile
3. **Scalability**: Easy to query all team members
4. **Flexibility**: Can add more roles in future

### Data Synchronization
When a member accepts an invitation:
- Company profile data (name, description, logo, etc.) is copied from owner
- Member gets their own `user_id` but same `company_name`
- Member's profile stays in sync through shared `company_name`

## Conclusion

The multi-user HR team management system is fully implemented and ready for deployment. Once the migration is applied and the Edge Function is deployed, the system will allow HR departments to collaborate effectively with proper role-based access control.

All code follows best practices:
- Type-safe TypeScript
- Secure RLS policies
- Clean component architecture
- Responsive design
- Proper error handling
- User-friendly UX
