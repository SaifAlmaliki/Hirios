import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  Clock, 
  Briefcase, 
  Edit, 
  Trash2, 
  Eye,
  Calendar
} from 'lucide-react';

interface JobCardProps {
  job: any;
  onViewDetail: (job: any) => void;
  onEdit: (job: any) => void;
  onDelete: (jobId: string) => void;
  onViewApplications: (jobId: string) => void;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewDetail,
  onEdit,
  onDelete,
  onViewApplications,
  className = ''
}) => {
  const formatEmploymentType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onViewDetail(job);
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {job.title}
                </h3>
                <div className="flex items-center text-blue-600 font-semibold mb-2">
                  <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{job.company}</span>
                </div>
              </div>
              
              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex space-x-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(job);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(job.id);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewApplications(job.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Job Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center min-w-0">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate" title={job.location}>{job.location}</span>
          </div>
          
          <div className="flex items-center min-w-0">
            <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate" title={job.department || 'N/A'}>
              {job.department || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{formatEmploymentType(job.employment_type)}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Posted {formatDate(job.created_at)}</span>
          </div>
        </div>

        {/* Employment Type Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {formatEmploymentType(job.employment_type)}
          </Badge>
          
          {/* Action Buttons - Mobile */}
          <div className="flex sm:hidden space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(job.id);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewApplications(job.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 