# Email Processing Setup Guide

This guide explains how to set up the email processing system that automatically captures resume attachments from Gmail and processes them through your Hirios application.

## Overview

The email processing system replaces the n8n workflow with a native Supabase Edge Function that:
- Connects to Gmail via IMAP using OAuth2
- Downloads PDF attachments from emails
- Stores them in Supabase Storage
- Inserts records into the `resume_pool` table
- Triggers AI processing via webhook

## Architecture

```
Gmail IMAP → Supabase Edge Function → Storage Upload → Database Insert → Webhook to n8n (for AI)
```

## Setup Steps

### 1. Database Migration

Run the database migration to create the required tables:

```bash
supabase db push
```

This creates:
- `email_configurations` - Stores Gmail OAuth2 credentials per company
- `processed_emails` - Tracks processed emails to avoid duplicates
- System user for automated processing

### 2. Gmail OAuth2 Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Gmail API

#### Step 2: Create OAuth2 Credentials
1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add authorized redirect URIs:
   - `https://hirios.com/auth/gmail/callback`
   - `http://localhost:8080/auth/gmail/callback` (for development)

#### Step 3: Get Credentials
1. Copy your Client ID and Client Secret
2. You'll need these for the email configuration

### 3. Environment Variables

Add these environment variables to your Supabase project:

```bash
# Gmail OAuth2 (you'll get these from Google Cloud Console)
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here

# Webhook URL for AI processing (existing n8n webhook)
WEBHOOK_RESUME_POOL_URL=your_n8n_webhook_url_here
```

### 4. Deploy Edge Function

Deploy the email processing function:

```bash
supabase functions deploy process-email-resumes
```

### 5. Configure Cron Job

The cron job is already configured in `supabase/config.toml` to run every minute:

```toml
[cron]
enabled = true
jobs = [
  { name = "process-email-resumes", schedule = "*/1 * * * *", function = "process-email-resumes" }
]
```

### 6. Frontend Configuration

The email processing page is available at `/email-processing` and includes:
- Email configuration management
- Gmail OAuth2 setup instructions
- Real-time status monitoring

## Usage

### 1. Configure Email Account

1. Navigate to `/email-processing` in your Hirios application
2. Click "Add Email Account"
3. Enter your Gmail credentials:
   - Email address
   - Gmail Client ID
   - Gmail Client Secret
   - Optional: Refresh Token and Access Token

### 2. Test Email Processing

1. Send an email with a PDF attachment to your configured Gmail account
2. The system will automatically:
   - Detect the email within 1 minute
   - Download the PDF attachment
   - Store it in Supabase Storage
   - Create a record in `resume_pool`
   - Send to AI processing webhook

### 3. Monitor Processing

- Check the resume pool at `/resume-pool` to see processed resumes
- View processing logs in Supabase Edge Functions logs
- Monitor email configurations at `/email-processing`

## File Structure

```
supabase/
├── functions/
│   └── process-email-resumes/
│       ├── index.ts              # Main processing function
│       └── deno.json            # Dependencies
├── migrations/
│   └── 20250122_create_email_processing_tables.sql
└── config.toml                  # Cron job configuration

src/
├── hooks/
│   └── useEmailConfigurations.ts # Email config management
├── components/
│   └── EmailConfigurationManager.tsx # UI for email configs
└── pages/
    └── EmailProcessing.tsx      # Email processing page
```

## Database Schema

### email_configurations
- `id` - UUID primary key
- `company_profile_id` - Links to company
- `email_address` - Gmail address
- `client_id` - Gmail OAuth2 client ID
- `client_secret` - Gmail OAuth2 client secret
- `refresh_token` - OAuth2 refresh token
- `access_token` - OAuth2 access token
- `is_active` - Enable/disable processing

### processed_emails
- `id` - UUID primary key
- `email_config_id` - Links to email configuration
- `email_uid` - Gmail message UID
- `subject` - Email subject
- `processed_at` - Processing timestamp

## Security

- All email credentials are encrypted in the database
- OAuth2 tokens are securely stored
- Row Level Security (RLS) ensures companies only see their own configurations
- Service role has access for automated processing

## Troubleshooting

### Common Issues

1. **OAuth2 Authentication Failed**
   - Verify Client ID and Secret are correct
   - Check redirect URIs match exactly
   - Ensure Gmail API is enabled

2. **No Emails Processed**
   - Check if email configuration is active
   - Verify Gmail account has emails with PDF attachments
   - Check Edge Function logs for errors

3. **Storage Upload Failed**
   - Verify Supabase Storage bucket exists
   - Check storage permissions
   - Ensure file size limits are not exceeded

### Logs

Check Supabase Edge Function logs:
```bash
supabase functions logs process-email-resumes
```

## Migration from n8n

This system replaces the n8n workflow with the following benefits:
- Native Supabase integration
- Better error handling and logging
- Configurable per company
- No external service dependencies
- Automatic scaling with Supabase

The webhook integration with n8n for AI processing remains unchanged, ensuring compatibility with existing AI workflows.
