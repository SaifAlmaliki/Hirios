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
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-3 text-blue-600" />
          {firstName} {lastName}
        </h3>
        <Badge className={`${getScoreColor(overallFit)} border-0 px-3 py-1`}>
          {overallFit}% - {getScoreLabel(overallFit)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-3 text-gray-500" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
          <span className="truncate">{jobTitle || 'No job linked'}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-3 text-gray-500" />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        {phone && (
          <div className="flex items-center">
            <Mic className="h-4 w-4 mr-3 text-gray-500" />
            <span className="truncate">{phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningResultHeader; 