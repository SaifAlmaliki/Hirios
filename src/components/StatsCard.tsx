import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  showProgress?: boolean;
  progressValue?: number;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'text-blue-600',
    value: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    icon: 'text-green-600',
    value: 'text-green-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    icon: 'text-yellow-600',
    value: 'text-yellow-600'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    icon: 'text-purple-600',
    value: 'text-purple-600'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: 'text-red-600',
    value: 'text-red-600'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  showProgress = false,
  progressValue = 0,
  className = ''
}) => {
  const colors = colorClasses[color];

  return (
    <Card className={`${colors.bg} ${colors.border} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colors.icon} flex-shrink-0`} />
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${colors.value}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        )}
        {showProgress && (
          <Progress value={progressValue} className="mt-2" />
        )}
      </CardContent>
    </Card>
  );
}; 