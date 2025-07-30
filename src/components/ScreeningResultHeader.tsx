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
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-3 text-blue-600" />
          {firstName} {lastName}
        </h3>
        <Badge className={`${getScoreColor(overallFit)} border-0 px-3 py-1`}>
          {overallFit}% - {getScoreLabel(overallFit)}
        </Badge>
      </div>
      
      {/* Contact Information Grid - Custom Column Widths */}
      <div className="grid grid-cols-12 gap-6 text-sm text-gray-600">
        {/* Email Column - More space (4/12) */}
        <div className="col-span-4 flex items-center min-w-0">
          <Mail className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{email}</span>
        </div>
        
        {/* Job Title Column - Medium space (3/12) */}
        <div className="col-span-3 flex items-center min-w-0">
          <Briefcase className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{jobTitle || 'No job linked'}</span>
        </div>
        
        {/* Date Column - Less space (2/12) */}
        <div className="col-span-2 flex items-center min-w-0">
          <Calendar className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        
        {/* Phone Column - Less space (3/12) */}
        <div className="col-span-3 flex items-center min-w-0">
          <Mic className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
          <span className="truncate">{phone || 'No phone'}</span>
        </div>
      </div>
    </div>
  );
};

export default ScreeningResultHeader; 