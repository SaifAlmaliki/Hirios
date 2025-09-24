import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import EmailConfigurationManager from '@/components/EmailConfigurationManager';
import Navbar from '@/components/Navbar';

const EmailProcessing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Email Processing" />
      
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Processing</h1>
            <p className="text-gray-600">
              Automatically process resume attachments from your email inbox
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Gmail Integration</p>
                    <p className="text-2xl font-bold text-gray-900">OAuth2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Processing Interval</p>
                    <p className="text-2xl font-bold text-gray-900">Every 1 min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">AI Processing</p>
                    <p className="text-2xl font-bold text-gray-900">Automatic</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                How Email Processing Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">1. Email Monitoring</h3>
                  <p className="text-sm text-gray-600">
                    Our system checks your Gmail inbox every minute for new emails with PDF attachments
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">2. Resume Detection</h3>
                  <p className="text-sm text-gray-600">
                    PDF attachments are automatically identified as potential resumes and downloaded
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">3. Storage & Processing</h3>
                  <p className="text-sm text-gray-600">
                    Resumes are stored securely and sent for AI-powered information extraction
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExternalLink className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">4. Resume Pool</h3>
                  <p className="text-sm text-gray-600">
                    Processed resumes appear in your resume pool with extracted candidate information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gmail OAuth2 Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Google Cloud Project</h4>
                    <p className="text-sm text-gray-600">
                      Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> and create a new project or select an existing one.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-medium text-gray-900">Enable Gmail API</h4>
                    <p className="text-sm text-gray-600">
                      Navigate to "APIs & Services" → "Library" and enable the Gmail API for your project.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-medium text-gray-900">Create OAuth2 Credentials</h4>
                    <p className="text-sm text-gray-600">
                      Go to "APIs & Services" → "Credentials" and create OAuth2 client ID credentials.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <h4 className="font-medium text-gray-900">Configure Redirect URIs</h4>
                    <p className="text-sm text-gray-600">
                      Add these authorized redirect URIs to your OAuth2 client:
                      <br />
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://hirios.com/auth/gmail/callback</code>
                      <br />
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">http://localhost:8080/auth/gmail/callback</code> (for development)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">5</Badge>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Credentials</h4>
                    <p className="text-sm text-gray-600">
                      Copy your Client ID and Client Secret from the OAuth2 credentials page.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration Manager */}
          <EmailConfigurationManager />
        </div>
      </div>
    </div>
  );
};

export default EmailProcessing;
