import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CandidateStatus, GlobalCandidateStatus } from '@/hooks/useCandidateStatus';
import { 
  Clock, 
  Eye, 
  Star, 
  UserCheck, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Gift, 
  UserX 
} from 'lucide-react';

interface StatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

interface GlobalStatusBadgeProps {
  globalStatus: GlobalCandidateStatus;
  className?: string;
  maxDisplay?: number; // Maximum number of statuses to display
}

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  screened: {
    label: 'Screened',
    variant: 'default' as const,
    icon: Eye,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  shortlisted: {
    label: 'Shortlisted',
    variant: 'default' as const,
    icon: Star,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  },
  first_interview: {
    label: '1st Interview',
    variant: 'default' as const,
    icon: UserCheck,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  second_interview: {
    label: '2nd Interview',
    variant: 'default' as const,
    icon: Users,
    className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    variant: 'default' as const,
    icon: Calendar,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  accepted: {
    label: 'Accepted',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  blocked: {
    label: 'Blocked',
    variant: 'destructive' as const,
    icon: Ban,
    className: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  offer_sent: {
    label: 'Offer Sent',
    variant: 'default' as const,
    icon: Gift,
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    variant: 'secondary' as const,
    icon: UserX,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1 text-xs font-medium`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// New component for displaying global status with job titles
export const GlobalStatusBadge: React.FC<GlobalStatusBadgeProps> = ({ 
  globalStatus, 
  className = '', 
  maxDisplay = 2 
}) => {
  if (!globalStatus.statuses || globalStatus.statuses.length === 0) {
    return <StatusBadge status="pending" className={className} />;
  }

  const displayStatuses = globalStatus.statuses.slice(0, maxDisplay);
  const hasMore = globalStatus.statuses.length > maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1 w-fit ${className}`}>
      {displayStatuses.map((statusInfo, index) => {
        const config = statusConfig[statusInfo.status];
        const Icon = config.icon;
        
        return (
          <Badge 
            key={`${statusInfo.job_id}-${statusInfo.status}`}
            variant={config.variant}
            className={`${config.className} flex items-center gap-1 text-xs font-medium whitespace-nowrap`}
            title={`${config.label} for ${statusInfo.job_title}`}
          >
            <Icon className="h-3 w-3" />
            {config.label} - {statusInfo.job_title}
          </Badge>
        );
      })}
      {hasMore && (
        <Badge 
          variant="secondary"
          className="bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1 text-xs font-medium whitespace-nowrap"
          title={`${globalStatus.statuses.length - maxDisplay} more statuses`}
        >
          +{globalStatus.statuses.length - maxDisplay} more
        </Badge>
      )}
    </div>
  );
};

export default StatusBadge;
