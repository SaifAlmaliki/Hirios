import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface StatusManagementButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const StatusManagementButton: React.FC<StatusManagementButtonProps> = ({
  onClick,
  disabled = false
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 h-8 text-xs font-medium bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900"
      title="Manage candidate status and comments"
    >
      <User className="h-3 w-3" />
      Status
    </Button>
  );
};

export default StatusManagementButton;
