import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useCompanySetup } from '@/hooks/useCompanySetup';
import { CompanyInfoTab } from '@/components/company-setup/CompanyInfoTab';
import { EmailConfigTab } from '@/components/company-setup/EmailConfigTab';

const CompanySetup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company');
  
  const {
    companyData,
    isSaving,
    smtpSaved,
    handleInputChange,
    handleLogoUploaded,
    handleLogoRemoved,
    saveCompanyInfo,
    saveSMTPConfig,
  } = useCompanySetup();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Show loading state
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

  // Security check
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Company Setup" />
      <div className="max-w-7xl mx-auto py-6 px-4 pt-20">
        <Card className="shadow-xl">
          <CardHeader>
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

              <TabsContent value="company">
                <CompanyInfoTab
                  companyData={companyData}
                  isSaving={isSaving}
                  onInputChange={handleInputChange}
                  onLogoUploaded={handleLogoUploaded}
                  onLogoRemoved={handleLogoRemoved}
                  onSave={saveCompanyInfo}
                />
              </TabsContent>

              <TabsContent value="email">
                <EmailConfigTab
                  companyData={companyData}
                  isSaving={isSaving}
                  smtpSaved={smtpSaved}
                  onInputChange={handleInputChange}
                  onSave={saveSMTPConfig}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetup;
