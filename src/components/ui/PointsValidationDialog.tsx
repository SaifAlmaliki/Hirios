import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Coins, AlertTriangle, ExternalLink } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';

interface PointsValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requiredPoints: number;
  actionDescription: string;
  isLoading?: boolean;
}

export const PointsValidationDialog: React.FC<PointsValidationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  requiredPoints,
  actionDescription,
  isLoading = false
}) => {
  const { points, hasEnoughPoints, formatPoints } = usePoints();
  const hasEnough = hasEnoughPoints(requiredPoints);

  const handleConfirm = () => {
    if (hasEnough) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasEnough ? (
              <Coins className="h-5 w-5 text-blue-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            {hasEnough ? 'Confirm Action' : 'Insufficient Points'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {hasEnough ? (
              <>
                <p>
                  This action will cost <strong>{formatPoints(requiredPoints)}</strong>.
                </p>
                <p>
                  <strong>Action:</strong> {actionDescription}
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current balance:</strong> {formatPoints(points)}<br />
                    <strong>After action:</strong> {formatPoints(points - requiredPoints)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p>
                  You need <strong>{formatPoints(requiredPoints)}</strong> to perform this action, 
                  but you only have <strong>{formatPoints(points)}</strong>.
                </p>
                <p>
                  <strong>Action:</strong> {actionDescription}
                </p>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Shortfall:</strong> {formatPoints(requiredPoints - points)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Need more points?</strong> Contact support at{' '}
                    <a 
                      href="mailto:support@idraq.com" 
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      support@idraq.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          {hasEnough && (
            <AlertDialogAction asChild>
              <Button 
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Processing...' : `Confirm (${formatPoints(requiredPoints)})`}
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PointsValidationDialog;
