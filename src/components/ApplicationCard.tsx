
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, User, Calendar, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Application } from '../hooks/useApplications';
import { ScreeningResult } from '../hooks/useScreeningResults';
import { supabase } from '@/integrations/supabase/client';

interface ApplicationCardProps {
  application: Application;
  screeningResult?: ScreeningResult;
  getStatusColor: (status: string) => string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, screeningResult, getStatusColor }) => {
  const handleDownloadResume = async () => {
    if (application.resume_url) {
      try {
        // Extract file path from URL
        const url = new URL(application.resume_url);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'company_uploads');
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          
          // Generate fresh signed URL
          const { data, error } = await supabase.storage
            .from('company_uploads')
            .createSignedUrl(filePath, 3600); // 1 hour expiry
          
          if (error) {
            console.error('Error generating signed URL:', error);
            // Fallback to original URL
            window.open(application.resume_url, '_blank');
            return;
          }
          
          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = data.signedUrl;
          link.download = `${screeningResult ? `${screeningResult.first_name} ${screeningResult.last_name}` : application.original_filename || 'Resume'}_Resume.pdf`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Fallback for other URL formats
          window.open(application.resume_url, '_blank');
        }
      } catch (error) {
        console.error('Error handling resume download:', error);
        // Fallback to original URL
        window.open(application.resume_url, '_blank');
      }
    }
  };

  const handleEmailCandidate = () => {
    if (screeningResult?.email) {
      const subject = encodeURIComponent('Regarding your job application');
      const body = encodeURIComponent(`Dear ${screeningResult.first_name} ${screeningResult.last_name},\n\nThank you for your interest in our position.\n\nBest regards,`);
      window.open(`mailto:${screeningResult.email}?subject=${subject}&body=${body}`);
    }
  };

  const getProcessingStatusIcon = () => {
    if (!application.uploaded_by_user_id) return null;
    
    if (screeningResult) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <Upload className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProcessingStatusBadge = () => {
    if (!application.uploaded_by_user_id) return null;
    
    if (screeningResult) {
      return <Badge variant="default" className="bg-green-100 text-green-800">AI Analysis Complete</Badge>;
    } else {
      return <Badge variant="outline">Pending Processing</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            {application.uploaded_by_user_id ? (
              <Upload className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <User className="h-5 w-5 mr-2 text-blue-600" />
            )}
            {screeningResult ? `${screeningResult.first_name} ${screeningResult.last_name}` : application.original_filename || 'Unknown Candidate'}
            {application.uploaded_by_user_id && (
              <span className="text-xs text-gray-500 ml-2">(Company Upload)</span>
            )}
          </CardTitle>
          <div className="flex flex-col items-end space-y-1">
            {screeningResult && (
              <Badge className={`${getStatusColor('pending')} border`}>
                Pending
              </Badge>
            )}
            {getProcessingStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {screeningResult?.email && (
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-sm">{screeningResult.email}</span>
            </div>
          )}
          {screeningResult?.phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">{screeningResult.phone}</span>
            </div>
          )}
          {application.original_filename && (
            <div className="flex items-center text-gray-600">
              <span className="text-sm text-gray-500">Original: {application.original_filename}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {screeningResult?.email && (
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
