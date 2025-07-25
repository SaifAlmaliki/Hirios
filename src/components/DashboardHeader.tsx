import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  actionIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 ${className}`}>
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-blue-900">{title}</h2>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>
      
      <div className="flex-shrink-0">
        <Button 
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          <ActionIcon className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}; 