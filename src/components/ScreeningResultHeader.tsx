import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Mail,
  Briefcase,
  Calendar,
  Mic
} from 'lucide-react';

interface ScreeningResultHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  createdAt: string;
  phone?: string;
  overallFit: number;
}

const ScreeningResultHeader: React.FC<ScreeningResultHeaderProps> = ({
  firstName,
  lastName,
  email,
  jobTitle,
  createdAt,
  phone,
  overallFit
}) => {
  // Helper functions
  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score > 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Poor';
  };

  return (
    <div className="flex-1">
      {/* Name and Score Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-3 text-blue-600" />
          {firstName} {lastName}
        </h3>
        <Badge className={`${getScoreColor(overallFit)} border-0 px-3 py-1 w-fit`}>
          {overallFit}% - {getScoreLabel(overallFit)}
        </Badge>
      </div>
      
      {/* Contact Information Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 text-sm text-gray-600">
        {/* Email Column - Full width on mobile, 5/12 on desktop */}
        <div className="col-span-1 lg:col-span-5 flex items-center min-w-0">
          <Mail className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{email}</span>
        </div>
        
        {/* Job Title Column - Full width on mobile, 4/12 on desktop */}
        <div className="col-span-1 lg:col-span-4 flex items-center min-w-0">
          <Briefcase className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{jobTitle || 'No job linked'}</span>
        </div>
        
        {/* Phone Column - Full width on mobile, 3/12 on desktop */}
        <div className="col-span-1 lg:col-span-3 flex items-center min-w-0">
          <Mic className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{phone || 'No phone'}</span>
        </div>
      </div>
    </div>
  );
};

export default ScreeningResultHeader; 