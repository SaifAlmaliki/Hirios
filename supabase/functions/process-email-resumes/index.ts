import { serve } from "std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ImapFlow } from 'https://esm.sh/imapflow@1.0.161';
import { simpleParser } from 'https://esm.sh/mailparser@3.6.5';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Initialize Supabase client with service role key
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    console.log('🚀 Starting email resume processing job...');
    // Get all active email configurations
    const { data: emailConfigs, error: configError } = await supabase.from('email_configurations').select('*').eq('is_active', true);
    if (configError) {
      console.error('❌ Error fetching email configurations:', configError);
      throw configError;
    }
    if (!emailConfigs || emailConfigs.length === 0) {
      console.log('ℹ️ No active email configurations found');
      return new Response(JSON.stringify({
        message: 'No active email configurations found'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`📧 Found ${emailConfigs.length} active email configurations`);
    let totalProcessed = 0;
    let totalErrors = 0;
    // Process each email configuration
    for (const config of emailConfigs){
      try {
        console.log(`📬 Processing emails for: ${config.email_address}`);
        const processed = await processEmailAccount(config);
        totalProcessed += processed;
        console.log(`✅ Processed ${processed} emails for ${config.email_address}`);
      } catch (error) {
        console.error(`❌ Error processing ${config.email_address}:`, error);
        totalErrors++;
      }
    }
    console.log(`🎉 Email processing completed. Processed: ${totalProcessed}, Errors: ${totalErrors}`);
    return new Response(JSON.stringify({
      success: true,
      message: 'Email processing completed',
      processed: totalProcessed,
      errors: totalErrors
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('💥 Unexpected error in email processing:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function processEmailAccount(config) {
  let processedCount = 0;
  try {
    // Connect to Gmail IMAP
    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: config.email_address,
        accessToken: config.access_token
      },
      logger: false
    });
    await client.connect();
    console.log(`🔗 Connected to Gmail for ${config.email_address}`);
    // Select INBOX
    let lock = await client.getMailboxLock('INBOX');
    try {
      // Search for emails with attachments from the last 24 hours
      const since = new Date();
      since.setDate(since.getDate() - 1) // Last 24 hours
      ;
      const searchQuery = {
        since: since,
        hasAttachment: true
      };
      console.log(`🔍 Searching for emails with attachments since ${since.toISOString()}`);
      for await (let message of client.search(searchQuery, {
        uid: true
      })){
        try {
          console.log(`📧 Processing email UID: ${message.uid}`);
          // Check if we've already processed this email
          const { data: existingEmail } = await supabase.from('processed_emails').select('id').eq('email_config_id', config.id).eq('email_uid', message.uid.toString()).single();
          if (existingEmail) {
            console.log(`⏭️ Email UID ${message.uid} already processed, skipping`);
            continue;
          }
          // Download the email
          const emailData = await client.download(message.uid, {
            uid: true
          });
          const parsed = await simpleParser(emailData);
          console.log(`📨 Email subject: ${parsed.subject}`);
          console.log(`📎 Attachments: ${parsed.attachments?.length || 0}`);
          // Process attachments
          if (parsed.attachments && parsed.attachments.length > 0) {
            for (const attachment of parsed.attachments){
              if (attachment.contentType === 'application/pdf' || attachment.filename?.toLowerCase().endsWith('.pdf')) {
                console.log(`📄 Processing PDF attachment: ${attachment.filename}`);
                const resumeData = await processResumeAttachment(attachment, config.company_profile_id, config.id);
                if (resumeData) {
                  // Store in database
                  const { data: resumeRecord, error: dbError } = await supabase.from('resume_pool').insert([
                    resumeData
                  ]).select().single();
                  if (dbError) {
                    console.error('❌ Database insert error:', dbError);
                    continue;
                  }
                  console.log(`✅ Resume stored with ID: ${resumeRecord.id}`);
                  // Send to webhook for AI processing
                  await sendToWebhook(resumeRecord, attachment.content);
                  processedCount++;
                }
              }
            }
          }
          // Mark email as processed
          await supabase.from('processed_emails').insert([
            {
              email_config_id: config.id,
              email_uid: message.uid.toString(),
              subject: parsed.subject,
              processed_at: new Date().toISOString()
            }
          ]);
        } catch (emailError) {
          console.error(`❌ Error processing email UID ${message.uid}:`, emailError);
        }
      }
    } finally{
      lock.release();
    }
    await client.logout();
    console.log(`🔌 Disconnected from Gmail for ${config.email_address}`);
  } catch (error) {
    console.error(`❌ Error processing email account ${config.email_address}:`, error);
    throw error;
  }
  return processedCount;
}
async function processResumeAttachment(attachment, companyProfileId, emailConfigId) {
  try {
    // Generate filename with timestamp
    const timestamp = Date.now();
    const originalFilename = attachment.filename || `resume_${timestamp}.pdf`;
    const fileName = `${timestamp}_${originalFilename}`;
    const filePath = `${companyProfileId}/resumes/pool/${fileName}`;
    console.log(`📁 Uploading to storage: ${filePath}`);
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from('company_uploads').upload(filePath, attachment.content, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf'
    });
    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      return null;
    }
    console.log(`✅ File uploaded to storage: ${uploadData.path}`);
    // Get system user ID for automated processing
    const { data: systemUser } = await supabase.from('auth.users').select('id').eq('email', 'system@hirios.com').single();
    const uploadedByUserId = systemUser?.id || '00000000-0000-0000-0000-000000000000';
    return {
      company_profile_id: companyProfileId,
      original_filename: originalFilename,
      storage_path: filePath,
      file_size: attachment.content.length,
      uploaded_by_user_id: uploadedByUserId,
      resume_text: null // Will be updated after AI processing
    };
  } catch (error) {
    console.error('❌ Error processing resume attachment:', error);
    return null;
  }
}
async function sendToWebhook(resumeRecord, fileContent) {
  try {
    // Convert file content to base64
    const base64Content = btoa(String.fromCharCode(...fileContent));
    const webhookData = {
      resume_id: resumeRecord.id,
      resume_filename: resumeRecord.original_filename,
      resume_base64: base64Content,
      company_id: resumeRecord.company_profile_id,
      uploaded_at: new Date().toISOString(),
      upload_source: 'email_processing',
      uploaded_by_company: true
    };
    console.log('📤 Sending webhook for AI processing...');
    const webhookUrl = Deno.env.get('WEBHOOK_RESUME_POOL_URL');
    if (!webhookUrl) {
      console.warn('⚠️ No webhook URL configured, skipping AI processing');
      return;
    }
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });
    if (!response.ok) {
      console.error('❌ Webhook failed:', response.status, response.statusText);
    } else {
      console.log('✅ Webhook sent successfully');
    }
  } catch (error) {
    console.error('❌ Error sending webhook:', error);
  }
}
