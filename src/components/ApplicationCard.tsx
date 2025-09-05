
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, User, Calendar, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Application } from '../hooks/useApplications';

interface ApplicationCardProps {
  application: Application;
  getStatusColor: (status: string) => string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, getStatusColor }) => {
  const handleDownloadResume = () => {
    if (application.resume_url) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = application.resume_url;
      link.download = `${application.full_name}_Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEmailCandidate = () => {
    const subject = encodeURIComponent('Regarding your job application');
    const body = encodeURIComponent(`Dear ${application.full_name},\n\nThank you for your interest in our position.\n\nBest regards,`);
    window.open(`mailto:${application.email}?subject=${subject}&body=${body}`);
  };

  const getProcessingStatusIcon = () => {
    if (!application.uploaded_by_company) return null;
    
    switch (application.processing_status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Upload className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProcessingStatusBadge = () => {
    if (!application.uploaded_by_company) return null;
    
    switch (application.processing_status) {
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">AI Analysis Complete</Badge>;
      case 'failed':
        return <Badge variant="destructive">Processing Failed</Badge>;
      default:
        return <Badge variant="outline">Pending Processing</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            {application.uploaded_by_company ? (
              <Upload className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <User className="h-5 w-5 mr-2 text-blue-600" />
            )}
            {application.full_name}
            {application.uploaded_by_company && (
              <span className="text-xs text-gray-500 ml-2">(Company Upload)</span>
            )}
          </CardTitle>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={`${getStatusColor(application.status)} border`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
            {getProcessingStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {application.email === 'pending@extraction.com' ? 'Pending AI extraction' : application.email}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {application.phone === 'pending' ? 'Pending AI extraction' : application.phone}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {application.uploaded_by_company ? 'Uploaded' : 'Applied'} on {new Date(application.created_at).toLocaleDateString()}
            </span>
          </div>
          {application.original_filename && (
            <div className="flex items-center text-gray-600">
              <span className="text-sm text-gray-500">Original: {application.original_filename}</span>
            </div>
          )}
        </div>

        {/* Processing Error Display */}
        {application.processing_error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800 font-medium">Processing Error:</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{application.processing_error}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {application.email !== 'pending@extraction.com' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEmailCandidate}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email Candidate
            </Button>
          )}
          
          {application.resume_url && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadResume}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Resume
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
