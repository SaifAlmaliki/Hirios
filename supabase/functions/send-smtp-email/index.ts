// @deno-types="npm:@types/nodemailer@6.4.14"
import nodemailer from "npm:nodemailer@6.9.8";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType?: string;
  }>;
}

interface SMTPConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name?: string;
  smtp_secure: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { config, payload, action } = requestBody as {
      config: SMTPConfig;
      payload?: EmailPayload;
      action?: 'test' | 'send';
    };

    console.log('📧 SMTP Email Function called');
    console.log('Action:', action);
    console.log('Config:', {
      host: config.smtp_host,
      port: config.smtp_port,
      user: config.smtp_user,
      secure: config.smtp_secure,
    });

    // Validate config
    if (!config?.smtp_host || !config?.smtp_port || !config?.smtp_user || !config?.smtp_password || !config?.smtp_from_email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Incomplete SMTP configuration',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine if we should use secure connection
    // Port 465: secure = true (direct SSL/TLS)
    // Port 587: secure = false, but use STARTTLS
    // Port 25: secure = false, no encryption
    const useSecure = config.smtp_port === 465;
    const useSTARTTLS = config.smtp_port === 587;

    console.log('🔐 Connection settings:', { 
      useSecure, 
      useSTARTTLS, 
      port: config.smtp_port 
    });

    // Create nodemailer transporter
    const transportConfig: any = {
      host: config.smtp_host,
      port: config.smtp_port,
      secure: useSecure, // true for 465, false for other ports
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password,
      },
    };

    // Add STARTTLS for port 587
    if (useSTARTTLS) {
      transportConfig.requireTLS = true;
      transportConfig.tls = {
        rejectUnauthorized: false, // Allow self-signed certificates
      };
    }

    // Add connection timeout
    transportConfig.connectionTimeout = 10000; // 10 seconds
    transportConfig.greetingTimeout = 10000; // 10 seconds

    console.log('📋 Transporter config:', {
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      requireTLS: transportConfig.requireTLS,
    });

    const transporter = nodemailer.createTransport(transportConfig);

    // Test connection
    if (action === 'test') {
      try {
        console.log('🧪 Testing SMTP connection with verify()...');
        await transporter.verify();
        
        console.log('✅ SMTP connection test successful');
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'SMTP connection successful! Your email settings are working correctly.',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error: any) {
        console.error('❌ SMTP test failed:', error);
        console.error('Error details:', {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
        });
        
        let errorMessage = 'SMTP connection failed. ';
        
        if (error.code === 'EAUTH' || error.responseCode === 535) {
          errorMessage += 'Authentication failed. Check your username and password.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage += 'Connection refused. Check your SMTP host and port.';
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
          errorMessage += 'Connection timeout. Check your SMTP host and firewall settings.';
        } else if (error.code === 'ENOTFOUND') {
          errorMessage += 'SMTP host not found. Check your SMTP host address.';
        } else if (error.message?.includes('TLS') || error.message?.includes('SSL')) {
          errorMessage += 'TLS/SSL error. Try port 587 with STARTTLS.';
        } else {
          errorMessage += error.message || 'Unknown error occurred.';
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            message: errorMessage,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Send email
    if (action === 'send' && payload) {
      try {
        console.log('📤 Preparing to send email to:', payload.to);
        console.log('📧 Subject:', payload.subject);

        // Prepare mail options
        const mailOptions: any = {
          from: config.smtp_from_name 
            ? `${config.smtp_from_name} <${config.smtp_from_email}>`
            : config.smtp_from_email,
          to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text || undefined,
        };

        // Add optional fields
        if (payload.cc && payload.cc.length > 0) {
          mailOptions.cc = payload.cc.join(', ');
        }
        if (payload.bcc && payload.bcc.length > 0) {
          mailOptions.bcc = payload.bcc.join(', ');
        }
        if (payload.replyTo) {
          mailOptions.replyTo = payload.replyTo;
        }

        // Handle attachments
        if (payload.attachments && payload.attachments.length > 0) {
          mailOptions.attachments = payload.attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
            encoding: 'base64',
            contentType: att.contentType,
          }));
        }

        console.log('📨 Mail options prepared:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          hasHtml: !!mailOptions.html,
          hasAttachments: !!mailOptions.attachments,
        });

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully. Message ID:', info.messageId);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error: any) {
        console.error('❌ Email send failed:', error);
        console.error('Error details:', {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
        });
        
        let errorMessage = 'Failed to send email. ';
        
        if (error.code === 'EAUTH' || error.responseCode === 535) {
          errorMessage += 'Authentication failed. Check your username and password.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage += 'Connection refused. Check your SMTP host and port.';
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
          errorMessage += 'Connection timeout. Check your SMTP host and firewall settings.';
        } else if (error.message?.includes('TLS') || error.message?.includes('SSL')) {
          errorMessage += 'TLS/SSL error. Try using port 587 with STARTTLS.';
        } else {
          errorMessage += error.message || 'Unknown error occurred.';
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            message: errorMessage,
            error: error.message,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid action or missing payload',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error?.message || 'Internal server error',
        error: error?.message || 'Internal server error',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
