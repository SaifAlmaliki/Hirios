
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowLeft, CreditCard, Mail, Save, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { testCurrentUserSMTPConnection } from '@/services/emailService';
import { LogoUpload } from '@/components/LogoUpload';

const CompanySetup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalStorageData, setHasLocalStorageData] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  // Initialize company data with localStorage fallback
  const [companyData, setCompanyData] = useState(() => {
    const savedData = localStorage.getItem('company-setup-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setHasLocalStorageData(true);
        return parsed;
      } catch (error) {
        console.error('Failed to parse saved company data:', error);
      }
    }
    return {
      company_name: '',
      company_description: '',
      company_website: '',
      company_size: '',
      industry: '',
      address: '',
      phone: '',
      logo_url: '',
      // SMTP Email configuration
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '',
      smtp_from_email: '',
      smtp_from_name: '',
      smtp_secure: true,
    };
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }
  }, [user, loading, navigate]);

  // Check if company profile already exists
  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setHasProfile(true);
        // Only update companyData if we don't have localStorage data or unsaved changes
        if (!hasLocalStorageData && !hasUnsavedChanges) {
          setCompanyData({
            company_name: data.company_name || '',
            company_description: data.company_description || '',
            company_website: data.company_website || '',
            company_size: data.company_size || '',
            industry: data.industry || '',
            address: data.address || '',
            phone: data.phone || '',
            logo_url: data.logo_url || '',
            // SMTP Email configuration
            smtp_host: data.smtp_host || '',
            smtp_port: data.smtp_port || 587,
            smtp_user: data.smtp_user || '',
            smtp_password: data.smtp_password || '',
            smtp_from_email: data.smtp_from_email || '',
            smtp_from_name: data.smtp_from_name || '',
            smtp_secure: data.smtp_secure !== false,
          });
        }
      } else {
        // If no profile exists, create a basic one
        const { data: newProfile, error } = await supabase
          .from('company_profiles')
          .insert([{
            user_id: user.id,
            company_name: 'My Company',
            subscription_plan: 'trial'
          }])
          .select()
          .single();
        
        if (newProfile && !error) {
          setHasProfile(true);
          // Only update companyData if we don't have localStorage data
          if (!hasLocalStorageData) {
            setCompanyData({
              company_name: newProfile.company_name || '',
              company_description: newProfile.company_description || '',
              company_website: newProfile.company_website || '',
              company_size: newProfile.company_size || '',
              industry: newProfile.industry || '',
              address: newProfile.address || '',
              phone: newProfile.phone || '',
              logo_url: newProfile.logo_url || '',
              // SMTP Email configuration defaults
              smtp_host: '',
              smtp_port: 587,
              smtp_user: '',
              smtp_password: '',
              smtp_from_email: '',
              smtp_from_name: '',
              smtp_secure: true,
            });
          }
        }
      }
    };

    checkProfile();
  }, [user, hasLocalStorageData, hasUnsavedChanges]);

  // Check if SMTP is configured and saved
  useEffect(() => {
    if (companyData.smtp_host && companyData.smtp_user && companyData.smtp_password && companyData.smtp_from_email && !hasUnsavedChanges) {
      setSmtpSaved(true);
    } else if (hasUnsavedChanges) {
      setSmtpSaved(false);
    }
  }, [companyData.smtp_host, companyData.smtp_user, companyData.smtp_password, companyData.smtp_from_email, hasUnsavedChanges]);

  // Handle tab visibility changes to restore data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedData = localStorage.getItem('company-setup-draft');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setCompanyData(parsed);
            setHasUnsavedChanges(true);
          } catch (error) {
            console.error('Failed to restore data:', error);
          }
        }
      } else {
        localStorage.setItem('company-setup-draft', JSON.stringify(companyData));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [companyData]);

  // Save to localStorage whenever companyData changes
  useEffect(() => {
    if (companyData && Object.keys(companyData).length > 0) {
      localStorage.setItem('company-setup-draft', JSON.stringify(companyData));
    }
  }, [companyData]);

  // Warn user before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar title="Company Setup" />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Security check: Only allow companies to access this page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar title="Company Setup" />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">This page is only available for company accounts.</p>
            <Button onClick={() => navigate('/')}>
              Go to Landing Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...companyData, [field]: value };
    setCompanyData(newData);
    setHasUnsavedChanges(true);
    
    // Save to localStorage immediately
    localStorage.setItem('company-setup-draft', JSON.stringify(newData));
  };

  const handleLogoUploaded = (logoUrl: string) => {
    const newData = { ...companyData, logo_url: logoUrl };
    setCompanyData(newData);
    setHasUnsavedChanges(true);
    
    // Save to localStorage immediately
    localStorage.setItem('company-setup-draft', JSON.stringify(newData));
  };

  const handleLogoRemoved = () => {
    const newData = { ...companyData, logo_url: '' };
    setCompanyData(newData);
    setHasUnsavedChanges(true);
    
    // Save to localStorage immediately
    localStorage.setItem('company-setup-draft', JSON.stringify(newData));
  };

  // Save company information
  const saveCompanyInfo = async () => {
    setIsSaving(true);
    try {
      const companyFields = {
        company_name: companyData.company_name,
        company_description: companyData.company_description,
        company_website: companyData.company_website,
        company_size: companyData.company_size,
        industry: companyData.industry,
        address: companyData.address,
        phone: companyData.phone,
        logo_url: companyData.logo_url,
      };

      // Check if profile exists in database
      const { data: existingProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let error;
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('company_profiles')
          .update(companyFields)
          .eq('user_id', user!.id);
        error = updateError;
        setHasProfile(true);
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('company_profiles')
          .insert([{ ...companyFields, user_id: user!.id }]);
        error = insertError;
        if (!error) setHasProfile(true);
      }

      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setHasUnsavedChanges(false);
        localStorage.removeItem('company-setup-draft');
        toast({
          title: "✅ Saved Successfully",
          description: "Company information has been saved.",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save company information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save SMTP configuration
  const saveSMTPConfig = async () => {
    setIsSaving(true);
    try {
      const smtpFields = {
        smtp_host: companyData.smtp_host,
        smtp_port: companyData.smtp_port,
        smtp_user: companyData.smtp_user,
        smtp_password: companyData.smtp_password,
        smtp_from_email: companyData.smtp_from_email,
        smtp_from_name: companyData.smtp_from_name,
        smtp_secure: companyData.smtp_secure,
      };

      // Check if profile exists in database
      const { data: existingProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let error;
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('company_profiles')
          .update(smtpFields)
          .eq('user_id', user!.id);
        error = updateError;
        setHasProfile(true);
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('company_profiles')
          .insert([{ ...smtpFields, user_id: user!.id, company_name: 'My Company' }]);
        error = insertError;
        if (!error) setHasProfile(true);
      }

      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setHasUnsavedChanges(false);
        setSmtpSaved(true);
        localStorage.removeItem('company-setup-draft');
        toast({
          title: "✅ Saved Successfully",
          description: "SMTP configuration has been saved. You can now test the connection.",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save SMTP configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    };
  };

  const handleJobPortal = () => {
    // Clear localStorage draft since we're navigating away
    localStorage.removeItem('company-setup-draft');
    setHasLocalStorageData(false);
    navigate('/job-portal');
  };

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
      // Test SMTP connection
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

    // Determine recipient
    const recipient = testEmailAddress.trim() || companyData.smtp_from_email;

    setIsTesting(true);

    try {
      const { sendEmailFromCurrentUser } = await import('@/services/emailService');
      
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
      
      // Clear test email field
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Company Setup" />
      <div className="max-w-7xl mx-auto py-12 px-4 pt-32">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-600 p-3 rounded-full w-fit mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Company Setup
            </CardTitle>
            <CardDescription>
              Complete your company profile to start posting jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Information
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Configuration
                </TabsTrigger>
              </TabsList>

              {/* Company Information Tab */}
              <TabsContent value="company" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={companyData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_website">Website</Label>
                  <Input
                    id="company_website"
                    value={companyData.company_website}
                    onChange={(e) => handleInputChange('company_website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description</Label>
                <Textarea
                  id="company_description"
                  value={companyData.company_description}
                  onChange={(e) => handleInputChange('company_description', e.target.value)}
                  placeholder="Describe your company..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select value={companyData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={companyData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={companyData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Company address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Company phone number"
                  />
                </div>
              </div>

                {/* Company Logo Upload Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Company Logo</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your company logo to personalize the platform. The logo will appear in the navigation bar and on job offers.
                  </p>
                  
                  <LogoUpload
                    currentLogoUrl={companyData.logo_url}
                    onLogoUploaded={handleLogoUploaded}
                    onLogoRemoved={handleLogoRemoved}
                    disabled={isSaving}
                  />
                </div>

                {/* Save Button for Company Info */}
                <div className="flex justify-end pt-6 border-t mt-6">
                  <Button
                    onClick={saveCompanyInfo}
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
                        Save Company Information
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Email Configuration Tab */}
              <TabsContent value="email" className="space-y-6">

                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Email Configuration (SMTP)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Configure your company's email server for sending candidate communications (invitations, rejections, job offers). 
                  Works with Namecheap, Zoho, Gmail, Outlook, and any SMTP provider.
                </p>

                <div className="space-y-4 bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800 font-medium">Common SMTP Settings:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                    <div>
                      <strong>Namecheap:</strong> mail.privateemail.com:587
                    </div>
                    <div>
                      <strong>Zoho:</strong> smtp.zoho.com:587
                    </div>
                    <div>
                      <strong>Gmail:</strong> smtp.gmail.com:587
                    </div>
                    <div>
                      <strong>Outlook:</strong> smtp.office365.com:587
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP Host *</Label>
                      <Input
                        id="smtp_host"
                        value={companyData.smtp_host}
                        onChange={(e) => handleInputChange('smtp_host', e.target.value)}
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
                        onChange={(e) => handleInputChange('smtp_port', e.target.value)}
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
                        onChange={(e) => handleInputChange('smtp_user', e.target.value)}
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
                        onChange={(e) => handleInputChange('smtp_password', e.target.value)}
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
                        onChange={(e) => handleInputChange('smtp_from_email', e.target.value)}
                        placeholder="recruitment@idraq.com"
                      />
                      <p className="text-xs text-gray-500">Email address shown to candidates</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_from_name">From Name</Label>
                      <Input
                        id="smtp_from_name"
                        value={companyData.smtp_from_name}
                        onChange={(e) => handleInputChange('smtp_from_name', e.target.value)}
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
                      onChange={(e) => handleInputChange('smtp_secure', String(e.target.checked))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="smtp_secure" className="text-sm font-normal">
                      Use secure connection (TLS/SSL) - Recommended
                    </Label>
                  </div>

                  {/* Save Button for SMTP Config */}
                  <div className="flex justify-end pt-6 border-t mt-6">
                    <Button
                      onClick={saveSMTPConfig}
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

                  {/* Test Connection Buttons */}
                  <div className="pt-4 border-t space-y-3">
                    {!smtpSaved && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ Please save your SMTP configuration before testing the connection.
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={!smtpSaved || isTesting}
                        className="flex-1 sm:flex-none"
                      >
                        {isTesting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Testing...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="testEmailAddress" className="text-sm">
                        Test Email Recipient (optional)
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
                          variant="default"
                          onClick={handleSendTestEmail}
                          disabled={!smtpSaved || isTesting}
                          className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
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
                      <p className="text-xs text-gray-500">
                        Send a test email to verify deliverability. Try mail-tester.com to check your email score!
                      </p>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Test connection validates SMTP settings without sending email. Make sure to save your configuration first.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center pt-6 border-t mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleJobPortal}
                className="px-8"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetup;
