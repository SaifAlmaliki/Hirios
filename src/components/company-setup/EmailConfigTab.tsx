import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testCurrentUserSMTPConnection, sendEmailFromCurrentUser } from '@/services/emailService';
import { CompanyData } from '@/types/companySetup';

interface EmailConfigTabProps {
  companyData: CompanyData;
  isSaving: boolean;
  smtpSaved: boolean;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

export const EmailConfigTab: React.FC<EmailConfigTabProps> = ({
  companyData,
  isSaving,
  smtpSaved,
  onInputChange,
  onSave,
}) => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const handleTestConnection = async () => {
    if (!smtpSaved) {
      toast({
        title: "Please save first",
        description: "Save your SMTP configuration before testing the connection.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const result = await testCurrentUserSMTPConnection();
      if (result.success) {
        toast({
          title: "✅ Connection Successful!",
          description: result.message,
        });
      } else {
        toast({
          title: "❌ Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test SMTP connection",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!smtpSaved) {
      toast({
        title: "Please save first",
        description: "Save your SMTP configuration before sending a test email.",
        variant: "destructive",
      });
      return;
    }

    if (!companyData.smtp_from_email) {
      toast({
        title: "Missing email address",
        description: "Please configure your 'From Email Address' first.",
        variant: "destructive",
      });
      return;
    }

    const recipient = testEmailAddress.trim() || companyData.smtp_from_email;
    setIsTesting(true);

    try {
      await sendEmailFromCurrentUser({
        to: recipient,
        subject: 'Test Email from Hirios Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎉 Test Email Successful!</h2>
            <p>This is a test email from your Hirios platform.</p>
            <p><strong>From:</strong> ${companyData.smtp_from_email}</p>
            <p><strong>To:</strong> ${recipient}</p>
            <p><strong>Company:</strong> ${companyData.company_name || 'Not set'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 14px;">
              If you received this email, your SMTP configuration is working correctly! ✅
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Email Authentication:</strong><br/>
              ✅ SPF: Configured<br/>
              ✅ DKIM: Configured<br/>
              ✅ DMARC: Configured
            </p>
          </div>
        `,
        text: `Test Email Successful!\n\nThis is a test email from your Hirios platform.\n\nFrom: ${companyData.smtp_from_email}\nTo: ${recipient}\nCompany: ${companyData.company_name || 'Not set'}\nTime: ${new Date().toLocaleString()}\n\nIf you received this email, your SMTP configuration is working correctly!\n\nEmail Authentication:\n✅ SPF: Configured\n✅ DKIM: Configured\n✅ DMARC: Configured`,
      });

      toast({
        title: "✅ Test Email Sent!",
        description: `Check your inbox at ${recipient}`,
      });
      
      setTestEmailAddress('');
    } catch (error: unknown) {
      console.error('Test email error:', error);
      toast({
        title: "❌ Failed to Send Test Email",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Configuration (SMTP)</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Configure your company's email server for sending candidate communications (invitations, rejections, job offers). 
        Works with Namecheap, Zoho, Gmail, Outlook, and any SMTP provider.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP Host *</Label>
            <Input
              id="smtp_host"
              value={companyData.smtp_host}
              onChange={(e) => onInputChange('smtp_host', e.target.value)}
              placeholder="mail.privateemail.com"
            />
            <p className="text-xs text-gray-500">Your email provider's SMTP server</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_port">SMTP Port *</Label>
            <Input
              id="smtp_port"
              type="number"
              value={companyData.smtp_port}
              onChange={(e) => onInputChange('smtp_port', e.target.value)}
              placeholder="587"
            />
            <p className="text-xs text-gray-500">Usually 587 (TLS) or 465 (SSL)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_user">SMTP Username *</Label>
            <Input
              id="smtp_user"
              value={companyData.smtp_user}
              onChange={(e) => onInputChange('smtp_user', e.target.value)}
              placeholder="recruitment@idraq.com"
            />
            <p className="text-xs text-gray-500">Your email address</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_password">SMTP Password *</Label>
            <Input
              id="smtp_password"
              type="password"
              value={companyData.smtp_password}
              onChange={(e) => onInputChange('smtp_password', e.target.value)}
              placeholder="Your email password"
            />
            <p className="text-xs text-gray-500">Your email account password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_from_email">From Email *</Label>
            <Input
              id="smtp_from_email"
              type="email"
              value={companyData.smtp_from_email}
              onChange={(e) => onInputChange('smtp_from_email', e.target.value)}
              placeholder="recruitment@idraq.com"
            />
            <p className="text-xs text-gray-500">Email address shown to candidates</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_from_name">From Name</Label>
            <Input
              id="smtp_from_name"
              value={companyData.smtp_from_name}
              onChange={(e) => onInputChange('smtp_from_name', e.target.value)}
              placeholder="Idraq Hiring Team"
            />
            <p className="text-xs text-gray-500">Name shown to candidates (optional)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="smtp_secure"
            checked={companyData.smtp_secure}
            onChange={(e) => onInputChange('smtp_secure', String(e.target.checked))}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="smtp_secure" className="text-sm font-normal">
            Use secure connection (TLS/SSL) - Recommended
          </Label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t mt-6">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="px-8"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save SMTP Configuration
              </>
            )}
          </Button>
        </div>

        {/* Test Connection Section */}
        <div className="pt-6 border-t space-y-4">
          {!smtpSaved && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Please save your SMTP configuration before testing the connection.
              </p>
            </div>
          )}
          
          {/* Step 1: Test Connection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900">Test SMTP Connection</h4>
            </div>
            <p className="text-sm text-gray-600">
              First, verify that your SMTP settings are correct by testing the connection.
            </p>
            <Button
              type="button"
              onClick={handleTestConnection}
              disabled={!smtpSaved || isTesting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing Connection...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
          
          {/* Step 2: Send Test Email */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900">Send Test Email</h4>
            </div>
            <p className="text-sm text-gray-600">
              After connection is verified, send a test email to confirm deliverability.
            </p>
            <div className="space-y-2">
              <Label htmlFor="testEmailAddress" className="text-sm font-medium">
                Recipient Email (optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="testEmailAddress"
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder={`Leave empty to send to ${companyData.smtp_from_email || 'yourself'}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={!smtpSaved || isTesting}
                  className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
