
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, User, Calendar } from 'lucide-react';
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            {application.full_name}
          </CardTitle>
          <Badge className={`${getStatusColor(application.status)} border`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span className="text-sm">{application.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-sm">{application.phone}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">Applied on {new Date(application.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEmailCandidate}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Mail className="h-4 w-4 mr-1" />
            Email Candidate
          </Button>
          
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
