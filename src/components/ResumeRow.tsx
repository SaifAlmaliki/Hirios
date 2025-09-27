import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar,
  HardDrive,
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResumePoolItem } from '@/hooks/useResumePool';
import { GlobalStatusBadge } from '@/components/ui/StatusBadge';
import { GlobalCandidateStatus } from '@/hooks/useCandidateStatus';
import { normalizeSkills } from '@/lib/skillsUtils';
import { format } from 'date-fns';

interface ResumeRowProps {
  resume: ResumePoolItem;
  isSelected: boolean;
  onSelect: (resumeId: string, checked: boolean) => void;
  onDownload: (resume: ResumePoolItem) => void;
  onDelete: (resume: ResumePoolItem) => void;
  globalStatus?: GlobalCandidateStatus;
}

const ResumeRow: React.FC<ResumeRowProps> = ({
  resume,
  isSelected,
  onSelect,
  onDownload,
  onDelete,
  globalStatus
}) => {

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDisplayName = () => {
    if (resume.first_name && resume.last_name) {
      return `${resume.first_name} ${resume.last_name}`;
    }
    return resume.original_filename;
  };

  return (
    <div className="border rounded-lg hover:bg-gray-50 transition-colors p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(resume.id, checked as boolean)}
            className="flex-shrink-0 mt-1"
          />
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            {/* Name/Title and Status */}
            <div className="flex items-start gap-2 mb-2">
              <p className="text-sm font-medium text-gray-900 truncate" title={getDisplayName()}>
                {getDisplayName()}
              </p>
              <div className="flex-shrink-0">
                {globalStatus ? (
                  <GlobalStatusBadge 
                    globalStatus={globalStatus} 
                    maxDisplay={2}
                    className="text-xs"
                  />
                ) : (
                  <GlobalStatusBadge 
                    globalStatus={{
                      resume_pool_id: resume.id,
                      statuses: [],
                      highest_priority_status: 'pending'
                    }} 
                    maxDisplay={2}
                    className="text-xs"
                  />
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
              {resume.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{resume.email}</span>
                </div>
              )}
              {resume.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{resume.phone}</span>
                </div>
              )}
              {resume.home_address && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{resume.home_address}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {(() => {
              const normalizedSkills = normalizeSkills(resume.skills);
              return normalizedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {normalizedSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              );
            })()}

            {/* Basic Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{format(new Date(resume.created_at), 'MMM dd, yyyy')}</span>
              </span>
              <span className="flex items-center">
                <HardDrive className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{formatFileSize(resume.file_size)}</span>
              </span>
              {resume.resume_text && (
                <Badge variant="secondary" className="text-xs w-fit">
                  Text Extracted
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(resume)}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9 sm:p-2"
            title="Download resume"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9 sm:p-2" title="More actions">
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload(resume)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(resume)}
                className="text-red-600"
              >
                <MoreVertical className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ResumeRow;
