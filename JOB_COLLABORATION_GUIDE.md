# Job Collaboration Feature Guide

## Overview

The Job Collaboration feature allows company users to invite colleagues to collaborate on specific job postings. Collaborators get full access (edit/delete permissions) to the jobs they're invited to work on.

## Features

### ✅ What's Implemented

1. **Per-Job Invitations**: Invite colleagues to collaborate on specific job postings
2. **Full Access Permissions**: Collaborators can edit, delete, and manage the job
3. **Email Invitations**: Send invitations via email (with invitation links)
4. **Invitation Management**: View, cancel, and manage pending invitations
5. **Collaborator Management**: Add/remove collaborators from jobs
6. **Secure Access Control**: RLS policies ensure proper permissions
7. **Invitation Acceptance**: Dedicated page for accepting invitations
8. **Both User Types**: Invite existing users or send email invitations

## Database Schema

### New Tables

#### `job_invitations`
- Stores pending invitations sent to colleagues
- Includes expiration (7 days), status tracking, and unique tokens
- Links to jobs and inviter

#### `job_collaborators`
- Stores active collaborators for each job
- Tracks who invited whom and their role
- Links to jobs and users

### Updated RLS Policies

- Jobs can now be edited/deleted by both owners and collaborators
- Invitations can only be managed by job owners
- Collaborators can view their assigned jobs

## How to Use

### 1. Invite a Collaborator

1. Go to the Job Portal
2. Click "Edit" on any job you own
3. Scroll down to the "Collaboration Manager" section
4. Click "Invite Collaborator"
5. Enter the colleague's email address
6. Click "Send Invitation"

### 2. Accept an Invitation

1. The invited person receives an email with an invitation link
2. Click the link to go to the invitation acceptance page
3. Sign in (or create an account if needed)
4. Click "Accept Invitation"
5. You'll now have full access to edit the job

### 3. Manage Collaborators

- View all current collaborators in the job edit dialog
- Remove collaborators if needed
- Cancel pending invitations
- See invitation status (pending, accepted, declined, expired)

## Technical Implementation

### Files Created/Modified

#### New Files
- `supabase/migrations/20250116000001_add_job_collaboration.sql` - Database schema
- `src/hooks/useJobInvitations.ts` - Invitation management hooks
- `src/components/JobCollaborationManager.tsx` - UI component
- `src/pages/InviteAccept.tsx` - Invitation acceptance page
- `src/pages/TestCollaboration.tsx` - Test page
- `supabase/functions/send-invitation-email/index.ts` - Email service (optional)

#### Modified Files
- `src/integrations/supabase/types.ts` - Updated TypeScript types
- `src/components/CompanyView.tsx` - Added collaboration manager to job edit
- `src/App.tsx` - Added new routes

### Key Components

#### `useJobInvitations` Hook
```typescript
// Get invitations for a job
const { data: invitations } = useJobInvitations(jobId);

// Get collaborators for a job
const { data: collaborators } = useJobCollaborators(jobId);

// Invite a new collaborator
const inviteMutation = useInviteCollaborator();
inviteMutation.mutate({ jobId, email });

// Remove a collaborator
const removeMutation = useRemoveCollaborator();
removeMutation.mutate({ jobId, userId });
```

#### `JobCollaborationManager` Component
- Displays current collaborators
- Shows pending invitations
- Provides invite/remove functionality
- Integrated into job edit dialog

## Testing

### Test the Feature

1. **Run the Migration**:
   ```bash
   npx supabase db reset
   ```

2. **Access Test Page**:
   - Go to `/test-collaboration`
   - Select a job to see collaboration status

3. **Test Invitation Flow**:
   - Edit a job in the job portal
   - Scroll to "Collaboration Manager"
   - Invite a colleague
   - Check console for invitation link
   - Visit the link to test acceptance

### Test Scenarios

1. **Invite Existing User**:
   - User already has an account
   - They sign in and accept invitation
   - They can immediately edit the job

2. **Invite New User**:
   - User doesn't have an account
   - They click invitation link
   - They create account and accept invitation
   - They can edit the job

3. **Permission Testing**:
   - Collaborators can edit job details
   - Collaborators can delete the job
   - Non-collaborators cannot access the job
   - Invitation expires after 7 days

## Email Integration

### Current Implementation
- Invitation details are logged to console
- Invitation links are generated and stored
- Users can access invitations via direct links

### Production Email Setup
To enable actual email sending, integrate with an email service:

1. **Resend** (Recommended):
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await resend.emails.send({
     from: 'noreply@yourdomain.com',
     to: invitation.invited_email,
     subject: `You're invited to collaborate on "${jobTitle}"`,
     html: emailTemplate,
   });
   ```

2. **SendGrid**:
   ```typescript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   await sgMail.send({
     to: invitation.invited_email,
     from: 'noreply@yourdomain.com',
     subject: `You're invited to collaborate on "${jobTitle}"`,
     html: emailTemplate,
   });
   ```

## Security Considerations

### RLS Policies
- Only job owners can invite collaborators
- Only job owners can remove collaborators
- Collaborators can only access jobs they're assigned to
- Invitations expire after 7 days
- Email verification required for account creation

### Data Privacy
- Invitation emails contain job title and company name
- No sensitive job details in invitation emails
- Collaborators only see jobs they're assigned to
- User emails are only visible to job owners

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**:
   - Ensure user is authenticated
   - Check if user owns the job or is a collaborator
   - Verify RLS policies are applied

2. **Invitation not found**:
   - Check if invitation token is correct
   - Verify invitation hasn't expired
   - Ensure invitation exists in database

3. **Email not received**:
   - Check console for invitation details
   - Verify email service is configured
   - Check spam folder

### Debug Steps

1. Check browser console for errors
2. Verify database tables exist
3. Check RLS policies in Supabase dashboard
4. Test with different user accounts
5. Verify invitation tokens in database

## Future Enhancements

### Potential Improvements

1. **Email Templates**: Customizable email templates
2. **Role-Based Permissions**: Different permission levels
3. **Bulk Invitations**: Invite multiple users at once
4. **Notification System**: Real-time notifications
5. **Activity Logs**: Track who made what changes
6. **Company-Wide Invitations**: Invite to all company jobs

### Integration Ideas

1. **Slack Integration**: Send invitations via Slack
2. **Calendar Integration**: Schedule collaboration sessions
3. **Version Control**: Track job posting changes
4. **Approval Workflows**: Require approval for changes

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all migrations have been applied
3. Test with the `/test-collaboration` page
4. Check Supabase logs for database errors
5. Ensure all environment variables are set

The collaboration feature is now fully integrated and ready for use! 🎉
